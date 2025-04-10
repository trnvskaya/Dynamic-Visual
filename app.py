from flask import Flask, render_template, jsonify
import requests
from data_processing import load_limma_data, load_values_data, prepare_volcano_data, prepare_boxplot_data

app = Flask(__name__)

# Cache data to avoid repeated loading
DATA_CACHE = {}


@app.route('/')
def index():
    """Render the main page with the volcano plot."""
    return render_template('index.html')


@app.route('/api/volcano-data')
def volcano_data():
    """API endpoint to get volcano plot data."""
    if 'volcano_data' not in DATA_CACHE:
        limma_data = load_limma_data()
        DATA_CACHE['volcano_data'] = prepare_volcano_data(limma_data)

    return jsonify(DATA_CACHE['volcano_data'])


@app.route('/api/boxplot-data/<gene_symbol>')
def boxplot_data(gene_symbol):
    """API endpoint to get boxplot data for a specific gene."""
    if 'values_data' not in DATA_CACHE:
        DATA_CACHE['values_data'] = load_values_data()

    data = prepare_boxplot_data(DATA_CACHE['values_data'], gene_symbol)
    return jsonify(data)


@app.route('/api/gene-info/<gene_symbol>')
def gene_info(gene_symbol):
    """API endpoint to get publication information for a gene from MyGene.info."""
    # Query MyGene.info for gene ID
    query_url = f"https://mygene.info/v3/query?q=symbol:{gene_symbol}"
    response = requests.get(query_url)
    gene_data = response.json()

    if gene_data['hits']:
        gene_id = gene_data['hits'][0]['_id']

        # Get detailed gene information with publications
        gene_url = f"https://mygene.info/v3/gene/{gene_id}"
        gene_response = requests.get(gene_url)
        gene_detail = gene_response.json()

        # Extract publication information if available
        publications = []
        if 'generif' in gene_detail:
            for ref in gene_detail['generif']:
                if 'pubmed' in ref:
                    publications.append({
                        'title': ref.get('text', 'No title available'),
                        'url': f"https://pubmed.ncbi.nlm.nih.gov/{ref['pubmed']}"
                    })

        return jsonify({
            'gene_symbol': gene_symbol,
            'gene_id': gene_id,
            'publications': publications
        })

    return jsonify({'error': 'Gene not found'})


if __name__ == '__main__':
    app.run(debug=True)