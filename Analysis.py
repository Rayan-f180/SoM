import pandas as pd
import numpy as np






df = pd.read_csv('DATA.csv') # Make sure to adjust the path to your actual CSV file

# Spliting the Multi-Value Columns into Separate Columns
column_maps = {
    'Baseline Mood (Valence, Arousal, Anxiety, Focus)': ['Base_Valence', 'Base_Arousal', 'Base_Anxiety', 'Base_Focus'],

    'Mode 2 Hues': ['M2_Hue_Start', 'M2_Hue_End'],
    'Mode 4 Hues': ['M4_Hue_Start', 'M4_Hue_End'],
    'Mode 6 Hues': ['M6_Hue_Start', 'M6_Hue_End'],

    'Likert Mode 2': ['M2_LK_1', 'M2_LK_2', 'M2_LK_3', 'M2_LK_4', 'M2_LK_5', 'M2_LK_6', 'M2_LK_7', 'M2_LK_8'],
    'Likert Mode 4': ['M4_LK_1', 'M4_LK_2', 'M4_LK_3', 'M4_LK_4', 'M4_LK_5', 'M4_LK_6', 'M4_LK_7', 'M4_LK_8'],
    'Likert Mode 6': ['M6_LK_1', 'M6_LK_2', 'M6_LK_3', 'M6_LK_4', 'M6_LK_5', 'M6_LK_6', 'M6_LK_7', 'M6_LK_8'],

    'Post (Valence, Arousal, Anxiety, Focus)': ['Post_Valence', 'Post_Arousal', 'Post_Anxiety', 'Post_Focus'],
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

#  CLEANED DATAFRAME STRUCTURE:
#  BASELINE MOOD ----> 'Baseline_Valence', 'Baseline_Arousal', 'Baseline_Anxiety', 'Baseline_Focus'
#  MODE "x" HUES ----> 'MX_Hue_Start', 'MX_Hue_End' , Where X is the mode number (2, 4, 6)
#  LIKERT MODE "x" ----> 'MX_LK_1', 'MX_LK_2', 'MX_LK_3', 'MX_LK_4', 'MX_LK_5', 'MX_LK_6', 'MX_LK_7', 'MX_LK_8' , Where X is the mode number (2, 4, 6)
#  LK_1-LK_8 -------------> 1.Valence, 2.Arousal, 3.Anxiety, 4.Focus, 5.Emotional Tone, 6.Texture, 7.Intensity, 8.Complectity
#  POST MOOD ----> 'Post_Valence', 'Post_Arousal', 'Post_Anxiety', 'Post_Focus'



