from sqlalchemy import Column, Boolean, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.database.connection import Base

# Define models according to ER diagram
class Coche(Base):
    __tablename__ = "coches"
    
    placa = Column(Integer, unique=True, nullable=False)
    id_coche = Column("ID", Integer, primary_key=True, index=True, autoincrement=False)

    # Relationships
    formularios_coche = relationship("FormularioCoche", back_populates="coche")
    formularios_trabajo = relationship("FormularioTrabajo", back_populates="coche")
    incidencias = relationship("Incidencia", back_populates="coche", foreign_keys="Incidencia.id_coche")

class Trabajador(Base):
    __tablename__ = "trabajadores"
    
    dni = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    fecha_nacimiento = Column(DateTime, nullable=False)
    fecha_empleo = Column(DateTime, nullable=False)
    
    # Relationships
    formularios_coche = relationship("FormularioCoche", back_populates="trabajador")
    formularios_trabajo = relationship("FormularioTrabajo", back_populates="trabajador")

class Trabajo(Base):
    __tablename__ = "trabajos"
    
    id = Column(Integer, primary_key=True, index=True)
    cliente = Column(String, nullable=False)
    fecha = Column(DateTime, nullable=False)
    
    # Relationships
    formulario_coche = relationship("FormularioCoche", back_populates="trabajo", uselist=False)
    formulario_trabajo = relationship("FormularioTrabajo", back_populates="trabajo", uselist=False)

class FormularioCoche(Base):
    __tablename__ = "formularios_coche"
    
    id_coche = Column(Integer, ForeignKey("coches.ID"), primary_key=True)
    dni_trabajador = Column(Integer, ForeignKey("trabajadores.dni"), primary_key=True)
    id_trabajo = Column(Integer, ForeignKey("trabajos.id"), primary_key=True)
    otros = Column(String, nullable=True)
    fecha = Column(DateTime, nullable=True)
    hora_partida = Column(String, nullable=True)
    estado_coche = Column(String, nullable=True)
    
    # Relationships
    coche = relationship("Coche", back_populates="formularios_coche")
    trabajador = relationship("Trabajador", back_populates="formularios_coche")
    trabajo = relationship("Trabajo", back_populates="formulario_coche")

class FormularioTrabajo(Base):
    __tablename__ = "formularios_trabajo"
    
    id_coche = Column(Integer, ForeignKey("coches.ID"), primary_key=True)
    dni_trabajador = Column(Integer, ForeignKey("trabajadores.dni"), primary_key=True)
    id_trabajo = Column(Integer, ForeignKey("trabajos.id"), primary_key=True)
    otros = Column(String, nullable=True)
    fecha = Column(DateTime, nullable=True)
    hora_final = Column(String, nullable=True)
    horas_trabajadas = Column(Float, nullable=True)
    lugar_trabajo = Column(String, nullable=True)
    tiempo_llegada = Column(Integer, nullable=True)
    
    # Relationships
    coche = relationship("Coche", back_populates="formularios_trabajo")
    trabajador = relationship("Trabajador", back_populates="formularios_trabajo")
    trabajo = relationship("Trabajo", back_populates="formulario_trabajo") 


class Incidencia(Base):
    __tablename__ = "incidencias"
    
    id_incidencia = Column(Integer, primary_key=True, index=True)
    id_coche = Column(Integer, ForeignKey("coches.ID"), nullable=False)
    gravedad = Column("Gravity", String, nullable=False)
    fecha = Column(DateTime, nullable=False)
    resuelta = Column("Resolved", Boolean, nullable=False)
    descripcion = Column(String, nullable=True)
    id_mecanico = Column(Integer, ForeignKey("trabajadores.dni"), nullable=True)
    fecha_resolucion = Column(DateTime, nullable=True)

    coche = relationship("Coche", back_populates="incidencias", foreign_keys=[id_coche])