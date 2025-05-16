from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os
from dotenv import load_dotenv
import urllib
from datetime import datetime

# Load environment variables
load_dotenv()

# Date format constants
DATE_FORMAT = "%d/%m/%Y"

# Helper function to convert string to datetime object
def parse_date(date_str):
    """Convert a string in DD/MM/YYYY format to a datetime object."""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, DATE_FORMAT)
    except ValueError:
        # Try alternate format (YYYY-MM-DD) that might come from frontend
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            return None

# Helper function to format datetime to string
def format_date(date_obj):
    """Convert a datetime object to a string in DD/MM/YYYY format."""
    if not date_obj:
        return None
    return date_obj.strftime(DATE_FORMAT)

# Database connection details
db_user = os.getenv("AZURE_SQL_USER")
db_password = os.getenv("AZURE_SQL_PASSWORD")
db_server = os.getenv("AZURE_SQL_SERVER")
db_database = os.getenv("AZURE_SQL_DATABASE")
driver = '{ODBC Driver 18 for SQL Server}' # Make sure this driver is installed

# Construct the connection string for Azure SQL using pyodbc format
params = urllib.parse.quote_plus(
    f"DRIVER={driver};"
    f"SERVER=tcp:{db_server},1433;"  # Default SQL Server port
    f"DATABASE={db_database};"
    f"UID={db_user};"
    f"PWD={db_password};"
    f"Encrypt=yes;"
    f"TrustServerCertificate=no;"
    f"Connection Timeout=30;"
)
DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Define models according to ER diagram
class Coche(Base):
    __tablename__ = "coches"
    
    # ID is PK, but company provides the ID, so it MUST NOT be an IDENTITY column.
    # autoincrement=False signals this to SQLAlchemy for table creation and inserts.
    id_coche = Column("ID", Integer, primary_key=True, index=True, autoincrement=False)
    placa = Column(Integer, unique=True, nullable=False)
    
    # Relationships
    formularios_coche = relationship("FormularioCoche", back_populates="coche")
    formularios_trabajo = relationship("FormularioTrabajo", back_populates="coche")
    incidencias = relationship("Incidencia", back_populates="coche", foreign_keys="Incidencia.id_coche")

class Trabajador(Base):
    __tablename__ = "trabajadores"
    
    dni = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    fecha_nacimiento = Column(DateTime, nullable=False)
    fecha_empleo = Column(DateTime, nullable=False)
    
    # Relationships
    formularios_coche = relationship("FormularioCoche", back_populates="trabajador")
    formularios_trabajo = relationship("FormularioTrabajo", back_populates="trabajador")

class Trabajo(Base):
    __tablename__ = "trabajos"
    
    id = Column(Integer, primary_key=True, index=True)
    cliente = Column(String, nullable=False)
    fecha = Column(DateTime, nullable=False)
    
    # Relationships
    formularios_coche = relationship("FormularioCoche", back_populates="trabajo", uselist=False)
    formularios_trabajo = relationship("FormularioTrabajo", back_populates="trabajo", uselist=False)

class FormularioCoche(Base):
    __tablename__ = "formularios_coche"
    
    id_coche = Column(Integer, ForeignKey("coches.ID"), primary_key=True)
    dni_trabajador = Column(Integer, ForeignKey("trabajadores.dni"), primary_key=True)
    id_trabajo = Column(Integer, ForeignKey("trabajos.id"), primary_key=True)
    otros = Column(String, nullable=True)
    fecha = Column(DateTime, nullable=True)
    hora_partida = Column(String, nullable=True)
    estado_coche = Column(String, nullable=True)
    
    # Relationships
    coche = relationship("Coche", back_populates="formularios_coche")
    trabajador = relationship("Trabajador", back_populates="formularios_coche")
    trabajo = relationship("Trabajo", back_populates="formularios_coche")

class FormularioTrabajo(Base):
    __tablename__ = "formularios_trabajo"
    
    id_coche = Column(Integer, ForeignKey("coches.ID"), primary_key=True)
    dni_trabajador = Column(Integer, ForeignKey("trabajadores.dni"), primary_key=True)
    id_trabajo = Column(Integer, ForeignKey("trabajos.id"), primary_key=True)
    otros = Column(String, nullable=True)
    fecha = Column(DateTime, nullable=True)
    hora_final = Column(String, nullable=True)
    horas_trabajadas = Column(Float, nullable=True)
    lugar_trabajo = Column(String, nullable=True)
    tiempo_llegada = Column(Integer, nullable=True)
    
    # Relationships
    coche = relationship("Coche", back_populates="formularios_trabajo")
    trabajador = relationship("Trabajador", back_populates="formularios_trabajo")
    trabajo = relationship("Trabajo", back_populates="formularios_trabajo")

class Incidencia(Base):
    __tablename__ = "incidencias"
    
    id_incidencia = Column(Integer, primary_key=True, index=True)
    id_coche = Column(Integer, ForeignKey("coches.ID"), nullable=False)
    gravedad = Column("Gravity", String, nullable=False)
    fecha = Column(DateTime, nullable=False)
    resuelta = Column("Resolved", Boolean, nullable=False)
    descripcion = Column(String, nullable=True)
    id_mecanico = Column(Integer, ForeignKey("trabajadores.dni"), nullable=True)
    fecha_resolucion = Column(DateTime, nullable=True)
    coche = relationship("Coche", back_populates="incidencias", foreign_keys=[id_coche])

# Function to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables in the database
def create_tables():
    Base.metadata.create_all(bind=engine)

# Add block to execute table creation when script is run directly
if __name__ == "__main__":
    print(f"Attempting to create tables in database: {db_database} on server: {db_server}...")
    try:
        # Ensure the engine is created before calling create_all
        # The engine is already created globally in this script
        create_tables()
        print("Tables created successfully (or already exist).")
    except Exception as e:
        print(f"An error occurred during table creation: {e}") 