---
name: prophet-backend-integration
description: Best practices for integrating Facebook Prophet time-series forecasting model into backend systems. Use when implementing forecasting APIs, data pipelines, or ML model integration.
license: MIT
metadata:
  author: community
  version: "1.0.0"
  date: February 2026
  abstract: Comprehensive guide for integrating Facebook Prophet forecasting model into production backends. Covers architecture patterns, API design, data preprocessing, model optimization, error handling, and deployment strategies for Next.js, FastAPI, and Supabase environments.
---

# Prophet Backend Integration Best Practices

Expert guide for implementing Facebook Prophet time-series forecasting in production backend systems.

## When to Apply

Use this skill when:
- Integrating Prophet forecasting into APIs
- Building time-series prediction pipelines
- Designing ML model serving architecture
- Optimizing Prophet model performance
- Implementing data preprocessing for forecasts
- Handling forecast storage and caching
- Deploying Prophet models to production

## Architecture Patterns

| Pattern | Use Case | Complexity | Scalability |
|---------|----------|------------|-------------|
| Microservice | Production, high traffic | HIGH | Excellent |
| Serverless Functions | Low-medium traffic | MEDIUM | Good |
| Background Jobs | Batch predictions | MEDIUM | Good |
| Real-time API | On-demand forecasts | HIGH | Medium |

## Rule Categories

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Architecture Design | CRITICAL | `arch-` |
| 2 | Data Pipeline | CRITICAL | `data-` |
| 3 | Model Optimization | HIGH | `model-` |
| 4 | API Design | HIGH | `api-` |
| 5 | Error Handling | MEDIUM | `error-` |
| 6 | Caching Strategy | MEDIUM | `cache-` |
| 7 | Deployment | MEDIUM | `deploy-` |
| 8 | Monitoring | LOW-MEDIUM | `monitor-` |

## Quick Reference

### Core Principles

1. **Separate Concerns**: Keep Prophet service isolated from main app
2. **Async Processing**: Use background jobs for training
3. **Cache Aggressively**: Store predictions, reuse models
4. **Validate Input**: Strict data validation before forecasting
5. **Handle Failures**: Graceful degradation when model fails
6. **Monitor Performance**: Track prediction latency and accuracy

### Recommended Stack

```
Frontend (Next.js)
    ↓
Next.js API Routes (/api/forecast)
    ↓
Python FastAPI Microservice
    ↓
Prophet Model (cached)
    ↓
Supabase (historical data + predictions)
```

## Reference Files

Each reference file contains detailed implementation patterns:

- `arch-microservice-pattern.md` - Microservice architecture
- `arch-serverless-pattern.md` - Serverless deployment
- `data-preprocessing.md` - Data cleaning and preparation
- `data-validation.md` - Input validation strategies
- `model-training.md` - Model training best practices
- `model-caching.md` - Model persistence and caching
- `model-hyperparameters.md` - Tuning Prophet parameters
- `api-design.md` - REST API design patterns
- `api-authentication.md` - Securing forecast endpoints
- `error-handling.md` - Error handling strategies
- `cache-strategies.md` - Prediction caching patterns
- `deploy-docker.md` - Docker deployment
- `deploy-vercel.md` - Vercel deployment
- `monitor-metrics.md` - Monitoring and logging

## Integration Examples

### Next.js + FastAPI + Supabase
Best for: Production apps with high traffic

### Next.js + Python Serverless
Best for: Prototypes and low-traffic apps

### Supabase Edge Functions + External Service
Best for: Supabase-first architecture

## References

- https://facebook.github.io/prophet/
- https://fastapi.tiangolo.com/
- https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- https://supabase.com/docs/guides/functions
- https://vercel.com/docs/functions/serverless-functions/runtimes/python
