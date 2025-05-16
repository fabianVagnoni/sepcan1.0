from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection string
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_lT6b0MtEpcnr@ep-raspy-paper-a2t4l65n-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# SQL statements to add new columns
alter_formularios_coche = """
ALTER TABLE formularios_coche 
ADD COLUMN IF NOT EXISTS fecha VARCHAR,
ADD COLUMN IF NOT EXISTS hora_partida VARCHAR,
ADD COLUMN IF NOT EXISTS estado_coche VARCHAR;
"""

alter_formularios_trabajo = """
ALTER TABLE formularios_trabajo 
ADD COLUMN IF NOT EXISTS fecha VARCHAR,
ADD COLUMN IF NOT EXISTS hora_final VARCHAR,
ADD COLUMN IF NOT EXISTS horas_trabajadas FLOAT,
ADD COLUMN IF NOT EXISTS lugar_trabajo VARCHAR,
ADD COLUMN IF NOT EXISTS tiempo_llegada INTEGER;
"""

def run_migration():
    with engine.connect() as connection:
        print("Adding new columns to formularios_coche table...")
        connection.execute(text(alter_formularios_coche))
        
        print("Adding new columns to formularios_trabajo table...")
        connection.execute(text(alter_formularios_trabajo))
        
        connection.commit()
        
    print("Migration completed successfully!")

if __name__ == "__main__":
    run_migration() 