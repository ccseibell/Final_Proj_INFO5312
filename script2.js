const width = 800, height = 500;


const svgTimeSeries = d3.select("#time-series-graph svg")
  .attr("width", width) 
  .attr("height", height) 
  .append("g")
  .attr("transform", `translate(50, 20)`); 

d3.csv("usLaborLAUS.csv").then(function(data) {
  
  data.forEach(function(d) {
      d.year = +d.year;
      d.value = +d.value;
  });

  //state
  const dataByState = d3.group(data, d => d.srd_text);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // X axis
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, width - 100]);
  svgTimeSeries.append("g")
    .attr("transform", `translate(0,${height - 40})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // Format the x-axis ticks as integer years

  // y axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height - 40, 0]);
  svgTimeSeries.append("g")
    .call(d3.axisLeft(y));

  // Draw the line for each state
  dataByState.forEach((values, key) => {
    svgTimeSeries.append("path")
        .datum(values)
        .attr("class", "line " + key.replace(/\s+/g, '-'))  // Same class scheme as geographic paths
        .attr("fill", "none")
        .attr("stroke", () => color(key))
        .attr("stroke-width", "1.5px")
        .attr("d", d3.line()
            .x(d => x(d.year))
            .y(d => y(d.value))
        );

    
  });
});



// Create the tooltip div
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("padding", "10px")
    .style("background-color", "white")
    .style("border", "1px solid #000")
    .style("border-radius", "5px");




// Load the geographic and unemployment data
d3.json("USA_geojson.json").then(function(geojsonData) {
    d3.csv("usLaborLAUS.csv").then(function(unemploymentData) {
        // Process unemployment data to find the average per state
        const unemploymentByState = d3.group(unemploymentData, d => d.srd_text);
        const averageUnemploymentByState = new Map();

        unemploymentByState.forEach((values, key) => {
            const average = d3.mean(values, v => +v.value); 
            averageUnemploymentByState.set(key, average);
        });

        // Add unemployment rate to GeoJSON
        geojsonData.features.forEach(function(d) {
            const stateName = d.properties.NAME;
            const average = averageUnemploymentByState.get(stateName);
            d.properties.unemployment = average;
        });

        const colorScale = d3.scaleSequential(d3.interpolateOrRd)
            .domain(d3.extent(geojsonData.features, d => d.properties.unemployment));

        
        const svg = d3.select("#geographic-plot svg");

        const projection = d3.geoAlbersUsa().fitSize([width, height], geojsonData);
        const path = d3.geoPath().projection(projection);

        // Draw each state with color based on unemployment rate
        const states = svg.selectAll(".state")
            .data(geojsonData.features)
            .enter().append("path")
            .attr("class", d => "state " + d.properties.NAME.replace(/\s+/g, '-'))  // Class name by state, spaces removed
            .attr("d", path)
            .style("fill", d => colorScale(d.properties.unemployment))
            .style("stroke", "#fff")
            .on("mouseover", function(event, d) {
                // Tooltip display
                tooltip.html(d.properties.NAME + ": " + d.properties.unemployment.toFixed(2) + "%")
                       .style("visibility", "visible")
                       .style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 28) + "px");
                
                // Highlight corresponding time series line
                d3.select("#time-series-graph svg").selectAll(".line." + d.properties.NAME.replace(/\s+/g, '-'))
                   .style("stroke-width", "8px");  // Bolden the line
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                tooltip.style("visibility", "hidden");
                
                // Reset the time series line style
                d3.select("#time-series-graph svg").selectAll(".line." + d.properties.NAME.replace(/\s+/g, '-'))
                   .style("stroke-width", "1.5px");  // Reset line width
            });
    });
});




