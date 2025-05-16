import logging
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import urllib
from dotenv import load_dotenv

# Configure basic logging to ensure output
logging.basicConfig(stream=sys.stdout, level=logging.INFO, format='%(asctime)s - %(levelname)s - CONNECTION.PY - %(message)s')

logging.info("--- DATABASE CONNECTION SCRIPT START ---")

# Load environment variables (primarily for local development)
load_dotenv()

logging.info(f"Attempting to load environment variables for database connection.")
# --- Azure SQL Database Connection Setup ---
db_user = os.getenv("AZURE_SQL_USER")
db_password = os.getenv("AZURE_SQL_PASSWORD")
db_server = os.getenv("AZURE_SQL_SERVER")
db_database = os.getenv("AZURE_SQL_DATABASE")

logging.info(f"AZURE_SQL_USER: {'********' if db_user else 'NOT SET'}")
logging.info(f"AZURE_SQL_PASSWORD: {'********' if db_password else 'NOT SET'}")
logging.info(f"AZURE_SQL_SERVER: {db_server if db_server else 'NOT SET'}")
logging.info(f"AZURE_SQL_DATABASE: {db_database if db_database else 'NOT SET'}")

# Ensure the correct ODBC driver name is used
driver = '{ODBC Driver 18 for SQL Server}'

# Check if required environment variables are set (especially in production)
if not all([db_user, db_password, db_server, db_database]):
    # In a real application, you might raise an error or log a critical warning here.
    logging.warning("One or more AZURE_SQL database environment variables are not set.")
    logging.warning("Application might not connect to the intended database.")
    # Consider adding fallback or raising an exception if connection is critical
    DATABASE_URL = None # Set to None or handle error appropriately
else:
    try:
        logging.info("Constructing DATABASE_URL...")
        # Construct the connection string for Azure SQL using pyodbc format
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
        logging.info(f"DATABASE_URL constructed (credentials masked): mssql+pyodbc:///?odbc_connect=DRIVER={{...}};SERVER=tcp:{db_server},1433;DATABASE={db_database};UID={db_user};PWD=********;... ")
    except Exception as e:
        logging.error(f"Could not construct DATABASE_URL: {e}", exc_info=True)
        DATABASE_URL = None

# Create SQLAlchemy engine
# Handle the case where DATABASE_URL might be None if env vars were missing
if DATABASE_URL:
    try:
        logging.info(f"Attempting to create SQLAlchemy engine with DATABASE_URL...")
        engine = create_engine(DATABASE_URL)
        logging.info(f"SQLAlchemy engine created successfully: {engine}")
    except Exception as e:
        logging.error(f"Failed to create SQLAlchemy engine: {e}", exc_info=True)
        # Depending on your app's requirements, you might exit or raise
        engine = None
else:
    logging.error("DATABASE_URL not configured. SQLAlchemy engine cannot be created.")
    engine = None
# --------------------------------------------

# Create session factory - check if engine was created successfully
if engine:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logging.info("SessionLocal created successfully.")
else:
    SessionLocal = None
    logging.error("SessionLocal cannot be created because the engine is not available.")

# Create base class for models
# Note: It's common practice to define Base here OR in a dedicated models file.
# If your models define their own Base, ensure this one isn't conflicting.
# Assuming models will import Base from here or vice-versa.
Base = declarative_base()

# Function to get DB session
def get_db():
    logging.debug("get_db called.")
    if not SessionLocal:
        logging.error("get_db: SessionLocal is not configured! Raising RuntimeError.")
        raise RuntimeError("Database session factory (SessionLocal) is not configured.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables in the database
def create_tables():
    logging.info("create_tables function called.")
    if not engine:
        logging.error("Cannot create tables because the database engine is not configured.")
        return
    # Import models locally to avoid circular dependencies if models also import from here
    from app.models.models import Base as ModelBase # Use an alias if Base is defined here too
    logging.info(f"Attempting to create tables on engine: {engine}")
    try:
        ModelBase.metadata.create_all(bind=engine)
        logging.info("Tables creation attempt finished.")
    except Exception as e:
        logging.error(f"Failed to create tables: {e}", exc_info=True) 