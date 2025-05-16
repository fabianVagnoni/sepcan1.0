from sqlalchemy.orm import Session
from database import get_db, engine, Base, Coche, Trabajador, Trabajo, FormularioCoche, FormularioTrabajo
import pandas as pd
from sqlalchemy import text
import random
import string

def generate_password(length=10):
    """Generate a random password of specified length"""
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choice(characters) for _ in range(length))

def migrate_data():
    """Migrate data from old tables to new tables"""
    # Get database session
    db = next(get_db())
    
    try:
        # Check if old tables exist
        vehicle_formularies_exist = False
        job_formularies_exist = False
        
        try:
            # Try to query old tables
            vehicle_formularies = db.execute(text("SELECT * FROM vehicle_formularies")).fetchall()
            vehicle_formularies_exist = True
        except:
            print("Table 'vehicle_formularies' does not exist or is empty.")
            vehicle_formularies = []
        
        try:
            job_formularies = db.execute(text("SELECT * FROM job_formularies")).fetchall()
            job_formularies_exist = True
        except:
            print("Table 'job_formularies' does not exist or is empty.")
            job_formularies = []
        
        if not vehicle_formularies_exist and not job_formularies_exist:
            print("No old tables found. Nothing to migrate.")
            return
        
        # Extract unique entities
        unique_vehicles = set()
        unique_employees = set()
        unique_jobs = set()
        
        # Process vehicle formularies
        for vf in vehicle_formularies:
            unique_vehicles.add(vf.vehicle_id)
            unique_employees.add((vf.employee_id, vf.employee_name))
            unique_jobs.add((vf.job_id, vf.job_place))
        
        # Process job formularies
        for jf in job_formularies:
            unique_vehicles.add(jf.vehicle_id)
            unique_employees.add((jf.employee_id, jf.employee_name))
            unique_jobs.add((jf.job_id, jf.job_place))
        
        # Create new entities
        # 1. Create Coche entities
        for vehicle_id in unique_vehicles:
            # Check if already exists
            existing = db.query(Coche).filter(Coche.placa == vehicle_id).first()
            if not existing:
                coche = Coche(
                    placa=vehicle_id,
                    marca="Migrado",
                    modelo="Migrado",
                    fecha_fabricacion="01/01/2000",
                    fecha_compra="01/01/2000",
                    password=generate_password()
                )
                db.add(coche)
                print(f"Created Coche with placa {vehicle_id}")
        
        # 2. Create Trabajador entities
        for employee_id, employee_name in unique_employees:
            # Check if already exists
            existing = db.query(Trabajador).filter(Trabajador.dni == employee_id).first()
            if not existing:
                # Split name into first and last name if possible
                name_parts = employee_name.split(" ", 1)
                nombre = name_parts[0]
                apellido = name_parts[1] if len(name_parts) > 1 else ""
                
                trabajador = Trabajador(
                    dni=employee_id,
                    nombre=nombre,
                    apellido=apellido,
                    fecha_nacimiento="01/01/1980",
                    fecha_empleo="01/01/2020",
                    password=generate_password()
                )
                db.add(trabajador)
                print(f"Created Trabajador with dni {employee_id}")
        
        # 3. Create Trabajo entities
        for job_id, job_place in unique_jobs:
            # Check if already exists
            existing = db.query(Trabajo).filter(Trabajo.id == job_id).first()
            if not existing:
                trabajo = Trabajo(
                    id=job_id,
                    cliente=job_place,
                    fecha="01/01/2023",
                    password=generate_password()
                )
                db.add(trabajo)
                print(f"Created Trabajo with id {job_id}")
        
        # Commit entities
        db.commit()
        
        # 4. Create FormularioCoche entities from vehicle_formularies
        for vf in vehicle_formularies:
            # Check if already exists
            existing = db.query(FormularioCoche).filter(
                FormularioCoche.placa_coche == vf.vehicle_id,
                FormularioCoche.dni_trabajador == vf.employee_id,
                FormularioCoche.id_trabajo == vf.job_id
            ).first()
            
            if not existing:
                formulario = FormularioCoche(
                    placa_coche=vf.vehicle_id,
                    dni_trabajador=vf.employee_id,
                    id_trabajo=vf.job_id,
                    otros=f"Condición: {vf.vehicle_condition}, Limpieza: {vf.vehicle_clean}, Comentarios: {vf.comments}"
                )
                db.add(formulario)
                print(f"Created FormularioCoche for job {vf.job_id}")
        
        # 5. Create FormularioTrabajo entities from job_formularies
        for jf in job_formularies:
            # Check if already exists
            existing = db.query(FormularioTrabajo).filter(
                FormularioTrabajo.placa_coche == jf.vehicle_id,
                FormularioTrabajo.dni_trabajador == jf.employee_id,
                FormularioTrabajo.id_trabajo == jf.job_id
            ).first()
            
            if not existing:
                formulario = FormularioTrabajo(
                    placa_coche=jf.vehicle_id,
                    dni_trabajador=jf.employee_id,
                    id_trabajo=jf.job_id,
                    otros=f"Tiempo de viaje: {jf.time_to_commute}, Tiempo de trabajo: {jf.time_of_work}, Clavos usados: {jf.nails_used}"
                )
                db.add(formulario)
                print(f"Created FormularioTrabajo for job {jf.job_id}")
        
        # Commit formularies
        db.commit()
        
        # Drop old tables if they exist
        if vehicle_formularies_exist:
            db.execute(text("DROP TABLE vehicle_formularies"))
            print("Dropped table 'vehicle_formularies'")
        
        if job_formularies_exist:
            db.execute(text("DROP TABLE job_formularies"))
            print("Dropped table 'job_formularies'")
        
        db.commit()
        print("Migration completed successfully!")
    
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate_data() 