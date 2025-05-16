from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from google import genai
from datetime import datetime
from app.schemas.schemas import FormularioCocheCreate, IncidenciaCreate, IncidenciaOut, parse_date, format_date
from app.models.models import Incidencia, Trabajador
from app.database.connection import get_db
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    tags=["incidencias"],
    prefix="/incidencias",
    responses={404: {"description": "Not found"}},
)

GemmaKey = os.getenv("GEMMA_KEY")

def determine_incidencia(formulario: FormularioCocheCreate):
    """
    Determine if there's an incidence based on the car form data using Gemini AI.
    Returns a tuple of (severity_level: int, severity_name: str)
    """
    query = f"""Tenemos el coche {formulario.id_coche} y tenemos la siguiente informacion: {formulario.otros}
                (Si no hay información, significa que el empleado no encontró nada que comentar).
                También contamos con información sobre el estado de limpieza del coche: {formulario.estado_coche}.
                Debes determinar si el coche tiene una incidencia. Entiende que una incidencia es un problema que impide 
                que el coche funcione correctamente, que el trabajador pueda usarlo cómoda o sosteniblemente, o que
                incumpla con las normativas de seguridad vial españolas. Considera que el estado de limpieza del coche
                afecta a que el trabajador pueda usarlo cómoda o sosteniblemente.
                
                Hay cuatro niveles de incidencias:
                - (0) Crítica: El coche NECESITA ATENCIÓN INMEDIATA.
                - (1) Alta: El coche necesita atención en menos de 1 hora.
                - (2) Media: El coche necesita atención hoy, pero no es urgente.
                - (3) Baja: El coche necesita atención, pero puede seguir siendo utilizado hoy.
                - (4) Nula: El coche no tiene incidencias.
                
                Debes devolver ÚNICAMENTE el nivel de incidencia. NO DEVUELVAS NADA MÁS.
    """

    client = genai.Client(api_key=GemmaKey)

    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=query
    )
    
    severity_level = response.text.strip()
    print(f"Severity level from AI: {severity_level}")
    
    # Map severity level to descriptive name
    severity_names = {
        "0": "Crítica",
        "1": "Alta", 
        "2": "Media",
        "3": "Baja",
        "4": "Nula"
    }
    
    # Parse the response to get the numeric severity level
    try:
        severity_num = int(severity_level)
        severity_name = severity_names.get(str(severity_num), "Desconocida")
        return severity_num, severity_name
    except ValueError:
        # If we can't parse it as a number, return a default
        print(f"Could not parse severity level: {severity_level}")
        return 4, "Nula"  # Default to no incidence

def save_incidencia(db: Session, formulario: FormularioCocheCreate, severity_num: int, severity_name: str):
    """
    Save an incidence in the database if severity level indicates one (0-3).
    """
    # Only save incidences for severity levels 0-3 (Crítica, Alta, Media, Baja)
    # Level 4 (Nula) means no incidence
    if severity_num < 4:
        # Create the description string combining car state and other comments
        descripcion = f"Estado del Coche: {formulario.estado_coche or 'No especificado'}. Otros Comentarios: {formulario.otros or 'Ninguno'}"
        
        # Parse the date or use current date
        current_date = datetime.now()
        if formulario.fecha:
            try:
                fecha = parse_date(formulario.fecha)
            except ValueError:
                fecha = current_date
        else:
            fecha = current_date
        
        incidencia = Incidencia(
            id_coche=formulario.id_coche,
            gravedad=severity_name,
            fecha=fecha,
            resuelta=False,  # New incidences are not resolved by default
            descripcion=descripcion  # Add the description field
        )
        
        db.add(incidencia)
        db.commit()
        db.refresh(incidencia)
        return incidencia
    return None

@router.post("/check-and-save-from-form", response_model=dict)
def check_and_save_incidencia(formulario: FormularioCocheCreate, db: Session = Depends(get_db)):
    """
    Analyzes a car form, determines if there's an incidence, and saves it to the database if needed.
    """
    try:
        # Determine if there's an incidence
        severity_num, severity_name = determine_incidencia(formulario)
        
        # If there's an incidence (severity 0-3), save it
        incidencia = None
        if severity_num < 4:
            incidencia = save_incidencia(db, formulario, severity_num, severity_name)
            return {
                "has_incidencia": True,
                "severity_level": severity_num,
                "severity_name": severity_name,
                "saved": True,
                "incidencia_id": incidencia.id_incidencia
            }
        else:
            return {
                "has_incidencia": False,
                "severity_level": severity_num,
                "severity_name": severity_name,
                "saved": False
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing incidence: {str(e)}")

@router.get("/", response_model=List[IncidenciaOut])
def get_all_incidencias(db: Session = Depends(get_db)):
    """
    Get all incidences from the database.
    """
    try:
        incidencias = db.query(Incidencia).all()
        return incidencias
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving incidences: {str(e)}")

@router.get("/{id_incidencia}", response_model=IncidenciaOut)
def get_incidencia(id_incidencia: int, db: Session = Depends(get_db)):
    """
    Get a specific incidence by ID.
    """
    incidencia = db.query(Incidencia).filter(Incidencia.id_incidencia == id_incidencia).first()
    if not incidencia:
        raise HTTPException(status_code=404, detail="Incidencia not found")
    return incidencia

@router.put("/{id_incidencia}/resolve", response_model=IncidenciaOut)
def resolve_incidencia(id_incidencia: int, id_mecanico: int = Query(..., description="The ID of the mechanic who resolved the issue"), db: Session = Depends(get_db)):
    """
    Mark an incidence as resolved with the mechanic ID and current date.
    """
    incidencia = db.query(Incidencia).filter(Incidencia.id_incidencia == id_incidencia).first()
    if not incidencia:
        raise HTTPException(status_code=404, detail="Incidencia not found")
    
    # Verify the mechanic exists
    mecanico = db.query(Trabajador).filter(Trabajador.dni == id_mecanico).first()
    if not mecanico:
        raise HTTPException(status_code=404, detail=f"Mechanic with DNI {id_mecanico} not found")
    
    incidencia.resuelta = True
    incidencia.id_mecanico = id_mecanico
    incidencia.fecha_resolucion = datetime.now()
    
    db.commit()
    db.refresh(incidencia)
    return incidencia
