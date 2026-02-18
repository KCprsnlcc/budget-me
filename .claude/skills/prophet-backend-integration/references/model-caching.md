# Model Caching Strategy

**Priority**: HIGH  
**Category**: Model Optimization  
**Impact**: Response time and resource usage

## Why It Matters

Training Prophet models is expensive (2-10s per model). Caching strategies:
- Reduce response time from seconds to milliseconds
- Lower CPU usage
- Enable higher throughput
- Improve user experience

## ❌ Incorrect: Train on Every Request

```python
@app.post("/forecast")
async def forecast(request: ForecastRequest):
    # BAD: Training model on every request
    df = pd.DataFrame(request.data)
    model = Prophet()  # Fresh model every time
    model.fit(df)      # 2-10 seconds!
    
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)
    return forecast
```

**Problems**:
- 2-10s latency per request
- High CPU usage
- Can't handle concurrent requests
- Wastes resources on identical data

## ✅ Correct: Multi-Level Caching

```python
from prophet import Prophet
import pandas as pd
import pickle
import hashlib
from functools import lru_cache
from datetime import datetime, timedelta
import redis
import os

# Redis for distributed caching (optional)
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=6379,
    decode_responses=False
) if os.getenv('REDIS_HOST') else None

class ModelCache:
    """Multi-level caching for Prophet models"""
    
    def __init__(self, cache_dir: str = "models"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        self.memory_cache = {}  # In-memory cache
        self.max_memory_models = 10
    
    def get_data_hash(self, df: pd.DataFrame) -> str:
        """Generate hash of training data"""
        data_str = df.to_json(orient='records', date_format='iso')
        return hashlib.md5(data_str.encode()).hexdigest()
    
    def get_cache_key(self, model_id: str, data_hash: str) -> str:
        """Generate cache key"""
        return f"prophet_model_{model_id}_{data_hash}"
    
    def get_model(self, model_id: str, df: pd.DataFrame) -> tuple[Prophet | None, str]:
        """
        Get cached model or None
        Returns: (model, cache_level) where cache_level is 'memory', 'redis', 'disk', or None
        """
        data_hash = self.get_data_hash(df)
        cache_key = self.get_cache_key(model_id, data_hash)
        
        # 1. Check memory cache (fastest)
        if cache_key in self.memory_cache:
            print(f"Cache HIT: memory ({cache_key})")
            return self.memory_cache[cache_key], 'memory'
        
        # 2. Check Redis cache (fast, distributed)
        if redis_client:
            try:
                model_bytes = redis_client.get(cache_key)
                if model_bytes:
                    model = pickle.loads(model_bytes)
                    # Promote to memory cache
                    self._add_to_memory(cache_key, model)
                    print(f"Cache HIT: redis ({cache_key})")
                    return model, 'redis'
            except Exception as e:
                print(f"Redis error: {e}")
        
        # 3. Check disk cache (slower but persistent)
        disk_path = os.path.join(self.cache_dir, f"{cache_key}.pkl")
        if os.path.exists(disk_path):
            try:
                with open(disk_path, 'rb') as f:
                    model = pickle.load(f)
                # Promote to memory and Redis
                self._add_to_memory(cache_key, model)
                if redis_client:
                    redis_client.setex(
                        cache_key,
                        3600,  # 1 hour TTL
                        pickle.dumps(model)
                    )
                print(f"Cache HIT: disk ({cache_key})")
                return model, 'disk'
            except Exception as e:
                print(f"Disk cache error: {e}")
        
        print(f"Cache MISS ({cache_key})")
        return None, None
    
    def save_model(self, model_id: str, df: pd.DataFrame, model: Prophet):
        """Save model to all cache levels"""
        data_hash = self.get_data_hash(df)
        cache_key = self.get_cache_key(model_id, data_hash)
        
        # Save to memory
        self._add_to_memory(cache_key, model)
        
        # Save to Redis
        if redis_client:
            try:
                redis_client.setex(
                    cache_key,
                    3600,  # 1 hour TTL
                    pickle.dumps(model)
                )
            except Exception as e:
                print(f"Redis save error: {e}")
        
        # Save to disk
        try:
            disk_path = os.path.join(self.cache_dir, f"{cache_key}.pkl")
            with open(disk_path, 'wb') as f:
                pickle.dump(model, f)
        except Exception as e:
            print(f"Disk save error: {e}")
    
    def _add_to_memory(self, key: str, model: Prophet):
        """Add model to memory cache with LRU eviction"""
        if len(self.memory_cache) >= self.max_memory_models:
            # Remove oldest entry
            oldest_key = next(iter(self.memory_cache))
            del self.memory_cache[oldest_key]
        
        self.memory_cache[key] = model
    
    def invalidate(self, model_id: str):
        """Invalidate all caches for a model_id"""
        # Clear memory cache
        keys_to_remove = [k for k in self.memory_cache.keys() if model_id in k]
        for key in keys_to_remove:
            del self.memory_cache[key]
        
        # Clear Redis
        if redis_client:
            pattern = f"prophet_model_{model_id}_*"
            for key in redis_client.scan_iter(pattern):
                redis_client.delete(key)
        
        # Clear disk
        for filename in os.listdir(self.cache_dir):
            if model_id in filename:
                os.remove(os.path.join(self.cache_dir, filename))

# Global cache instance
model_cache = ModelCache()

@app.post("/forecast")
async def create_forecast(request: ForecastRequest):
    try:
        # Preprocess data
        df = preprocess_for_prophet(request.data)
        
        # Try to get cached model
        model, cache_level = model_cache.get_model(request.model_id, df)
        
        if model is None:
            # Train new model
            print(f"Training new model for {request.model_id}")
            start_time = datetime.now()
            
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=False
            )
            model.fit(df)
            
            training_time = (datetime.now() - start_time).total_seconds()
            print(f"Model trained in {training_time:.2f}s")
            
            # Cache the model
            model_cache.save_model(request.model_id, df, model)
            cache_level = 'none'
        
        # Generate forecast
        future = model.make_future_dataframe(periods=request.periods)
        forecast = model.predict(future)
        
        result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(request.periods)
        
        return {
            "forecast": result.to_dict('records'),
            "model_id": request.model_id,
            "cache_hit": cache_level,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(500, f"Forecast failed: {str(e)}")

@app.post("/invalidate-cache/{model_id}")
async def invalidate_cache(model_id: str):
    """Invalidate cache when new data is available"""
    model_cache.invalidate(model_id)
    return {"message": f"Cache invalidated for {model_id}"}
```

## Caching Strategy Decision Tree

```
New forecast request
    ↓
Is data identical to cached model?
    ↓ YES → Use cached model (100-300ms)
    ↓ NO
    ↓
Has data changed significantly? (>10% new data)
    ↓ YES → Retrain and cache (2-10s)
    ↓ NO → Use cached model with warning
```

## Cache Invalidation Triggers

Invalidate cache when:
- New data added (>10% change)
- User explicitly requests refresh
- Cache age > 24 hours
- Model performance degrades

## Performance Comparison

| Scenario | Without Cache | With Memory Cache | With Redis |
|----------|---------------|-------------------|------------|
| First request | 5s | 5s | 5s |
| Subsequent (same data) | 5s | 150ms | 200ms |
| Concurrent requests | 5s each | 150ms each | 200ms each |
| After restart | 5s | 5s | 200ms |

## Best Practices

1. **Use data hash**: Cache based on data content, not just model_id
2. **Set TTL**: Expire old caches (1-24 hours)
3. **Monitor hit rate**: Track cache effectiveness
4. **Limit memory**: Don't cache unlimited models
5. **Invalidate smartly**: Clear cache when data changes significantly
