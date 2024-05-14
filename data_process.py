
from azureml.opendatasets import UsLaborLAUS
import pandas as pd ]


usLaborLAUS = UsLaborLAUS()


usLaborLAUS_df = usLaborLAUS.to_pandas_dataframe()

usLaborLAUS_df = usLaborLAUS_df.loc[usLaborLAUS_df['measure_text'] == 'unemployment rate']

grouped_df = usLaborLAUS_df.groupby(['srd_text', 'year'])['value'].mean()

grouped_df = grouped_df.reset_index()

grouped_df.to_csv('usLaborLAUS.csv', index=False)
