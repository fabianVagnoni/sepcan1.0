from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import create_tables # Keep import if needed elsewhere, but function call removed
from app.routers import coches, trabajadores, trabajos, formularios, query, incidencias

# Initialize FastAPI app
app = FastAPI(title="Service Company API")
            #   openapi_prefix="/api")

# CORS Middleware is commented out, which is correct for SWA proxy
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # For production, replace with specific origins
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Removed create_tables() on startup
# Database schema migrations should be handled separately in production
# (e.g., using Alembic or manual scripts during deployment).
# @app.on_event("startup")
# async def startup_event():
#     create_tables()

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Service Company API is running"}

# Include routers
app.include_router(coches.router, prefix="/api")
app.include_router(trabajadores.router, prefix="/api")
app.include_router(trabajos.router, prefix="/api")
app.include_router(formularios.router, prefix="/api")
app.include_router(query.router, prefix="/api")
# app.include_router(statistics.router, prefix="/api")
app.include_router(incidencias.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 