from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

# Date format constants
DATE_FORMAT = "%d/%m/%Y"

# --- Helper Functions for Date Conversion ---
def format_date(date_obj):
    """Convert datetime to DD/MM/YYYY format string."""
    if not date_obj:
        return None
    return date_obj.strftime(DATE_FORMAT)

def parse_date(date_str):
    """Parse date string in either DD/MM/YYYY or YYYY-MM-DD format."""
    if not date_str:
        return None
    
    try:
        # Try DD/MM/YYYY format first
        return datetime.strptime(date_str, DATE_FORMAT)
    except ValueError:
        try:
            # Try YYYY-MM-DD format (common from frontend)
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            raise ValueError(f"Date must be in DD/MM/YYYY or YYYY-MM-DD format, got {date_str}")

# --- Base Models for Responses (Explicitly Named) ---
class CocheOut(BaseModel):
    id_coche: int
    placa: int

    class Config:
        orm_mode = True # Or from_attributes = True for Pydantic v2

class TrabajadorOut(BaseModel):
    dni: int
    nombre: str
    apellido: str
    fecha_nacimiento: str
    fecha_empleo: str

    class Config:
        orm_mode = True
        
    @validator('fecha_nacimiento', 'fecha_empleo', pre=True)
    def format_dates(cls, v):
        if isinstance(v, datetime):
            return format_date(v)
        return v

class TrabajoOut(BaseModel):
    id: int
    cliente: str
    fecha: str

    class Config:
        orm_mode = True
        
    @validator('fecha', pre=True)
    def format_date(cls, v):
        if isinstance(v, datetime):
            return format_date(v)
        return v

# --- Schemas for Creating Data (Payloads) ---
class CocheCreate(BaseModel):
    id_coche: int # Assuming user provides ID
    placa: int
    # marca, modelo, fechas, password removed

class TrabajadorCreate(BaseModel):
    dni: int
    nombre: str
    apellido: str
    fecha_nacimiento: str
    fecha_empleo: str
    # password removed
    
    @validator('fecha_nacimiento', 'fecha_empleo')
    def validate_dates(cls, v):
        parse_date(v)  # This will raise ValueError if format is incorrect
        return v

class TrabajoCreate(BaseModel):
    id: int # Assuming user provides ID
    cliente: str
    fecha: str
    # password removed
    
    @validator('fecha')
    def validate_date(cls, v):
        parse_date(v)  # This will raise ValueError if format is incorrect
        return v

# --- Schemas for Updating Data (Payloads) ---
class CocheUpdate(BaseModel):
    placa: Optional[int] = None
    # marca, modelo, fechas, password removed

class TrabajadorUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    fecha_empleo: Optional[str] = None
    # password removed
    
    @validator('fecha_nacimiento', 'fecha_empleo')
    def validate_dates(cls, v):
        if v is not None:
            parse_date(v)  # This will raise ValueError if format is incorrect
        return v

class TrabajoUpdate(BaseModel):
    cliente: Optional[str] = None
    fecha: Optional[str] = None
    # password removed
    
    @validator('fecha')
    def validate_date(cls, v):
        if v is not None:
            parse_date(v)  # This will raise ValueError if format is incorrect
        return v

# --- Schemas for Formularios (remain unchanged) ---
class FormularioCocheCreate(BaseModel):
    id_coche: int
    dni_trabajador: int
    id_trabajo: int
    otros: Optional[str] = None
    fecha: Optional[str] = None
    hora_partida: Optional[str] = None
    estado_coche: Optional[str] = None
    
    @validator('fecha')
    def validate_date(cls, v):
        if v is not None:
            parse_date(v)  # This will raise ValueError if format is incorrect
        return v

class FormularioTrabajoCreate(BaseModel):
    id_coche: int
    dni_trabajador: int
    id_trabajo: int
    otros: Optional[str] = None
    fecha: Optional[str] = None
    hora_final: Optional[str] = None
    horas_trabajadas: Optional[float] = None
    lugar_trabajo: Optional[str] = None
    tiempo_llegada: Optional[int] = None
    
    @validator('fecha')
    def validate_date(cls, v):
        if v is not None:
            parse_date(v)  # This will raise ValueError if format is incorrect
        return v

# --- Schemas for Incidencias ---
class IncidenciaBase(BaseModel):
    id_coche: int
    gravedad: str
    fecha: str # Consider using datetime if appropriate for validation/conversion
    resuelta: bool
    descripcion: Optional[str] = None
    id_mecanico: Optional[int] = None
    fecha_resolucion: Optional[str] = None
    
    @validator('fecha', 'fecha_resolucion')
    def validate_dates(cls, v, values, **kwargs):
        if v is not None:
            parse_date(v)  # This will raise ValueError if format is incorrect
        return v

class IncidenciaCreate(IncidenciaBase):
    pass

class IncidenciaOut(IncidenciaBase):
    id_incidencia: int

    class Config:
        orm_mode = True # Or from_attributes = True for Pydantic v2
        
    @validator('fecha', 'fecha_resolucion', pre=True)
    def format_dates(cls, v):
        if isinstance(v, datetime):
            return format_date(v)
        return v

class IncidenciaUpdate(BaseModel):
    gravedad: Optional[str] = None
    fecha: Optional[str] = None # Consider using datetime
    resuelta: Optional[bool] = None
    descripcion: Optional[str] = None
    id_mecanico: Optional[int] = None
    fecha_resolucion: Optional[str] = None
    
    @validator('fecha', 'fecha_resolucion')
    def validate_dates(cls, v):
        if v is not None:
            parse_date(v)  # This will raise ValueError if format is incorrect
        return v

# --- Schemas for Formulario Responses ---
class FormularioCocheOut(BaseModel):
    id_coche: int
    dni_trabajador: int
    id_trabajo: int
    otros: Optional[str] = None
    fecha: Optional[str] = None
    hora_partida: Optional[str] = None
    estado_coche: Optional[str] = None

    class Config:
        orm_mode = True # Or from_attributes = True
        
    @validator('fecha', pre=True)
    def format_date(cls, v):
        if isinstance(v, datetime):
            return format_date(v)
        return v

class FormularioTrabajoOut(BaseModel):
    id_coche: int
    dni_trabajador: int
    id_trabajo: int
    otros: Optional[str] = None
    fecha: Optional[str] = None
    hora_final: Optional[str] = None
    horas_trabajadas: Optional[float] = None
    lugar_trabajo: Optional[str] = None
    tiempo_llegada: Optional[int] = None

    class Config:
        orm_mode = True # Or from_attributes = True
        
    @validator('fecha', pre=True)
    def format_date(cls, v):
        if isinstance(v, datetime):
            return format_date(v)
        return v 