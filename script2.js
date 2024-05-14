const width = 800, height = 500;

const svgTimeSeries = d3.select("#time-series-graph svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(50, 20)`);

let allData;  // whole dtatset

// Load both
Promise.all([
  d3.csv("usLaborLAUS.csv"),
  d3.csv("CPI.csv")
]).then(function([unemploymentData, cpiData]) {
  allData = unemploymentData;  // Save all
  
  unemploymentData.forEach(function(d) {
    d.year = +d.year; 
    d.value = +d.value;
  });

  cpiData.forEach(function(d) {
    d.Year = +d.Year;
    d['Inflation Rate'] = +d['Inflation Rate'];
  });

  // Filter CPI data to start 1977end at 2019
  cpiData = cpiData.filter(d => d.Year <= 2019 && d.Year>=1977);
  
  const dataByState = d3.group(unemploymentData, d => d.srd_text);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // x
  const x = d3.scaleLinear()
    .domain(d3.extent(unemploymentData, d => d.year))
    .range([0, width - 100]);
  svgTimeSeries.append("g")
    .attr("transform", `translate(0,${height - 40})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    const y = d3.scaleLinear()
    .domain([0, d3.max(unemploymentData, d => d.value)])
    .range([height - 40, 0]);
svgTimeSeries.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y));

// Append the left y-axis title for Unemployment Rate
svgTimeSeries.append("text")
    .attr("class", "y axis-title")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -height / 2)
    .attr("dy", "1em")
    .text("Unemployment Rate (%)");

// y2 (right axis for CPI)
const y2 = d3.scaleLinear()
    .domain([d3.min(cpiData, d => d['Inflation Rate']), d3.max(cpiData, d => d['Inflation Rate'])])
    .range([height - 40, 0]);
svgTimeSeries.append("g")
    .attr("class", "y axis right")
    .attr("transform", `translate(${width - 100}, 0)`)
    .call(d3.axisRight(y2));

// Append the right y-axis title for CPI Inflation Rate
svgTimeSeries.append("text")
    .attr("class", "y axis-title right")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", width - 80)
    .attr("x", -height / 2)
    .attr("dy", "1em")
    .text("CPI Inflation Rate (%)");

  // draw the line for each state
  dataByState.forEach((values, key) => {
    svgTimeSeries.append("path")
        .datum(values)
        .attr("class", "line " + key.replace(/\s+/g, '-'))
        .attr("fill", "none")
        .attr("stroke", () => color(key))
        .attr("stroke-width", "1.5px")
        .attr("d", d3.line()
            .x(d => x(d.year))
            .y(d => y(d.value))
        );
  });

  //draw the CPI line
  svgTimeSeries.append("path")
    .datum(cpiData)
    .attr("class", "line cpi")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", "5px")  //  thick
    .attr("d", d3.line()
        .x(d => x(d.Year))
        .y(d => y2(d['Inflation Rate']))
    );

  //Populate dropdown 
  const select = d3.select("#state-select");
  select.append("option")
    .text("All States")
    .attr("value", "all-states");
  select.selectAll("option.state")
    .data(Array.from(dataByState.keys()))
    .enter().append("option")
    .classed("state", true)
    .text(d => d)
    .attr("value", d => d.replace(/\s+/g, '-'));

  //add event listener to the dropdown for filtering
  select.on("change", function(event) {
    const selectedValue = d3.select(this).property("value");
    if (selectedValue === "all-states") {
      updateGraph(allData, x, y, y2, color, cpiData);  // Show all
    } else {
      const selectedState = selectedValue.replace(/-/g, ' ');
      const filteredData = allData.filter(d => d.srd_text === selectedState);
      updateGraph(filteredData, x, y, y2, color, cpiData);  // Update the graph with filtered data
    }
  });
});

function updateGraph(filteredData, x, y, y2, color, cpiData) {
  // Clear the existing graph
  svgTimeSeries.selectAll("*").remove();

  
  svgTimeSeries.append("g")
    .attr("transform", `translate(0,${height - 40})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  svgTimeSeries.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y));
  svgTimeSeries.append("g")
    .attr("class", "y axis right")
    .attr("transform", `translate(${width - 100}, 0)`)
    .call(d3.axisRight(y2));

  
  const dataByState = d3.group(filteredData, d => d.srd_text);
  dataByState.forEach((values, key) => {
    svgTimeSeries.append("path")
        .datum(values)
        .attr("class", "line " + key.replace(/\s+/g, '-'))
        .attr("fill", "none")
        .attr("stroke", () => color(key))
        .attr("stroke-width", "1.5px")
        .attr("d", d3.line()
            .x(d => x(d.year))
            .y(d => y(d.value))
        );
  });

  // Append the right y-axis title for CPI Inflation Rate
    svgTimeSeries.append("text")
      .attr("class", "y axis-title right")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", width - 80)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .text("CPI Inflation Rate (%)");
    // Append the left y-axis title for Unemployment Rate
    svgTimeSeries.append("text")
      .attr("class", "y axis-title")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .text("Unemployment Rate (%)");

  // Redraw the CPI line
  svgTimeSeries.append("path")
    .datum(cpiData)
    .attr("class", "line cpi")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", "5px") 
    .attr("d", d3.line()
        .x(d => x(d.Year))
        .y(d => y2(d['Inflation Rate']))
    );
}

// Create the tooltip div
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("padding", "10px")
    .style("background-color", "white")
    .style("border", "1px solid #000")
    .style("border-radius", "5px");

d3.json("USA_geojson.json").then(function(geojsonData) {
  d3.csv("usLaborLAUS.csv").then(function(unemploymentData) {
    // Process unemployment data to find the average per state
    const unemploymentByState = d3.group(unemploymentData, d => d.srd_text);
    const averageUnemploymentByState = new Map();

    unemploymentByState.forEach((values, key) => {
      const average = d3.mean(values, v => +v.value);  
      averageUnemploymentByState.set(key, average);
    });

    // Unemployment rate
    geojsonData.features.forEach(function(d) {
      const stateName = d.properties.NAME;
      const average = averageUnemploymentByState.get(stateName);
      d.properties.unemployment = average;
    });

    // Color scale
    const colorScale = d3.scaleSequential(d3.interpolateOrRd)
      .domain(d3.extent(geojsonData.features, d => d.properties.unemployment));

    const svg = d3.select("#geographic-plot svg");

    const projection = d3.geoAlbersUsa().fitSize([width, height], geojsonData);
    const path = d3.geoPath().projection(projection);

    // Draw all based o color
    const states = svg.selectAll(".state")
      .data(geojsonData.features)
      .enter().append("path")
      .attr("class", d => "state " + d.properties.NAME.replace(/\s+/g, '-'))  // Name by state
      .attr("d", path)
      .style("fill", d => colorScale(d.properties.unemployment))
      .style("stroke", "#fff")
      .on("mouseover", function(event, d) {
        // Tooltip
        tooltip.html(d.properties.NAME + ": " + d.properties.unemployment.toFixed(2) + "%")
          .style("visibility", "visible")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");

        d3.select("#time-series-graph svg").selectAll(".line." + d.properties.NAME.replace(/\s+/g, '-'))
          .style("stroke-width", "8px");  // Bolden
      })
      .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(event, d) {
        tooltip.style("visibility", "hidden");

        // Reset the time series line style
        d3.select("#time-series-graph svg").selectAll(".line." + d.properties.NAME.replace(/\s+/g, '-'))
          .style("stroke-width", "1.5px");  // Reset 
      });
  });
});
