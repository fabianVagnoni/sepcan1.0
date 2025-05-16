from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging
import sys
import traceback

from app.database.connection import get_db
from app.models.models import FormularioCoche, FormularioTrabajo, Coche, Trabajador, Trabajo
from app.schemas.schemas import FormularioCocheCreate, FormularioTrabajoCreate, FormularioCocheOut, FormularioTrabajoOut, parse_date
from app.routers.incidencias import determine_incidencia, save_incidencia

# Configure logging for Azure Web App
logger = logging.getLogger("sepcan_marina")
logger.setLevel(logging.DEBUG)

# Add StreamHandler to ensure logs go to stdout/stderr which Azure captures
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

router = APIRouter(
    tags=["formularios"],
    responses={404: {"description": "Not found"}},
)

# Formulario Coche endpoints
@router.post("/formulario-coche/", response_model=dict)
def create_formulario_coche(formulario: FormularioCocheCreate, db: Session = Depends(get_db)):
    try:
        # Add logging for incoming data
        logger.info("Received FormularioCoche request")
        logger.debug(f"id_coche: {formulario.id_coche}")
        logger.debug(f"dni_trabajador: {formulario.dni_trabajador}")
        logger.debug(f"id_trabajo: {formulario.id_trabajo}")
        logger.debug(f"fecha: {formulario.fecha}")
        
        # Check if coche exists by id_coche
        coche = db.query(Coche).filter(Coche.id_coche == formulario.id_coche).first()
        if not coche:
            logger.error(f"Coche with id_coche={formulario.id_coche} not found")
            raise HTTPException(status_code=404, detail="Coche no encontrado")
        logger.debug(f"Coche found: {coche.id_coche}")
        
        # Check if trabajador exists
        trabajador = db.query(Trabajador).filter(Trabajador.dni == formulario.dni_trabajador).first()
        if not trabajador:
            logger.error(f"Trabajador with dni={formulario.dni_trabajador} not found")
            raise HTTPException(status_code=404, detail="Trabajador no encontrado")
        logger.debug(f"Trabajador found: {trabajador.dni}")
        
        # Check if trabajo exists
        trabajo = db.query(Trabajo).filter(Trabajo.id == formulario.id_trabajo).first()
        if not trabajo:
            logger.error(f"Trabajo with id={formulario.id_trabajo} not found")
            raise HTTPException(status_code=404, detail="Trabajo no encontrado")
        logger.debug(f"Trabajo found: {trabajo.id}")
        
        # Check if job already has a car formulary
        existing_formulario = db.query(FormularioCoche).filter(FormularioCoche.id_trabajo == formulario.id_trabajo).first()
        if existing_formulario:
            logger.error(f"Trabajo with id={formulario.id_trabajo} already has a formulario coche")
            raise HTTPException(status_code=400, detail="Este trabajo ya tiene un formulario de coche asociado")
        logger.debug(f"No existing formulario coche found for trabajo id={formulario.id_trabajo}")
        
        # Convert fecha string to datetime object if it exists
        fecha_datetime = None
        if formulario.fecha:
            logger.debug(f"Processing fecha: {formulario.fecha}, type: {type(formulario.fecha)}")
            try:
                fecha_datetime = parse_date(formulario.fecha)
                logger.debug(f"Converted fecha string '{formulario.fecha}' to datetime object: {fecha_datetime}")
            except Exception as date_error:
                logger.error(f"Error parsing fecha: {str(date_error)}")
                raise HTTPException(status_code=400, detail=f"Error al procesar la fecha: {str(date_error)}")
        
        # Create formulario
        logger.debug(f"Creating FormularioCoche object")
        db_formulario = FormularioCoche(
            id_coche=formulario.id_coche,
            dni_trabajador=formulario.dni_trabajador,
            id_trabajo=formulario.id_trabajo,
            otros=formulario.otros,
            fecha=fecha_datetime,  # Use the datetime object instead of string
            hora_partida=formulario.hora_partida,
            estado_coche=formulario.estado_coche
        )
        logger.debug(f"FormularioCoche object created successfully")
        
        # Add to database and commit
        logger.debug(f"Adding FormularioCoche to database")
        db.add(db_formulario)
        logger.debug(f"Committing transaction")
        db.commit()
        logger.debug(f"Refreshing object from database")
        db.refresh(db_formulario)
        logger.debug(f"FormularioCoche successfully added to database")
        
        # Automatically check for incidences
        severity_num, severity_name = determine_incidencia(formulario)
        incidence_result = {}
        
        # If there's an incidence (severity 0-3), save it
        if severity_num < 4:
            incidencia = save_incidencia(db, formulario, severity_num, severity_name)
            incidence_result = {
                "has_incidencia": True,
                "severity_level": severity_num,
                "severity_name": severity_name,
                "incidencia_id": incidencia.id_incidencia if incidencia else None,
                "descripcion": incidencia.descripcion if incidencia else None
            }
        else:
            incidence_result = {
                "has_incidencia": False,
                "severity_level": severity_num,
                "severity_name": severity_name
            }
        
        # Return success with incidence information
        return {
            "success": True, 
            "message": "Formulario de coche creado exitosamente",
            "incidence": incidence_result
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al crear formulario de coche: {str(e)}")

@router.get("/formularios-coche/", response_model=List[FormularioCocheOut])
def get_all_formularios_coche(db: Session = Depends(get_db)):
    try:
        formularios = db.query(FormularioCoche).all()
        return formularios
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener formularios de coche: {str(e)}")

# Formulario Trabajo endpoints
@router.post("/formulario-trabajo/", response_model=dict)
def create_formulario_trabajo(formulario: FormularioTrabajoCreate, db: Session = Depends(get_db)):
    try:
        # Enhanced logging for incoming data
        logger.info("Received FormularioTrabajo request")
        logger.debug(f"id_coche: {formulario.id_coche}")
        logger.debug(f"dni_trabajador: {formulario.dni_trabajador}")
        logger.debug(f"id_trabajo: {formulario.id_trabajo}")
        logger.debug(f"fecha: {formulario.fecha}")
        logger.debug(f"hora_final: {formulario.hora_final}")
        logger.debug(f"horas_trabajadas: {formulario.horas_trabajadas} (type: {type(formulario.horas_trabajadas)})")
        logger.debug(f"lugar_trabajo: {formulario.lugar_trabajo}")
        logger.debug(f"tiempo_llegada: {formulario.tiempo_llegada} (type: {type(formulario.tiempo_llegada)})")
        logger.debug(f"otros: {formulario.otros}")
        
        # Check if coche exists by id_coche
        logger.debug(f"Checking if coche with id_coche={formulario.id_coche} exists")
        coche = db.query(Coche).filter(Coche.id_coche == formulario.id_coche).first()
        if not coche:
            logger.error(f"Coche with id_coche={formulario.id_coche} not found")
            raise HTTPException(status_code=404, detail="Coche no encontrado")
        logger.debug(f"Coche found: {coche.id_coche}")
        
        # Check if trabajador exists
        logger.debug(f"Checking if trabajador with dni={formulario.dni_trabajador} exists")
        trabajador = db.query(Trabajador).filter(Trabajador.dni == formulario.dni_trabajador).first()
        if not trabajador:
            logger.error(f"Trabajador with dni={formulario.dni_trabajador} not found")
            raise HTTPException(status_code=404, detail="Trabajador no encontrado")
        logger.debug(f"Trabajador found: {trabajador.dni}")
        
        # Check if trabajo exists
        logger.debug(f"Checking if trabajo with id={formulario.id_trabajo} exists")
        trabajo = db.query(Trabajo).filter(Trabajo.id == formulario.id_trabajo).first()
        if not trabajo:
            logger.error(f"Trabajo with id={formulario.id_trabajo} not found")
            raise HTTPException(status_code=404, detail="Trabajo no encontrado")
        logger.debug(f"Trabajo found: {trabajo.id}")
        
        # Check if job already has a job formulary
        logger.debug(f"Checking if trabajo already has a formulario")
        existing_formulario = db.query(FormularioTrabajo).filter(FormularioTrabajo.id_trabajo == formulario.id_trabajo).first()
        if existing_formulario:
            logger.error(f"Trabajo with id={formulario.id_trabajo} already has a formulario")
            raise HTTPException(status_code=400, detail="Este trabajo ya tiene un formulario de trabajo asociado")
        logger.debug(f"No existing formulario found for trabajo id={formulario.id_trabajo}")
        
        # Log date conversion if applicable
        if formulario.fecha:
            logger.debug(f"Processing fecha: {formulario.fecha}, type: {type(formulario.fecha)}")
            try:
                parsed_date = parse_date(formulario.fecha)
                logger.debug(f"Parsed fecha: {parsed_date}")
            except Exception as date_error:
                logger.error(f"Error parsing fecha: {str(date_error)}")
                raise HTTPException(status_code=400, detail=f"Error al procesar la fecha: {str(date_error)}")
        
        # Create formulario
        logger.debug(f"Creating FormularioTrabajo object")
        try:
            # Convert fecha string to datetime object if it exists
            fecha_datetime = None
            if formulario.fecha:
                fecha_datetime = parse_date(formulario.fecha)
                logger.debug(f"Converted fecha string '{formulario.fecha}' to datetime object: {fecha_datetime}")
            
            db_formulario = FormularioTrabajo(
                id_coche=formulario.id_coche,
                dni_trabajador=formulario.dni_trabajador,
                id_trabajo=formulario.id_trabajo,
                otros=formulario.otros,
                fecha=fecha_datetime,  # Use the datetime object instead of string
                hora_final=formulario.hora_final,
                horas_trabajadas=formulario.horas_trabajadas,
                lugar_trabajo=formulario.lugar_trabajo,
                tiempo_llegada=formulario.tiempo_llegada
            )
            logger.debug(f"FormularioTrabajo object created successfully")
        except Exception as obj_error:
            logger.error(f"Error creating FormularioTrabajo object: {str(obj_error)}")
            raise
        
        # Add to database
        logger.debug(f"Adding FormularioTrabajo to database")
        try:
            db.add(db_formulario)
            logger.debug(f"Committing transaction")
            db.commit()
            logger.debug(f"Refreshing object from database")
            db.refresh(db_formulario)
            logger.debug(f"FormularioTrabajo successfully added to database")
        except Exception as db_error:
            logger.error(f"Database error: {str(db_error)}")
            raise
        
        logger.info(f"FormularioTrabajo created successfully for trabajo_id={formulario.id_trabajo}")
        return {"success": True, "message": "Formulario de trabajo creado exitosamente"}
    except HTTPException as http_e:
        db.rollback()
        logger.error(f"HTTP exception: {http_e.detail}")
        raise http_e
    except Exception as e:
        db.rollback()
        logger.error(f"Unhandled exception: {str(e)}")
        logger.error(f"Exception type: {type(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=f"Error al crear formulario de trabajo: {str(e)}")

@router.get("/formularios-trabajo/", response_model=List[FormularioTrabajoOut])
def get_all_formularios_trabajo(db: Session = Depends(get_db)):
    try:
        formularios = db.query(FormularioTrabajo).all()
        return formularios
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al obtener formularios de trabajo: {str(e)}") 