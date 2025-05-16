from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.models.models import Trabajo, FormularioCoche, FormularioTrabajo
# Pydantic schemas need password removed in app.schemas.schemas.py
from app.schemas.schemas import TrabajoCreate, TrabajoUpdate, TrabajoOut, parse_date

router = APIRouter(
    prefix="/trabajos",
    tags=["trabajos"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=TrabajoOut) # Use TrabajoOut
def create_trabajo(trabajo: TrabajoCreate, db: Session = Depends(get_db)):
    # Optional: Check if ID already exists
    existing_trabajo = db.query(Trabajo).filter(Trabajo.id == trabajo.id).first()
    if existing_trabajo:
        raise HTTPException(status_code=400, detail=f"Trabajo con ID {trabajo.id} ya existe.")
        
    try:
        # Convert fecha string to datetime object if it exists
        fecha_datetime = None
        if trabajo.fecha:
            fecha_datetime = parse_date(trabajo.fecha)
        
        db_trabajo = Trabajo(
            id=trabajo.id, # Assuming ID is provided by user, as per frontend logic
            cliente=trabajo.cliente,
            fecha=fecha_datetime
        )
        db.add(db_trabajo)
        db.commit()
        db.refresh(db_trabajo)
        return db_trabajo
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al crear trabajo: {str(e)}")

# Endpoint to get trabajos that don't have a car formulary yet
@router.get("/available-for-coche-form", response_model=List[TrabajoOut])
def get_available_trabajos_for_coche_form(db: Session = Depends(get_db)):
    try:
        # Get all trabajos
        all_trabajos = db.query(Trabajo).all()
        
        # Get IDs of trabajos that already have a car formulary
        used_trabajo_ids = db.query(FormularioCoche.id_trabajo).all()
        used_ids = [id[0] for id in used_trabajo_ids]
        
        # Filter trabajos that don't have a car formulary
        available_trabajos = [trabajo for trabajo in all_trabajos if trabajo.id not in used_ids]
        
        return available_trabajos
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener trabajos disponibles: {str(e)}")

# Endpoint to get trabajos that don't have a trabajo formulary yet
@router.get("/available-for-trabajo-form", response_model=List[TrabajoOut])
def get_available_trabajos_for_trabajo_form(db: Session = Depends(get_db)):
    try:
        # Get all trabajos
        all_trabajos = db.query(Trabajo).all()
        
        # Get IDs of trabajos that already have a trabajo formulary
        used_trabajo_ids = db.query(FormularioTrabajo.id_trabajo).all()
        used_ids = [id[0] for id in used_trabajo_ids]
        
        # Filter trabajos that don't have a trabajo formulary
        available_trabajos = [trabajo for trabajo in all_trabajos if trabajo.id not in used_ids]
        
        return available_trabajos
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener trabajos disponibles: {str(e)}")

@router.get("/", response_model=List[TrabajoOut]) # Use TrabajoOut
def get_all_trabajos(db: Session = Depends(get_db)):
    trabajos = db.query(Trabajo).all()
    return trabajos

@router.put("/{id}", response_model=TrabajoOut) # Use TrabajoOut
def update_trabajo(id: int, trabajo_update_data: TrabajoUpdate, db: Session = Depends(get_db)):
    try:
        db_trabajo = db.query(Trabajo).filter(Trabajo.id == id).first()
        if not db_trabajo:
            raise HTTPException(status_code=404, detail="Trabajo no encontrado")
        
        # Password verification removed
        
        # Update fields if provided
        if trabajo_update_data.cliente is not None:
            db_trabajo.cliente = trabajo_update_data.cliente
        if trabajo_update_data.fecha is not None:
            db_trabajo.fecha = trabajo_update_data.fecha
        
        db.commit()
        db.refresh(db_trabajo)
        return db_trabajo
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al actualizar trabajo: {str(e)}")

@router.get("/{id}", response_model=TrabajoOut) # Use TrabajoOut
def get_trabajo(id: int, db: Session = Depends(get_db)):
    db_trabajo = db.query(Trabajo).filter(Trabajo.id == id).first()
    if not db_trabajo:
        raise HTTPException(status_code=404, detail="Trabajo no encontrado")
    return db_trabajo 