# Modular FastAPI Application Structure

This is a modular FastAPI application structure for the Service Company API. The code has been reorganized from a single file into a modular structure to improve maintainability and ease of development.

## Project Structure

```
backend/
├── app/
│   ├── database/
│   │   ├── __init__.py
│   │   └── connection.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── coches.py
│   │   ├── trabajadores.py
│   │   ├── trabajos.py
│   │   ├── formularios.py
│   │   ├── query.py
│   │   └── statistics.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── schemas.py
│   ├── services/
│   │   └── __init__.py
│   ├── utils/
│   │   └── __init__.py
│   ├── __init__.py
│   ├── main.py
│   └── README.md
├── main.py
├── requirements.txt
└── .env
```

## Modules

- **database**: Database connection and session management
- **models**: SQLAlchemy models
- **routers**: API endpoints organized by resource
- **schemas**: Pydantic models for request/response validation
- **services**: Business logic
- **utils**: Utility functions

## How to Run

The application can be run using the original main.py file for backward compatibility:

```
cd backend
uvicorn main:app --reload
```

Or it can be run using the new structure:

```
cd backend
uvicorn app.main:app --reload
```

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc 