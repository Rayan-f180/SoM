import pandas as pd
import numpy as np



script_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(script_dir, 'SoM Project Data(150426).csv')

df = pd.read_csv(file_path)

# Define the labels for the multi-value columns based on your survey design
column_maps = {
    'Baseline Mood (Valence, Arousal, Anxiety, Focus)': ['Base_Valence', 'Base_Arousal', 'Base_Anxiety', 'Base_Focus'],
    'Post (Valence, Arousal, Anxiety, Focus)': ['Post_Valence', 'Post_Arousal', 'Post_Anxiety', 'Post_Focus'],
    # You can add maps for the Likert scales (Q1, Q2, Q3...) here as well
}

def expand_columns(df, column_maps):
    for col, new_names in column_maps.items():
        # 1. Split the string into a list of integers
        split_data = df[col].str.split(',').apply(lambda x: [int(i) for i in x] if isinstance(x, list) else [])
        
        # 2. Create new columns from that list
        expanded_cols = pd.DataFrame(split_data.tolist(), index=df.index, columns=new_names)
        
        # 3. Join back to main dataframe and drop the original messy column
        df = pd.concat([df, expanded_cols], axis=1).drop(columns=[col])
    return df

df_cleaned = expand_columns(df, column_maps)

# Accessing a specific value is now easy:
print(df_cleaned)