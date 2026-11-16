"""FastAPI application entrypoint for Cadence."""
from fastapi import FastAPI

app = FastAPI(
    title="Cadence API",
    description="Production planning & capacity optimization copilot for press-based manufacturing",
    version="0.1.0",
)


@app.get("/health")
def health_check() -> dict:
    """Service health check endpoint."""
    return {"status": "ok", "service": "cadence-api"}
