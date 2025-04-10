let selectedGene = null;

// Load the volcano plot data and create the plot
async function loadVolcanoPlot() {
    try {
        const response = await fetch('/api/volcano-data');
        const data = await response.json();
        createVolcanoPlot(data);
    } catch (error) {
        console.error('Error loading volcano plot data:', error);
    }
}

// Create the volcano plot using Plotly
function createVolcanoPlot(data) {
    const significantPoints = data.points.filter(p => p.significant);
    const nonsignificantPoints = data.points.filter(p => !p.significant);

    // Create traces for significant and non-significant points
    const traces = [
        {
            x: nonsignificantPoints.map(p => p.logFC),
            y: nonsignificantPoints.map(p => p.neg_log10_pval),
            text: nonsignificantPoints.map(p => p.gene_symbol),
            mode: 'markers',
            type: 'scatter',
            name: 'Not Significant',
            marker: {
                color: 'gray',
                size: 8,
                opacity: 0.7
            },
            hoverinfo: 'text+x+y',
            hovertemplate: '<b>%{text}</b><br>log<sub>2</sub>FC: %{x:.3f}<br>-log<sub>10</sub>(adj.P.Val): %{y:.3f}<extra></extra>'
        },
        {
            x: significantPoints.map(p => p.logFC),
            y: significantPoints.map(p => p.neg_log10_pval),
            text: significantPoints.map(p => p.gene_symbol),
            mode: 'markers',
            type: 'scatter',
            name: 'Significant',
            marker: {
                color: 'red',
                size: 10,
                opacity: 0.8
            },
            hoverinfo: 'text+x+y',
            hovertemplate: '<b>%{text}</b><br>log<sub>2</sub>FC: %{x:.3f}<br>-log<sub>10</sub>(adj.P.Val): %{y:.3f}<extra></extra>'
        }
    ];

    // Layout configuration for the volcano plot
    const layout = {
        title: 'Protein Activity: Volcano Plot',
        xaxis: {
            title: 'log<sub>2</sub> Fold Change',
            zeroline: true,
            zerolinecolor: '#666',
            gridcolor: '#ddd'
        },
        yaxis: {
            title: '-log<sub>10</sub> Adjusted P-Value',
            zeroline: true,
            zerolinecolor: '#666',
            gridcolor: '#ddd'
        },
        hovermode: 'closest',
        legend: {
            x: 0.95,
            y: 0.95
        },
        shapes: [
            // Horizontal line for p-value cutoff
            {
                type: 'line',
                x0: Math.min(...data.points.map(p => p.logFC)),
                x1: Math.max(...data.points.map(p => p.logFC)),
                y0: -Math.log10(0.05),
                y1: -Math.log10(0.05),
                line: {
                    color: 'rgba(0, 0, 0, 0.5)',
                    width: 1,
                    dash: 'dash'
                }
            },
            // Vertical lines for fold change cutoffs
            {
                type: 'line',
                x0: 1,
                x1: 1,
                y0: 0,
                y1: Math.max(...data.points.map(p => p.neg_log10_pval)),
                line: {
                    color: 'rgba(0, 0, 0, 0.5)',
                    width: 1,
                    dash: 'dash'
                }
            },
            {
                type: 'line',
                x0: -1,
                x1: -1,
                y0: 0,
                y1: Math.max(...data.points.map(p => p.neg_log10_pval)),
                line: {
                    color: 'rgba(0, 0, 0, 0.5)',
                    width: 1,
                    dash: 'dash'
                }
            }
        ]
    };

    // Config for the plot
    const config = {
        responsive: true
    };

    // Create the plot
    Plotly.newPlot('volcano-plot', traces, layout, config);

    // Add click event to points
    document.getElementById('volcano-plot').on('plotly_click', function(data) {
        const point = data.points[0];
        const geneSymbol = point.text;
        selectedGene = geneSymbol;

        // Update info display
        document.getElementById('volcano-info').innerHTML = `
            <p><strong>Selected Protein:</strong> ${geneSymbol}</p>
            <p>log<sub>2</sub> Fold Change: ${point.x.toFixed(3)}</p>
            <p>Adjusted P-Value: ${Math.pow(10, -point.y).toExponential(3)}</p>
        `;

        // Load boxplot and gene information for the selected gene
        loadBoxplot(geneSymbol);
        loadGeneInfo(geneSymbol);
    });
}

// Load and create boxplot for the selected gene
async function loadBoxplot(geneSymbol) {
    try {
        const response = await fetch(`/api/boxplot-data/${geneSymbol}`);
        const data = await response.json();

        if (data.error) {
            document.getElementById('boxplot').innerHTML = `<p class="error">${data.error}</p>`;
            return;
        }
        createBoxplot(data);
    } catch (error) {
        console.error('Error loading boxplot data:', error);
    }
}

// Create boxplot using Plotly
function createBoxplot(data) {
    const traces = [
        {
            y: data.young.values,
            x: Array(data.young.values.length).fill('Young'),
            name: 'Young',
            type: 'box',
            boxpoints: 'all',
            jitter: 0.3,
            pointpos: 0,
            marker: {
                color: 'rgba(8, 81, 156, 0.6)',
                size: 8
            },
            boxmean: true
        },
        {
            y: data.old.values,
            x: Array(data.old.values.length).fill('Old'),
            name: 'Old',
            type: 'box',
            boxpoints: 'all',
            jitter: 0.3,
            pointpos: 0,
            marker: {
                color: 'rgba(219, 64, 82, 0.6)',
                size: 8
            },
            boxmean: true
        }
    ];

    const layout = {
        title: `Protein Expression: ${data.gene_symbol}`,
        yaxis: {
            title: 'Expression Level',
            zeroline: false
        },
        boxmode: 'group'
    };

    // Config for the plot
    const config = {
        responsive: true
    };

    // Create the plot
    Plotly.newPlot('boxplot', traces, layout, config);
}

// Load gene information and related publications
async function loadGeneInfo(geneSymbol) {
    try {
        const response = await fetch(`/api/gene-info/${geneSymbol}`);
        const data = await response.json();

        let html = `<h3>${geneSymbol}</h3>`;

        if (data.error) {
            html += `<p class="error">${data.error}</p>`;
        } else if (data.publications && data.publications.length > 0) {
            html += '<h4>Related Publications:</h4><ul>';

            data.publications.forEach(pub => {
                html += `
                    <li>
                        <a href="${pub.url}" target="_blank" rel="noopener noreferrer">
                            ${pub.title}
                        </a>
                    </li>
                `;
            });

            html += '</ul>';
        } else {
            html += '<p>No publications found for this gene.</p>';
        }

        document.getElementById('gene-info').innerHTML = html;
    } catch (error) {
        console.error('Error loading gene information:', error);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadVolcanoPlot();
});