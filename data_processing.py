import pandas as pd
import numpy as np
import os


def load_limma_data():
    file_path = os.path.join('data', 'NIHMS1635539-supplement-1635539_Sup_tab_4.xlsx')
    df = pd.read_excel(file_path, sheet_name='S4B limma results', header=2)
    return df


def load_values_data():
    file_path = os.path.join('data', 'NIHMS1635539-supplement-1635539_Sup_tab_4.xlsx')
    df = pd.read_excel(file_path, sheet_name='S4A values', header=2)
    return df


def prepare_volcano_data(limma_df):
    data = {
        'points': []
    }

    for _, row in limma_df.iterrows():
        point = {
            'gene_symbol': row['EntrezGeneSymbol'],
            'logFC': float(row['logFC']),
            'neg_log10_pval': -np.log10(float(row['adj.P.Val'])),
            'significant': row['adj.P.Val'] < 0.05 and abs(row['logFC']) > 1
        }
        data['points'].append(point)

    return data


def prepare_boxplot_data(values_df, gene_symbol):
    gene_row = values_df[values_df['EntrezGeneSymbol'] == gene_symbol]
    if gene_row.empty:
        return {'error': f'Gene {gene_symbol} not found'}

    sample_cols = [col for col in values_df.columns if col.startswith('Set')]

    young_cols = [col for col in sample_cols if 'YD' in col]
    old_cols = [col for col in sample_cols if 'OD' in col]

    young_values = gene_row[young_cols].values.flatten().tolist()
    old_values = gene_row[old_cols].values.flatten().tolist()

    return {
        'gene_symbol': gene_symbol,
        'young': {
            'group': 'Young',
            'values': young_values,
            'mean': np.mean(young_values),
            'std': np.std(young_values)
        },
        'old': {
            'group': 'Old',
            'values': old_values,
            'mean': np.mean(old_values),
            'std': np.std(old_values)
        }
    }