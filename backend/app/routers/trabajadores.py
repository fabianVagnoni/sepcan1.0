from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.models.models import Trabajador
from app.schemas.schemas import TrabajadorCreate, TrabajadorUpdate, TrabajadorOut

router = APIRouter(
    prefix="/trabajadores",
    tags=["trabajadores"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=TrabajadorOut)
def create_trabajador(trabajador: TrabajadorCreate, db: Session = Depends(get_db)):
    existing_trabajador = db.query(Trabajador).filter(Trabajador.dni == trabajador.dni).first()
    if existing_trabajador:
        raise HTTPException(status_code=400, detail=f"Trabajador con DNI {trabajador.dni} ya existe.")

    try:
        db_trabajador = Trabajador(
            dni=trabajador.dni,
            nombre=trabajador.nombre,
            apellido=trabajador.apellido,
            fecha_nacimiento=trabajador.fecha_nacimiento,
            fecha_empleo=trabajador.fecha_empleo,
        )
        db.add(db_trabajador)
        db.commit()
        db.refresh(db_trabajador)
        return db_trabajador
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al crear trabajador: {str(e)}")

@router.put("/{dni}", response_model=TrabajadorOut)
def update_trabajador(dni: int, trabajador_update_data: TrabajadorUpdate, db: Session = Depends(get_db)):
    try:
        db_trabajador = db.query(Trabajador).filter(Trabajador.dni == dni).first()
        if not db_trabajador:
            raise HTTPException(status_code=404, detail="Trabajador no encontrado")
        
        if trabajador_update_data.nombre is not None:
            db_trabajador.nombre = trabajador_update_data.nombre
        if trabajador_update_data.apellido is not None:
            db_trabajador.apellido = trabajador_update_data.apellido
        if trabajador_update_data.fecha_nacimiento is not None:
            db_trabajador.fecha_nacimiento = trabajador_update_data.fecha_nacimiento
        if trabajador_update_data.fecha_empleo is not None:
            db_trabajador.fecha_empleo = trabajador_update_data.fecha_empleo
        
        db.commit()
        db.refresh(db_trabajador)
        return db_trabajador
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al actualizar trabajador: {str(e)}")

@router.get("/{dni}", response_model=TrabajadorOut)
def get_trabajador(dni: int, db: Session = Depends(get_db)):
    db_trabajador = db.query(Trabajador).filter(Trabajador.dni == dni).first()
    if not db_trabajador:
        raise HTTPException(status_code=404, detail="Trabajador no encontrado")
    return db_trabajador

@router.get("/", response_model=List[TrabajadorOut])
def get_all_trabajadores(db: Session = Depends(get_db)):
    trabajadores = db.query(Trabajador).all()
    return trabajadores 