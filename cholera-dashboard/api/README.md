# Random Forest Prediction API

Simple API for Random Forest model predictions.

## Quick Start

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start the API:
```bash
python rf_predict.py
```

Or use the batch file:
```bash
start_api.bat
```

## Endpoints

- `GET /health` - Check API and model status
- `POST /api/lstm/predict` - Single prediction (kept same endpoint for UI compatibility)
- `POST /api/lstm/forecast` - 14-day forecast (kept same endpoint for UI compatibility)

## Model

The API uses `random_forest_model.pkl` located in the parent Cholera folder.

## Dataset

Automatically loads `cholera_data3.csv` from the parent Cholera folder.

## Features

- ✅ Automatic dataset loading
- ✅ Historical sequence extraction
- ✅ Weather integration
- ✅ 14-day multi-step forecasting
- ✅ Predictions continue from last dataset date
- ✅ Simple and straightforward implementation

