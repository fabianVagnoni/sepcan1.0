# Service Company Backend

This is the backend for the Service Company application. It provides APIs for submitting vehicle and job formularies, as well as querying the data.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
Create a `.env` file with the following variables:
```
DATABASE_URL=postgresql://neondb_owner:npg_lT6b0MtEpcnr@ep-raspy-paper-a2t4l65n-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
PORT=8000
```

3. Initialize the database:
```bash
python init_db.py
```

4. Run the server:
```bash
uvicorn main:app --reload
```

## API Endpoints

### Vehicle Formulary
- `POST /vehicle-formulary/`: Submit a vehicle formulary

### Job Formulary
- `POST /job-formulary/`: Submit a job formulary

### Queries
- `GET /query/vehicle-formularies`: Query vehicle formularies
- `GET /query/job-formularies`: Query job formularies
- `GET /query/combined-data`: Query both vehicle and job formularies

Query parameters:
- `employee_id`: Filter by employee ID
- `job_id`: Filter by job ID
- `vehicle_id`: Filter by vehicle ID
- `format`: Response format (json or excel)

## Database Models

### Vehicle Formulary
- employee_id: int
- employee_name: string
- job_id: int
- job_place: string
- vehicle_id: int
- vehicle_condition: enum ["perfect", "good", "bad", "critical"]
- vehicle_clean: enum ["perfect", "good", "bad", "critical"]
- comments: string
- timestamp: datetime

### Job Formulary
- employee_id: int
- employee_name: string
- job_id: int
- job_place: string
- time_to_commute: float
- time_of_work: float
- vehicle_id: int
- nails_used: int 