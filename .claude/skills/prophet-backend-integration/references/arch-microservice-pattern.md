# Architecture: Microservice Pattern

**Priority**: CRITICAL  
**Category**: Architecture Design  
**Impact**: Foundation for scalable Prophet integration

## Why It Matters

Prophet is a Python library that requires a separate runtime from Next.js. A microservice architecture provides:
- Language isolation (Python for Prophet, Node.js for Next.js)
- Independent scaling
- Better error isolation
- Easier testing and deployment

## ❌ Incorrect: Mixing Python in Next.js

```typescript
// app/api/forecast/route.ts
import { exec } from 'child_process';

export async function POST(req: Request) {
  // BAD: Spawning Python processes is slow and unreliable
  exec('python forecast.py', (error, stdout) => {
    // Slow, no connection pooling, hard to scale
  });
}
```

**Problems**:
- Cold start on every request
- No model caching
- Process overhead
- Difficult error handling
- Can't scale independently

## ✅ Correct: Dedicated FastAPI Microservice

### Python Service (FastAPI)

```python
# forecast_service/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from prophet import Prophet
import pandas as pd
from functools import lru_cache
import pickle
from datetime import datetime

app = FastAPI()

class ForecastRequest(BaseModel):
    data: list[dict]  # [{"ds": "2024-01-01", "y": 100}, ...]
    periods: int = 30
    model_id: str = "default"

class ForecastResponse(BaseModel):
    forecast: list[dict]
    model_id: str
    generated_at: str

# Cache trained models in memory
@lru_cache(maxsize=10)
def get_cached_model(model_id: str, data_hash: str):
    """Load or train model with caching"""
    try:
        with open(f"models/{model_id}.pkl", "rb") as f:
            return pickle.load(f)
    except FileNotFoundError:
        return None

@app.post("/forecast", response_model=ForecastResponse)
async def create_forecast(request: ForecastRequest):
    try:
        # Convert to DataFrame
        df = pd.DataFrame(request.data)
        df['ds'] = pd.to_datetime(df['ds'])
        
        # Validate data
        if len(df) < 2:
            raise HTTPException(400, "Need at least 2 data points")
        
        # Train or load model
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False
        )
        model.fit(df)
        
        # Generate forecast
        future = model.make_future_dataframe(periods=request.periods)
        forecast = model.predict(future)
        
        # Return predictions
        result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(request.periods)
        
        return ForecastResponse(
            forecast=result.to_dict('records'),
            model_id=request.model_id,
            generated_at=datetime.utcnow().isoformat()
        )
    
    except Exception as e:
        raise HTTPException(500, f"Forecast failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "prophet-forecast"}
```

### Next.js API Route

```typescript
// app/api/forecast/route.ts
import { createClient } from '@/lib/supabase/server';

const FORECAST_SERVICE_URL = process.env.FORECAST_SERVICE_URL || 'http://localhost:8000';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { periods = 30, category } = await req.json();
    
    // Fetch historical data from Supabase
    const { data: historicalData, error: dbError } = await supabase
      .from('transactions')
      .select('date, amount')
      .eq('user_id', user.id)
      .eq('category', category)
      .order('date', { ascending: true });
    
    if (dbError) throw dbError;
    
    // Transform for Prophet (needs 'ds' and 'y' columns)
    const prophetData = historicalData.map(row => ({
      ds: row.date,
      y: row.amount
    }));
    
    // Call Prophet microservice
    const forecastResponse = await fetch(`${FORECAST_SERVICE_URL}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: prophetData,
        periods,
        model_id: `user_${user.id}_${category}`
      })
    });
    
    if (!forecastResponse.ok) {
      throw new Error('Forecast service error');
    }
    
    const forecast = await forecastResponse.json();
    
    // Store predictions in Supabase
    const predictions = forecast.forecast.map((pred: any) => ({
      user_id: user.id,
      category,
      date: pred.ds,
      predicted_amount: pred.yhat,
      lower_bound: pred.yhat_lower,
      upper_bound: pred.yhat_upper,
      created_at: new Date().toISOString()
    }));
    
    await supabase.from('predictions').insert(predictions);
    
    return Response.json({ success: true, forecast: forecast.forecast });
    
  } catch (error) {
    console.error('Forecast error:', error);
    return Response.json(
      { error: 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}
```

## Benefits

1. **Independent Scaling**: Scale Python service separately
2. **Model Caching**: Keep trained models in memory
3. **Better Performance**: No cold starts for model loading
4. **Easier Testing**: Test services independently
5. **Technology Flexibility**: Use best tool for each job

## Deployment Options

- **Docker Compose**: Both services in containers
- **Separate Hosts**: FastAPI on Railway/Render, Next.js on Vercel
- **Kubernetes**: For enterprise scale

## Performance Metrics

- First request: ~2-5s (model training)
- Cached requests: ~100-300ms
- Concurrent requests: Limited by Python service resources
