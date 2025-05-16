import os
import urllib
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError

# Import all models
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
    print("Error: Required environment variables not set.")
    print("Make sure AZURE_SQL_USER, AZURE_SQL_PASSWORD, AZURE_SQL_SERVER, and AZURE_SQL_DATABASE are set.")
    exit(1)

# Construct the connection string using pyodbc format
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

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables (if they don't exist)
Base.metadata.create_all(bind=engine)

# --- Data Generation ---

# Gran Canaria locations
locations = [
    "Las Palmas de Gran Canaria",
    "Telde",
    "Santa Lucía de Tirajana",
    "San Bartolomé de Tirajana",
    "Arucas",
    "Ingenio",
    "Agüimes",
    "Gáldar",
    "Mogán",
    "Puerto Rico",
    "Maspalomas",
    "Playa del Inglés",
    "Vecindario",
    "Doctoral",
    "Arrecife",
    "Arinaga",
    "Puerto del Carmen",
    "Arguineguín",
    "El Tablero",
    "Meloneras",
    "Playa de Mogán",
    "San Agustín",
    "El Matorral",
    "La Garita",
    "Melenara"
]

# Car states
car_states = [
    "Limpio",
    "Sucio",
    "Muy Limpio",
    "Muy Sucio"
]
car_states_weights = {
    "Limpio": 0.4,
    "Sucio": 0.25,
    "Muy Limpio": 0.2,
    "Muy Sucio": 0.15
}

# Issues for incidences with different severity levels
issue_descriptions = {
    0: "Crítica",
    1: "Alta", 
    2: "Media",
    3: "Baja",
    4: "Nula"  # No incidencia
}

issue_causes = {
    "Crítica": [
        "Motor sobrecalentado, riesgo de incendio.",
        "Frenos no responden correctamente, peligro inmediato.",
        "Dirección bloqueada parcialmente, inseguro para conducir.",
        "Rueda a punto de soltarse, tornillos flojos.",
        "Humo saliendo del motor, posible cortocircuito eléctrico.",
        "Fuga de combustible detectada.",
        "Airbag desplegado accidentalmente."
    ],
    "Alta": [
        "Luces principales no funcionan, peligroso para conducción nocturna.",
        "Sistema ABS fallando, reducción significativa de seguridad.",
        "Testigo de presión de aceite encendido constantemente.",
        "Problemas con la transmisión, cambios bruscos.",
        "Batería fallando, posible quedarse sin energía en ruta.",
        "Cremallera de dirección con holgura excesiva.",
        "Fuga de líquido de frenos detectada."
    ],
    "Media": [
        "Aire acondicionado no funciona, incómodo en clima caluroso.",
        "Indicador de combustible impreciso, riesgo de quedarse sin gasolina.",
        "Espejo retrovisor lateral suelto.",
        "Desgaste irregular en los neumáticos, requiere alineación.",
        "Bujías gastadas, arranque difícil.",
        "Radio/sistema de entretenimiento no funciona.",
        "Limpiaparabrisas desgastados, visibilidad reducida en lluvia."
    ],
    "Baja": [
        "Pequeño rasguño en la carrocería.",
        "Ventana no baja completamente.",
        "Luz interior no funciona.",
        "Tapicería manchada.",
        "Falta tapa del depósito de combustible.",
        "Retrovisor interior desajustado.",
        "Cenicero dañado o faltante."
    ]
}

def create_dummy_data(db, start_date, end_date):
    """
    Creates realistic dummy data for the database across the specified time period.
    Incorporates seasonality patterns to make the data more realistic.
    """
    print("Creating dummy data...")
    
    # Create 4 workers with realistic information
    trabajadores = []
    worker_data = [
        {"dni": 42871236, "nombre": "Carlos", "apellido": "Rodríguez", "birth": "1985-05-15", "employment": "2018-07-23"},
        {"dni": 51432687, "nombre": "Ana", "apellido": "Martínez", "birth": "1992-11-03", "employment": "2020-03-10"},
        {"dni": 37865421, "nombre": "Miguel", "apellido": "Hernández", "birth": "1988-02-27", "employment": "2019-09-15"},
        {"dni": 68542319, "nombre": "Laura", "apellido": "Sánchez", "birth": "1990-08-21", "employment": "2021-01-05"}
    ]
    
    for worker in worker_data:
        trabajador = Trabajador(
            dni=worker["dni"],
            nombre=worker["nombre"],
            apellido=worker["apellido"],
            fecha_nacimiento=datetime.strptime(worker["birth"], "%Y-%m-%d"),
            fecha_empleo=datetime.strptime(worker["employment"], "%Y-%m-%d")
        )
        db.add(trabajador)
        trabajadores.append(trabajador)
    db.commit()
    print(f"Created {len(trabajadores)} workers")
    
    # Create 3 cars
    coches = []
    for i in range(1, 4):
        coche = Coche(
            id_coche=i,
            placa=10000 + i
        )
        db.add(coche)
        coches.append(coche)
    db.commit()
    print(f"Created {len(coches)} cars")
    
    # Generate the date range for the first 6 months of 2025
    current_date = start_date
    dates = []
    
    # Generate all dates in the range, applying seasonality weights
    while current_date <= end_date:
        # Skip Sundays (assuming company doesn't operate on Sundays)
        if current_date.weekday() != 6:  # 6 = Sunday
            dates.append(current_date)
        current_date += timedelta(days=1)
    
    # Apply seasonality - weight each date by month and day of week
    # Nautical business is busier in summer months and on weekdays
    date_weights = {}
    for date in dates:
        # Month seasonality (January=1, June=6)
        # Higher weights for April-June (nautical season start)
        month_weight = {
            1: 0.6,  # January - low season
            2: 0.7,  # February - low season
            3: 0.8,  # March - picking up
            4: 1.0,  # April - high season begins
            5: 1.2,  # May - high season
            6: 1.5   # June - peak season
        }[date.month]
        
        # Day of week seasonality (Monday=0, Saturday=5)
        # Higher weights for Friday and Saturday (weekend preparations)
        day_weight = {
            0: 0.8,  # Monday - moderate
            1: 0.8,  # Tuesday - moderate
            2: 0.9,  # Wednesday - moderate
            3: 1.0,  # Thursday - busier as weekend approaches
            4: 1.3,  # Friday - busy (weekend preparation)
            5: 1.2,  # Saturday - busy (weekend usage)
        }[date.weekday()]
        
        # Combine weights
        date_weights[date] = month_weight * day_weight
    
    # Normalize weights to sum to 30 (target number of trabajos)
    total_weight = sum(date_weights.values())
    scale_factor = 30 / total_weight
    for date in date_weights:
        date_weights[date] *= scale_factor
    
    # Choose dates based on weights, ensuring exactly 30 dates
    selected_dates = []
    for date, weight in date_weights.items():
        # Use weighted probability to select dates
        if random.random() < weight / len(dates):
            selected_dates.append(date)
            if len(selected_dates) >= 30:
                break
    
    # If we don't have exactly 30 dates, adjust
    while len(selected_dates) < 30:
        # Add more dates from the highest weighted months not already selected
        for date in sorted(date_weights.keys(), key=lambda d: date_weights[d], reverse=True):
            if date not in selected_dates:
                selected_dates.append(date)
                if len(selected_dates) >= 30:
                    break
    
    # Ensure dates are sorted
    selected_dates.sort()
    
    # Create 30 trabajos (one for each selected date)
    trabajos = []
    for i, date in enumerate(selected_dates[:30], 1):
        cliente = f"Cliente Marino {i}"
        trabajo = Trabajo(
            id=i,
            cliente=cliente,
            fecha=date
        )
        db.add(trabajo)
        trabajos.append(trabajo)
    db.commit()
    print(f"Created {len(trabajos)} trabajos")
    
    # Create 30 formularios coches and 30 formularios trabajos
    formularios_coche = []
    formularios_trabajo = []
    
    for i, trabajo in enumerate(trabajos):
        # Assign a car and worker to each job
        coche = random.choice(coches)
        trabajador = random.choice(trabajadores)
        
        # Morning departure time (between 7:00 and 9:30)
        hora_partida = f"{random.randint(7, 9)}:{random.randint(0, 59):02d}"
        
        # Car state
        estado_coche = random.choices(
            list(car_states_weights.keys()),
            weights=list(car_states_weights.values()),
            k=1
        )[0]
        
        # Create car form
        formulario_coche = FormularioCoche(
            id_coche=coche.id_coche,
            dni_trabajador=trabajador.dni,
            id_trabajo=trabajo.id,
            otros=f"Observaciones para trabajo {trabajo.id}: {random.choice(['Todo en orden', 'Revisar niveles', 'Comprobar presión neumáticos', 'Limpiar antes de uso', ''])}",
            fecha=trabajo.fecha,  # Same as job date
            hora_partida=hora_partida,
            estado_coche=estado_coche
        )
        db.add(formulario_coche)
        formularios_coche.append(formulario_coche)
        
        # Location of job
        lugar_trabajo = random.choice(locations)
        
        # Travel time to location (10-60 minutes depending on location)
        tiempo_llegada = random.randint(10, 60)
        
        # Hours worked (between 2 and 8 hours)
        horas_trabajadas = round(random.uniform(2, 8), 1)
        
        # Calculate finish time based on departure time and hours worked
        hora_partida_h, hora_partida_m = map(int, hora_partida.split(':'))
        total_minutes = hora_partida_h * 60 + hora_partida_m + tiempo_llegada + int(horas_trabajadas * 60)
        hora_final_h = (total_minutes // 60) % 24
        hora_final_m = total_minutes % 60
        hora_final = f"{hora_final_h}:{hora_final_m:02d}"
        
        # Create work form
        formulario_trabajo = FormularioTrabajo(
            id_coche=coche.id_coche,
            dni_trabajador=trabajador.dni,
            id_trabajo=trabajo.id,
            otros=f"Trabajo completado en {lugar_trabajo}. {random.choice(['Cliente satisfecho', 'Se requiere seguimiento', 'Todo completado según lo previsto', 'Se recomendó mantenimiento adicional', ''])}",
            fecha=trabajo.fecha,  # Same as job date
            hora_final=hora_final,
            horas_trabajadas=horas_trabajadas,
            lugar_trabajo=lugar_trabajo,
            tiempo_llegada=tiempo_llegada
        )
        db.add(formulario_trabajo)
        formularios_trabajo.append(formulario_trabajo)
    
    db.commit()
    print(f"Created {len(formularios_coche)} car forms and {len(formularios_trabajo)} work forms")
    
    # Create incidencias (15% of formularios_coche)
    incidencias = []
    
    # Determine which car forms will have incidences (25%)
    num_incidencias = int(len(formularios_coche) * 0.25)
    forms_with_incidencias = random.sample(formularios_coche, num_incidencias)
    
    # Weighted choice for gravity levels
    gravity_weights = {
        "Crítica": 0.15,  # 15% chance 
        "Alta": 0.25,     # 25% chance
        "Media": 0.20,    # 20% chance
        "Baja": 0.40,     # 40% chance
    }
    
    # Create incidences from selected forms
    for i, form in enumerate(forms_with_incidencias, 1):
        # Choose gravity level based on weights
        gravity_level = random.choices(
            list(gravity_weights.keys()),
            weights=list(gravity_weights.values()),
            k=1
        )[0]
        
        # Choose a cause based on gravity level
        cause = random.choice(issue_causes[gravity_level])
        
        # Calculate days since start date for this incidence
        days_since_start = (form.fecha - start_date).days
        
        # Older incidences have higher chance of being resolved
        # Higher gravity levels are more likely to be resolved quickly
        resolve_probability = {
            "Crítica": min(0.9, days_since_start / 150),  # High priority = faster resolution
            "Alta": min(0.8, days_since_start / 170), 
            "Media": min(0.7, days_since_start / 180),
            "Baja": min(0.6, days_since_start / 200)  # Lower priority = slower resolution
        }[gravity_level]
        
        # Determine if resolved
        is_resolved = random.random() < resolve_probability
        
        # For resolved incidences, determine resolution date and mechanic
        resolution_date = None
        mechanic_id = None
        
        if is_resolved:
            # Resolution happens 1-14 days after incident, based on gravity
            max_days = {
                "Crítica": 3,  # Critical issues resolved in 1-3 days
                "Alta": 5,     # High priority in 1-5 days
                "Media": 10,   # Medium priority in 1-10 days
                "Baja": 14     # Low priority in 1-14 days
            }[gravity_level]
            
            days_to_resolve = random.randint(1, max_days)
            resolution_date = form.fecha + timedelta(days=days_to_resolve)
            
            # Ensure resolution date doesn't exceed our data range
            if resolution_date > end_date:
                resolution_date = end_date
            
            # Assign a random mechanic (from our workers)
            mechanic_id = random.choice(trabajadores).dni
        
        incidencia = Incidencia(
            id_incidencia=i,
            id_coche=form.id_coche,
            gravedad=gravity_level,
            fecha=form.fecha,
            resuelta=is_resolved,
            descripcion=f"Estado del coche: {form.estado_coche}. Problema detectado: {cause}",
            id_mecanico=mechanic_id,
            fecha_resolucion=resolution_date
        )
        
        db.add(incidencia)
        incidencias.append(incidencia)
    
    db.commit()
    print(f"Created {len(incidencias)} incidences")
    
    print("Data population complete!")

def main():
    """Main function to populate the database with dummy data."""
    try:
        # Drop all existing tables (for clean start)
        Base.metadata.drop_all(bind=engine)
        
        # Recreate tables
        Base.metadata.create_all(bind=engine)
        
        # Create DB session
        db = SessionLocal()
        
        # Date range: First 6 months of 2025
        start_date = datetime(2025, 1, 1)
        end_date = datetime(2025, 6, 30)
        
        # Create dummy data
        create_dummy_data(db, start_date, end_date)
        
        db.close()
        
    except SQLAlchemyError as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main() 