"""
This is a backward-compatible main.py file.
It imports the FastAPI app instance from the new modular structure.
"""

from app import app

# This maintains backward compatibility with existing code

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 