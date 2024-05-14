import pandas as pd

file_path = 'inflation_data.csv'
cpi_df = pd.read_csv(file_path)

print(cpi_df.head())


cpi_df['Inflation Rate'] = cpi_df['Annual'].pct_change() * 100


print(cpi_df[['Year', 'Annual', 'Inflation Rate']])

cpi_df.to_csv('CPI.csv', index=False)