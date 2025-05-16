from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from app.database.connection import get_db
from app.models.models import Coche
from app.schemas.schemas import CocheCreate, CocheUpdate, CocheOut

router = APIRouter(
    prefix="/coches",
    tags=["coches"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=CocheOut)
def create_coche(coche: CocheCreate, db: Session = Depends(get_db)):
    existing_coche_id = db.query(Coche).filter(Coche.id_coche == coche.id_coche).first()
    if existing_coche_id:
        raise HTTPException(status_code=400, detail=f"Coche con ID {coche.id_coche} ya existe.")
    existing_coche_placa = db.query(Coche).filter(Coche.placa == coche.placa).first()
    if existing_coche_placa:
        raise HTTPException(status_code=400, detail=f"Coche con placa {coche.placa} ya existe.")

    try:
        db_coche = Coche(
            id_coche=coche.id_coche, 
            placa=coche.placa
        )
        db.add(db_coche)
        db.commit()
        db.refresh(db_coche)
        return db_coche
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al crear coche: {str(e)}")

@router.put("/{id_coche}", response_model=CocheOut)
def update_coche(id_coche: int, coche_update_data: CocheUpdate, db: Session = Depends(get_db)):
    try:
        db_coche = db.query(Coche).filter(Coche.id_coche == id_coche).first()
        if not db_coche:
            raise HTTPException(status_code=404, detail="Coche no encontrado")
        
        if coche_update_data.placa is not None:
            if coche_update_data.placa != db_coche.placa:
                existing_placa = db.query(Coche).filter(Coche.placa == coche_update_data.placa).first()
                if existing_placa:
                    raise HTTPException(status_code=400, detail=f"La placa {coche_update_data.placa} ya está registrada.")
            db_coche.placa = coche_update_data.placa
        
        db.commit()
        db.refresh(db_coche)
        return db_coche
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al actualizar coche: {str(e)}")

@router.get("/{id_coche}", response_model=CocheOut)
def get_coche(id_coche: int, db: Session = Depends(get_db)):
    db_coche = db.query(Coche).filter(Coche.id_coche == id_coche).first()
    if not db_coche:
        raise HTTPException(status_code=404, detail="Coche no encontrado")
    
    return db_coche

@router.get("/", response_model=List[CocheOut])
def get_all_coches(db: Session = Depends(get_db)):
    coches = db.query(Coche).all()
    return coches 