# Import necessary packages
from azureml.opendatasets import UsLaborLAUS
import pandas as pd  # Ensure pandas is imported if used directly

# Create an instance of UsLaborLAUS
usLaborLAUS = UsLaborLAUS()

# Load the data into a pandas DataFrame
usLaborLAUS_df = usLaborLAUS.to_pandas_dataframe()

# Correct the DataFrame filtering to use the correct DataFrame variable
usLaborLAUS_df = usLaborLAUS_df.loc[usLaborLAUS_df['measure_text'] == 'unemployment rate']

grouped_df = usLaborLAUS_df.groupby(['srd_text', 'year'])['value'].mean()

# Reset the index to turn the resulting Series back into a DataFrame
grouped_df = grouped_df.reset_index()

# Save the filtered DataFrame to a CSV file
grouped_df.to_csv('usLaborLAUS.csv', index=False)
