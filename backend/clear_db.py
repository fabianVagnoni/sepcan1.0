import os
import urllib
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError

# Important: Import Base and all models from database.py
# This ensures Base.metadata knows about all tables to drop.
from database import Base, Coche, Trabajador, Trabajo, FormularioCoche, FormularioTrabajo, Incidencia 

# Load environment variables
load_dotenv()

# --- Database Connection Setup (copied from database.py) ---
db_user = os.getenv("AZURE_SQL_USER")
db_password = os.getenv("AZURE_SQL_PASSWORD")
db_server = os.getenv("AZURE_SQL_SERVER")
db_database = os.getenv("AZURE_SQL_DATABASE")
driver = '{ODBC Driver 18 for SQL Server}'

if not all([db_user, db_password, db_server, db_database]):
    print("Error: One or more database environment variables are not set.")
    print("Please check your .env file or environment configuration.")
    exit()

params = urllib.parse.quote_plus(
    f"DRIVER={driver};"
    f"SERVER=tcp:{db_server},1433;"
    f"DATABASE={db_database};"
    f"UID={db_user};"
    f"PWD={db_password};"
    f"Encrypt=yes;"
    f"TrustServerCertificate=no;"
    f"Connection Timeout=30;"
)
DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"
# ---------------------------------------------------------

def drop_all_tables():
    """Connects to the database and drops all tables defined in Base.metadata."""
    print(f"WARNING: This script will attempt to drop ALL tables defined in database.py")
    print(f"         from database '{db_database}' on server '{db_server}'.")
    
    confirm = input("Are you sure you want to continue? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Operation cancelled.")
        return

    try:
        print("Connecting to the database...")
        engine = create_engine(DATABASE_URL)
        
        print("Attempting to drop tables...")
        # Reflect might be needed if Base isn't populated correctly, but importing models should work
        # Base.metadata.reflect(bind=engine) 
        Base.metadata.drop_all(bind=engine)
        print("Tables dropped successfully.")
        
    except SQLAlchemyError as e:
        print(f"Error connecting to or dropping tables from the database: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    drop_all_tables() 