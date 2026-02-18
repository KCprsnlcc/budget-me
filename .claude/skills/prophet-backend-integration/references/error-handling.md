# Error Handling Strategies

**Priority**: MEDIUM  
**Category**: Error Handling  
**Impact**: Reliability and user experience

## Why It Matters

Prophet forecasting can fail in many ways:
- Insufficient data
- Invalid data formats
- Model training failures
- Resource constraints
- Network issues

Proper error handling provides graceful degradation and clear feedback.

## ❌ Incorrect: Generic Error Handling

```python
# BAD: Swallows all errors, no context
@app.post("/forecast")
async def forecast(request: ForecastRequest):
    try:
        model = Prophet()
        model.fit(data)
        return model.predict(future)
    except:
        return {"error": "Something went wrong"}
```

**Problems**:
- No error details
- Can't debug issues
- No recovery strategy
- Poor user experience

## ✅ Correct: Comprehensive Error Handling

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ValidationError
from prophet import Prophet
import pandas as pd
from typing import Optional
import logging
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ErrorCode(str, Enum):
    """Standardized error codes"""
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
    INVALID_DATA_FORMAT = "INVALID_DATA_FORMAT"
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD"
    MODEL_TRAINING_FAILED = "MODEL_TRAINING_FAILED"
    PREDICTION_FAILED = "PREDICTION_FAILED"
    CACHE_ERROR = "CACHE_ERROR"
    RESOURCE_EXHAUSTED = "RESOURCE_EXHAUSTED"
    INTERNAL_ERROR = "INTERNAL_ERROR"

class ForecastError(Exception):
    """Custom exception for forecast errors"""
    def __init__(self, code: ErrorCode, message: str, details: Optional[dict] = None):
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(message)

class ErrorResponse(BaseModel):
    """Structured error response"""
    error: str
    code: str
    details: Optional[dict] = None
    suggestion: Optional[str] = None

def handle_data_validation_error(data: list[dict]) -> pd.DataFrame:
    """Validate and clean data with detailed error messages"""
    try:
        df = pd.DataFrame(data)
        
        # Check required columns
        if 'ds' not in df.columns and 'date' not in df.columns:
            raise ForecastError(
                ErrorCode.MISSING_REQUIRED_FIELD,
                "Missing date column",
                {
                    "required_fields": ["ds or date"],
                    "provided_fields": list(df.columns)
                }
            )
        
        if 'y' not in df.columns and 'value' not in df.columns:
            raise ForecastError(
                ErrorCode.MISSING_REQUIRED_FIELD,
                "Missing value column",
                {
                    "required_fields": ["y or value"],
                    "provided_fields": list(df.columns)
                }
            )
        
        # Rename columns
        if 'date' in df.columns:
            df = df.rename(columns={'date': 'ds'})
        if 'value' in df.columns:
            df = df.rename(columns={'value': 'y'})
        
        # Convert types
        try:
            df['ds'] = pd.to_datetime(df['ds'])
        except Exception as e:
            raise ForecastError(
                ErrorCode.INVALID_DATA_FORMAT,
                "Invalid date format",
                {
                    "error": str(e),
                    "sample_dates": df['ds'].head(3).tolist(),
                    "expected_format": "ISO 8601 (YYYY-MM-DD)"
                }
            )
        
        try:
            df['y'] = pd.to_numeric(df['y'], errors='coerce')
        except Exception as e:
            raise ForecastError(
                ErrorCode.INVALID_DATA_FORMAT,
                "Invalid numeric values",
                {
                    "error": str(e),
                    "sample_values": df['y'].head(3).tolist()
                }
            )
        
        # Check for missing values
        missing_count = df[['ds', 'y']].isna().sum().sum()
        if missing_count > 0:
            df = df.dropna(subset=['ds', 'y'])
            logger.warning(f"Removed {missing_count} rows with missing values")
        
        # Check minimum data points
        if len(df) < 10:
            raise ForecastError(
                ErrorCode.INSUFFICIENT_DATA,
                f"Need at least 10 data points, got {len(df)}",
                {
                    "required": 10,
                    "provided": len(df),
                    "suggestion": "Collect more historical data before forecasting"
                }
            )
        
        # Check date range
        date_range_days = (df['ds'].max() - df['ds'].min()).days
        if date_range_days < 14:
            raise ForecastError(
                ErrorCode.INSUFFICIENT_DATA,
                f"Date range too short: {date_range_days} days",
                {
                    "minimum_days": 14,
                    "provided_days": date_range_days,
                    "date_range": {
                        "start": df['ds'].min().isoformat(),
                        "end": df['ds'].max().isoformat()
                    }
                }
            )
        
        return df[['ds', 'y']]
        
    except ForecastError:
        raise
    except Exception as e:
        raise ForecastError(
            ErrorCode.INVALID_DATA_FORMAT,
            "Data validation failed",
            {"error": str(e)}
        )

