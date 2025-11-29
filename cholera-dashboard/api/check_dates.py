import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_DATA_PATH = os.path.join(BASE_DIR, 'cholera_data3.csv')

df = pd.read_csv(CSV_DATA_PATH)

# Parse dates
def parse_date(date_str):
    if pd.isna(date_str):
        return None
    date_str = str(date_str).strip()
    if '/' in date_str:
        parts = date_str.split('/')
        if len(parts) == 3:
            try:
                day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
                return pd.Timestamp(year, month, day)
            except:
                pass
    try:
        return pd.to_datetime(date_str)
    except:
        return None

df['reporting_date'] = df['reporting_date'].apply(parse_date)
df = df.dropna(subset=['reporting_date'])
df = df.sort_values('reporting_date')

print(f"Dataset date range: {df['reporting_date'].min()} to {df['reporting_date'].max()}")
print(f"\nLast date in dataset: {df['reporting_date'].max()}")
print(f"Last 10 dates with cases:")
last_dates = df.groupby('reporting_date').agg({'sCh': 'sum', 'cCh': 'sum'}).tail(10)
print(last_dates)

