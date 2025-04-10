# Interactive Protein Activity Visualization

This web application allows users to interactively explore protein activity data through visualizations. It generates a volcano plot based on LIMMA differential expression results and displays boxplots comparing protein expression levels for selected genes.

## Features

- **Volcano Plot**: Visualizes adjusted p-values (`adj.P.Val`) vs. log fold change (`logFC`) from LIMMA output.
- **Interactive Boxplots**: Clicking on a gene in the volcano plot displays a boxplot comparing expression in young vs. old donors.
- **Clean UI**: Responsive and user-friendly layout built with Flask and Plotly.

## Requirements

- Flask
- pandas
- numpy
- plotly
- openpyxl (for reading Excel files)

You can install the dependencies using pip:

```bash
pip install -r requirements.txt
```

## Configuration

1. **Excel File Format**:
   - The LIMMA results should be in one sheet (e.g., "Sheet1") with columns: `adj.P.Val`, `logFC`, and a gene/protein identifier.
   - The boxplot data should be in a separate sheet (e.g., "S4A values") with expression levels per sample, categorized by group (young/old).

2. **File Location**:
   - Place the Excel file in a folder (e.g., `data/`) or specify its path in `app.py` where the file is read.

## Running the Application Locally

1. Clone the repository:

```bash
git clone https://github.com/trnvskaya/FlaskProject.git
cd protein-activity-visualization
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Launch the app:

```bash
flask run
```

4. Open your browser and visit:

```
http://127.0.0.1:5000
```

## Project Structure

```
├── app.py                     # Main Flask application
├── templates/
│   └── main_page.html        # HTML template
├── static/
│   └── css/
│       └── styles.css        # Stylesheet
   └── js/
│       └── main.js `         # Dynamic visualization  
├── data/
│   └── NIHMS1635539-supplement-1635539_Sup_tab_4.xlsx  # Source data
├── requirements.txt
└── README.md
```
