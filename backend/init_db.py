from database import create_tables
from migrate_data import migrate_data

if __name__ == "__main__":
    print("Initializing database...")
    create_tables()
    print("Database tables created successfully!")
    
    print("Migrating data from old tables...")
    migrate_data()
    print("Data migration completed!") 