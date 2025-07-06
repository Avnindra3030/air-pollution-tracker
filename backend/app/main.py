from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import air_quality

app = FastAPI(title="Air Pollution Monitoring API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(air_quality.router)

@app.get("/health")
def health_check():
    return {"status": "ok"} 