# Data Preprocessing for Prophet

**Priority**: CRITICAL  
**Category**: Data Pipeline  
**Impact**: Model accuracy and reliability

## Why It Matters

Prophet requires clean, properly formatted time-series data. Poor preprocessing leads to:
- Inaccurate forecasts
- Model training failures
- Runtime errors
- Poor performance

## ❌ Incorrect: Raw Data to Prophet

```python
# BAD: No validation or cleaning
@app.post("/forecast")
async def forecast(request: ForecastRequest):
    df = pd.DataFrame(request.data)
    model = Prophet()
    model.fit(df)  # Will fail or produce bad results
    # ...
```

**Problems**:
- Missing required columns ('ds', 'y')
- Wrong data types
- Missing values not handled
- Outliers not detected
- Duplicate timestamps
- Irregular intervals

## ✅ Correct: Comprehensive Preprocessing

```python
from prophet import Prophet
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from fastapi import HTTPException

def preprocess_for_prophet(data: list[dict], min_points: int = 10) -> pd.DataFrame:
    """
    Prepare time-series data for Prophet forecasting
    
    Args:
        data: List of dicts with date and value
        min_points: Minimum required data points
    
    Returns:
        Cleaned DataFrame with 'ds' and 'y' columns
    """
    
    # 1. Convert to DataFrame
    df = pd.DataFrame(data)
    
    # 2. Validate required fields
    if 'date' not in df.columns and 'ds' not in df.columns:
        raise HTTPException(400, "Missing 'date' or 'ds' column")
    
    if 'value' not in df.columns and 'y' not in df.columns:
        raise HTTPException(400, "Missing 'value' or 'y' column")
    
    # 3. Rename to Prophet format
    if 'date' in df.columns:
        df = df.rename(columns={'date': 'ds'})
    if 'value' in df.columns:
        df = df.rename(columns={'value': 'y'})
    
    # 4. Convert date column to datetime
    try:
        df['ds'] = pd.to_datetime(df['ds'])
    except Exception as e:
        raise HTTPException(400, f"Invalid date format: {str(e)}")
    
    # 5. Convert value to numeric
    df['y'] = pd.to_numeric(df['y'], errors='coerce')
    
    # 6. Remove rows with missing values
    initial_count = len(df)
    df = df.dropna(subset=['ds', 'y'])
    if len(df) < initial_count:
        print(f"Removed {initial_count - len(df)} rows with missing values")
    
    # 7. Check minimum data points
    if len(df) < min_points:
        raise HTTPException(
            400, 
            f"Insufficient data: need at least {min_points} points, got {len(df)}"
        )
    
    # 8. Sort by date
    df = df.sort_values('ds').reset_index(drop=True)
    
    # 9. Remove duplicate timestamps (keep last)
    df = df.drop_duplicates(subset=['ds'], keep='last')
    
    # 10. Handle outliers (optional but recommended)
    df = remove_outliers(df, threshold=3.0)
    
    # 11. Fill gaps in time series (optional)
    df = fill_time_gaps(df)
    
    return df[['ds', 'y']]

def remove_outliers(df: pd.DataFrame, threshold: float = 3.0) -> pd.DataFrame:
    """Remove statistical outliers using z-score"""
    z_scores = np.abs((df['y'] - df['y'].mean()) / df['y'].std())
    outlier_mask = z_scores > threshold
    
    if outlier_mask.any():
        print(f"Removing {outlier_mask.sum()} outliers")
        df = df[~outlier_mask].copy()
    
    return df

def fill_time_gaps(df: pd.DataFrame, freq: str = 'D') -> pd.DataFrame:
    """
    Fill gaps in time series with interpolation
    
    Args:
        df: DataFrame with 'ds' and 'y'
        freq: Frequency ('D' for daily, 'W' for weekly, 'M' for monthly)
    """
    # Create complete date range
    date_range = pd.date_range(
        start=df['ds'].min(),
        end=df['ds'].max(),
        freq=freq
    )
    
    # Reindex and interpolate
    df = df.set_index('ds').reindex(date_range)
    df['y'] = df['y'].interpolate(method='linear')
    df = df.reset_index().rename(columns={'index': 'ds'})
    
    return df

# Usage in API endpoint
@app.post("/forecast")
async def create_forecast(request: ForecastRequest):
    try:
        # Preprocess data
        df = preprocess_for_prophet(request.data, min_points=10)
        
        # Additional validation
        validate_time_series(df)
        
        # Train model
        model = Prophet(
            yearly_seasonality='auto',
            weekly_seasonality='auto',
            daily_seasonality=False
        )
        model.fit(df)
        
        # Generate forecast
        future = model.make_future_dataframe(periods=request.periods)
        forecast = model.predict(future)
        
        return format_forecast_response(forecast, request.periods)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Forecast failed: {str(e)}")

def validate_time_series(df: pd.DataFrame):
    """Additional validation checks"""
    
    # Check for negative values (if not allowed)
    if (df['y'] < 0).any():
        raise HTTPException(400, "Negative values not allowed")
    
    # Check date range
    date_range = (df['ds'].max() - df['ds'].min()).days
    if date_range < 14:
        raise HTTPException(400, "Need at least 2 weeks of data")
    
    # Check for constant values
    if df['y'].nunique() == 1:
        raise HTTPException(400, "All values are identical")
    
    # Check variance
    if df['y'].std() == 0:
        raise HTTPException(400, "No variance in data")
```

## Data Quality Checklist

Before training Prophet:

- [ ] Dates are in datetime format
- [ ] Values are numeric
- [ ] No missing values in 'ds' or 'y'
- [ ] At least 10-14 data points
- [ ] Dates are sorted chronologically
- [ ] No duplicate timestamps
- [ ] Outliers handled appropriately
- [ ] Time gaps filled (if needed)
- [ ] Sufficient variance in data
- [ ] Date range covers meaningful period

## Common Data Issues

| Issue | Detection | Solution |
|-------|-----------|----------|
| Missing dates | Check date continuity | Interpolate or forward-fill |
| Outliers | Z-score > 3 | Remove or cap values |
| Duplicates | `df.duplicated()` | Keep last or aggregate |
| Wrong frequency | Irregular intervals | Resample to fixed frequency |
| Insufficient data | `len(df) < 10` | Request more historical data |

## Performance Impact

- Proper preprocessing: 50-100ms overhead
- Prevents model failures: Saves 2-5s retry time
- Better accuracy: 10-30% improvement in MAPE