@app.post("/forecast")
async def create_forecast(request: ForecastRequest):
    """Generate forecast with comprehensive error handling"""
    try:
        # Validate and preprocess data
        df = handle_data_validation_error(request.data)
        
        # Train model with timeout
        try:
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=False
            )
            
            # Catch Prophet-specific errors
            model.fit(df)
            
        except ValueError as e:
            # Prophet raises ValueError for various issues
            error_msg = str(e).lower()
            
            if "dataframe" in error_msg:
                raise ForecastError(
                    ErrorCode.INVALID_DATA_FORMAT,
                    "Prophet data format error",
                    {"prophet_error": str(e)}
                )
            elif "seasonality" in error_msg:
                raise ForecastError(
                    ErrorCode.MODEL_TRAINING_FAILED,
                    "Seasonality configuration error",
                    {"prophet_error": str(e)}
                )
            else:
                raise ForecastError(
                    ErrorCode.MODEL_TRAINING_FAILED,
                    "Model training failed",
                    {"prophet_error": str(e)}
                )
        
        # Generate predictions
        try:
            future = model.make_future_dataframe(periods=request.periods)
            forecast = model.predict(future)
        except Exception as e:
            raise ForecastError(
                ErrorCode.PREDICTION_FAILED,
                "Prediction generation failed",
                {"error": str(e)}
            )
        
        # Format response
        result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(request.periods)
        
        return {
            "forecast": result.to_dict('records'),
            "metadata": {
                "model_id": request.model_id,
                "data_points": len(df),
                "periods": request.periods
            }
        }
        
    except ForecastError as e:
        logger.error(f"Forecast error: {e.code} - {e.message}", extra=e.details)
        
        # Map to HTTP status codes
        status_map = {
            ErrorCode.INSUFFICIENT_DATA: 400,
            ErrorCode.INVALID_DATA_FORMAT: 400,
            ErrorCode.MISSING_REQUIRED_FIELD: 400,
            ErrorCode.MODEL_TRAINING_FAILED: 422,
            ErrorCode.PREDICTION_FAILED: 500,
            ErrorCode.RESOURCE_EXHAUSTED: 503,
        }
        
        status_code = status_map.get(e.code, 500)
        
        raise HTTPException(
            status_code=status_code,
            detail=ErrorResponse(
                error=e.message,
                code=e.code.value,
                details=e.details,
                suggestion=get_error_suggestion(e.code)
            ).dict()
        )
        
    except Exception as e:
        logger.exception("Unexpected error in forecast")
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                error="Internal server error",
                code=ErrorCode.INTERNAL_ERROR.value,
                details={"error": str(e)},
                suggestion="Please contact support if this persists"
            ).dict()
        )

def get_error_suggestion(code: ErrorCode) -> str:
    """Get helpful suggestion for error code"""
    suggestions = {
        ErrorCode.INSUFFICIENT_DATA: "Collect at least 10 data points spanning 2+ weeks",
        ErrorCode.INVALID_DATA_FORMAT: "Ensure dates are ISO format and values are numeric",
        ErrorCode.MISSING_REQUIRED_FIELD: "Include 'ds' (date) and 'y' (value) fields",
        ErrorCode.MODEL_TRAINING_FAILED: "Check data quality and try with different parameters",
        ErrorCode.PREDICTION_FAILED: "Verify model trained successfully",
        ErrorCode.RESOURCE_EXHAUSTED: "Try again later or reduce forecast periods"
    }
    return suggestions.get(code, "Check API documentation for details")

@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    """Handle Pydantic validation errors"""
    return HTTPException(
        status_code=422,
        detail=ErrorResponse(
            error="Request validation failed",
            code="VALIDATION_ERROR",
            details={"errors": exc.errors()}
        ).dict()
    )
```

## Error Response Examples

```json
// Insufficient data
{
  "error": "Need at least 10 data points, got 5",
  "code": "INSUFFICIENT_DATA",
  "details": {
    "required": 10,
    "provided": 5
  },
  "suggestion": "Collect more historical data before forecasting"
}

// Invalid date format
{
  "error": "Invalid date format",
  "code": "INVALID_DATA_FORMAT",
  "details": {
    "sample_dates": ["2024-13-01", "invalid", "2024-01-03"],
    "expected_format": "ISO 8601 (YYYY-MM-DD)"
  },
  "suggestion": "Ensure dates are ISO format and values are numeric"
}
```

## Client-Side Error Handling

```typescript
// app/api/forecast/route.ts
try {
  const response = await fetch(FORECAST_SERVICE_URL, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    // Handle specific error codes
    switch (error.code) {
      case 'INSUFFICIENT_DATA':
        return Response.json({
          error: 'Not enough data to forecast',
          suggestion: 'Add more transactions to get predictions'
        }, { status: 400 });
        
      case 'INVALID_DATA_FORMAT':
        logger.error('Data format error:', error.details);
        return Response.json({
          error: 'Data processing error',
          suggestion: 'Please try again'
        }, { status: 500 });
        
      default:
        return Response.json({
          error: 'Forecast unavailable',
          suggestion: 'Please try again later'
        }, { status: 500 });
    }
  }
  
  return response.json();
  
} catch (error) {
  logger.error('Forecast request failed:', error);
  return Response.json({
    error: 'Service unavailable',
    suggestion: 'Please try again later'
  }, { status: 503 });
}
```

## Best Practices

1. **Use specific error codes**: Enable client-side handling
2. **Include context**: Help debugging with details
3. **Provide suggestions**: Guide users to fix issues
4. **Log appropriately**: Different levels for different errors
5. **Fail gracefully**: Return partial results when possible
6. **Set timeouts**: Prevent hanging requests
7. **Monitor errors**: Track error rates and patterns
