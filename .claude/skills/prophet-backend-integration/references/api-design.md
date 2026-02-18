# API Design for Prophet Forecasting

**Priority**: HIGH  
**Category**: API Design  
**Impact**: Developer experience and integration ease

## Why It Matters

Well-designed forecast APIs provide:
- Clear request/response contracts
- Proper error handling
- Flexible configuration
- Easy integration

## ❌ Incorrect: Unclear API Contract

```python
# BAD: Vague endpoint, unclear parameters
@app.post("/predict")
async def predict(data: dict):
    # What format? What's required?
    result = do_forecast(data)
    return result  # What structure?
```

**Problems**:
- No type validation
- Unclear required fields
- No error messages
- Unpredictable response format

## ✅ Correct: Well-Defined REST API

```python
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from datetime import datetime
import pandas as pd

app = FastAPI(
    title="Prophet Forecast API",
    version="1.0.0",
    description="Time-series forecasting using Facebook Prophet"
)

# Request Models
class DataPoint(BaseModel):
    """Single time-series data point"""
    ds: str = Field(..., description="Date in ISO format (YYYY-MM-DD)")
    y: float = Field(..., description="Numeric value to forecast")
    
    @validator('ds')
    def validate_date(cls, v):
        try:
            datetime.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError('Date must be in ISO format (YYYY-MM-DD)')

class ForecastRequest(BaseModel):
    """Forecast request parameters"""
    data: list[DataPoint] = Field(
        ..., 
        min_items=10,
        description="Historical time-series data (minimum 10 points)"
    )
    periods: int = Field(
        30, 
        ge=1, 
        le=365,
        description="Number of periods to forecast (1-365)"
    )
    frequency: Literal['D', 'W', 'M'] = Field(
        'D',
        description="Forecast frequency: D=daily, W=weekly, M=monthly"
    )
    model_id: str = Field(
        "default",
        description="Unique identifier for model caching"
    )
    include_history: bool = Field(
        False,
        description="Include historical data in response"
    )
    confidence_interval: float = Field(
        0.95,
        ge=0.5,
        le=0.99,
        description="Confidence interval width (0.5-0.99)"
    )

# Response Models
class ForecastPoint(BaseModel):
    """Single forecast point"""
    ds: str = Field(..., description="Forecast date")
    yhat: float = Field(..., description="Predicted value")
    yhat_lower: float = Field(..., description="Lower confidence bound")
    yhat_upper: float = Field(..., description="Upper confidence bound")

class ForecastMetadata(BaseModel):
    """Forecast metadata"""
    model_id: str
    periods: int
    frequency: str
    data_points_used: int
    training_time_ms: Optional[float]
    cache_hit: bool
    generated_at: str

class ForecastResponse(BaseModel):
    """Complete forecast response"""
    forecast: list[ForecastPoint]
    metadata: ForecastMetadata
    history: Optional[list[DataPoint]] = None

class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    detail: Optional[str] = None
    code: str

# Endpoints
@app.post(
    "/api/v1/forecast",
    response_model=ForecastResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        500: {"model": ErrorResponse, "description": "Server error"}
    },
    summary="Generate time-series forecast",
    description="Generate Prophet forecast from historical data"
)
async def create_forecast(request: ForecastRequest):
    """
    Generate a time-series forecast using Facebook Prophet.
    
    **Requirements:**
    - Minimum 10 historical data points
    - Dates in ISO format (YYYY-MM-DD)
    - Numeric values only
    
    **Returns:**
    - Forecast predictions with confidence intervals
    - Metadata about the forecast
    - Optional historical data
    """
    try:
        start_time = datetime.now()
        
        # Convert to DataFrame
        df = pd.DataFrame([d.dict() for d in request.data])
        df['ds'] = pd.to_datetime(df['ds'])
        
        # Check cache
        model, cache_hit = get_or_train_model(request.model_id, df)
        
        training_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Generate forecast
        future = model.make_future_dataframe(
            periods=request.periods,
            freq=request.frequency
        )
        forecast = model.predict(future)
        
        # Format response
        predictions = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(request.periods)
        
        forecast_points = [
            ForecastPoint(
                ds=row['ds'].isoformat(),
                yhat=round(row['yhat'], 2),
                yhat_lower=round(row['yhat_lower'], 2),
                yhat_upper=round(row['yhat_upper'], 2)
            )
            for _, row in predictions.iterrows()
        ]
        
        metadata = ForecastMetadata(
            model_id=request.model_id,
            periods=request.periods,
            frequency=request.frequency,
            data_points_used=len(df),
            training_time_ms=training_time if not cache_hit else None,
            cache_hit=cache_hit,
            generated_at=datetime.utcnow().isoformat()
        )
        
        return ForecastResponse(
            forecast=forecast_points,
            metadata=metadata,
            history=request.data if request.include_history else None
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(
                error="Invalid input data",
                detail=str(e),
                code="INVALID_DATA"
            ).dict()
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=ErrorResponse(
                error="Forecast generation failed",
                detail=str(e),
                code="FORECAST_ERROR"
            ).dict()
        )

@app.get(
    "/api/v1/models/{model_id}/status",
    summary="Check model cache status"
)
async def get_model_status(model_id: str):
    """Check if a model is cached and its metadata"""
    cached = is_model_cached(model_id)
    return {
        "model_id": model_id,
        "cached": cached,
        "last_trained": get_model_timestamp(model_id) if cached else None
    }

@app.delete(
    "/api/v1/models/{model_id}",
    summary="Invalidate model cache"
)
async def invalidate_model(model_id: str):
    """Invalidate cached model to force retraining"""
    invalidate_cache(model_id)
    return {"message": f"Model {model_id} cache invalidated"}

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "prophet-forecast-api",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }
```

## Next.js Integration

```typescript
// lib/forecast-api.ts
export interface ForecastRequest {
  data: Array<{ ds: string; y: number }>;
  periods?: number;
  frequency?: 'D' | 'W' | 'M';
  model_id?: string;
  include_history?: boolean;
}

export interface ForecastPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

export interface ForecastResponse {
  forecast: ForecastPoint[];
  metadata: {
    model_id: string;
    periods: number;
    frequency: string;
    data_points_used: number;
    cache_hit: boolean;
    generated_at: string;
  };
}

export async function generateForecast(
  request: ForecastRequest
): Promise<ForecastResponse> {
  const response = await fetch('/api/forecast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Forecast failed');
  }
  
  return response.json();
}
```

## API Design Best Practices

1. **Use Pydantic models**: Type-safe request/response
2. **Validate inputs**: Check ranges, formats, required fields
3. **Clear error messages**: Help developers debug
4. **Version your API**: `/api/v1/` for future changes
5. **Document thoroughly**: OpenAPI/Swagger docs
6. **Include metadata**: Cache status, timing, data quality
7. **Support pagination**: For large result sets
8. **Rate limiting**: Prevent abuse

## Response Time Targets

- Cached forecast: < 300ms
- New model training: < 5s
- Health check: < 50ms
