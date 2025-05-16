from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, String, Date
from typing import List, Optional
from datetime import datetime
import pandas as pd
from io import BytesIO
from fastapi.responses import StreamingResponse
from fastapi.responses import JSONResponse

from app.database.connection import get_db
from app.models.models import FormularioCoche, FormularioTrabajo, Coche, Trabajador, Trabajo

router = APIRouter(
    prefix="/query",
    tags=["query"],
    responses={404: {"description": "Not found"}},
)

@router.get("/combined-data")
def query_combined_data(
    dni_trabajador: Optional[int] = None,
    id_trabajo: Optional[int] = None,
    id_coche: Optional[int] = None,
    fecha_inicio: Optional[str] = None,
    fecha_fin: Optional[str] = None,
    format: str = Query("json", description="Response format: json or excel"),
    db: Session = Depends(get_db)
):
    print(f"Query params: dni_trabajador={dni_trabajador}, id_trabajo={id_trabajo}, id_coche={id_coche}, fecha_inicio={fecha_inicio}, fecha_fin={fecha_fin}, format={format}")
    
    try:
        # Query formularios coche
        query_coche = db.query(
            FormularioCoche,
            Coche.id_coche.label("id_coche"),
            Trabajador.nombre.label("nombre_trabajador"),
            Trabajador.apellido.label("apellido_trabajador"),
            Trabajo.cliente.label("cliente_trabajo"),
            Trabajo.fecha.label("fecha_trabajo")
        ).join(
            Coche, FormularioCoche.id_coche == Coche.id_coche
        ).join(
            Trabajador, FormularioCoche.dni_trabajador == Trabajador.dni
        ).join(
            Trabajo, FormularioCoche.id_trabajo == Trabajo.id
        )

        # Query formularios trabajo
        query_trabajo = db.query(
            FormularioTrabajo,
            Coche.id_coche.label("id_coche"),
            Trabajador.nombre.label("nombre_trabajador"),
            Trabajador.apellido.label("apellido_trabajador"),
            Trabajo.cliente.label("cliente_trabajo"),
            Trabajo.fecha.label("fecha_trabajo")
        ).join(
            Coche, FormularioTrabajo.id_coche == Coche.id_coche
        ).join(
            Trabajador, FormularioTrabajo.dni_trabajador == Trabajador.dni
        ).join(
            Trabajo, FormularioTrabajo.id_trabajo == Trabajo.id
        )

        # Apply filters
        if dni_trabajador:
            query_coche = query_coche.filter(FormularioCoche.dni_trabajador == dni_trabajador)
            query_trabajo = query_trabajo.filter(FormularioTrabajo.dni_trabajador == dni_trabajador)
        
        if id_trabajo:
            query_coche = query_coche.filter(FormularioCoche.id_trabajo == id_trabajo)
            query_trabajo = query_trabajo.filter(FormularioTrabajo.id_trabajo == id_trabajo)
        
        if id_coche:
            query_coche = query_coche.filter(FormularioCoche.id_coche == id_coche)
            query_trabajo = query_trabajo.filter(FormularioTrabajo.id_coche == id_coche)
        
        print(f'fecha_inicio: {fecha_inicio}')
        print(f'fecha_fin: {fecha_fin}')

        # Debug: Print all trabajo dates in the database
        all_trabajos = db.query(Trabajo).all()
        print("All trabajo dates in database:")
        for trabajo in all_trabajos:
            print(f"Trabajo ID: {trabajo.id}, Fecha: {trabajo.fecha}, Type: {type(trabajo.fecha)}")

        if fecha_inicio and fecha_fin and fecha_inicio != "" and fecha_fin != "":
            try:
                # Convert input dates from YYYY-MM-DD to datetime objects
                fecha_inicio_dt = datetime.strptime(fecha_inicio, "%Y-%m-%d")
                fecha_fin_dt = datetime.strptime(fecha_fin, "%Y-%m-%d")
                
                print(f"Date range for comparison:")
                print(f"fecha_inicio_dt: {fecha_inicio_dt}")
                print(f"fecha_fin_dt: {fecha_fin_dt}")

                # Convert to date objects for comparison
                fecha_inicio_date_obj = fecha_inicio_dt.date()
                fecha_fin_date_obj = fecha_fin_dt.date()

                # Filter based on Trabajo.fecha being a Date or DateTime type
                # Cast Trabajo.fecha to Date for consistent comparison
                query_coche = query_coche.filter(
                    func.cast(Trabajo.fecha, Date).between(fecha_inicio_date_obj, fecha_fin_date_obj)
                )
                query_trabajo = query_trabajo.filter(
                    func.cast(Trabajo.fecha, Date).between(fecha_inicio_date_obj, fecha_fin_date_obj)
                )

                # Print the queries for debugging
                print(f"Query coche SQL: {query_coche.statement.compile(compile_kwargs={'literal_binds': True})}")
                print(f"Query trabajo SQL: {query_trabajo.statement.compile(compile_kwargs={'literal_binds': True})}")

            except ValueError as e:
                print(f"Error in date conversion: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Invalid date format. Use YYYY-MM-DD format: {str(e)}")

        # Execute queries
        results_coche = query_coche.all()
        results_trabajo = query_trabajo.all()

        print(f"Found {len(results_coche)} coche results and {len(results_trabajo)} trabajo results")

        # Transform results
        data_coche = [
            {
                "tipo": "formulario_coche",
                "id_coche": result.FormularioCoche.id_coche,
                # "placa_coche": result.placa_coche,
                "dni_trabajador": result.FormularioCoche.dni_trabajador,
                "nombre_trabajador": result.nombre_trabajador,
                "apellido_trabajador": result.apellido_trabajador,
                "id_trabajo": result.FormularioCoche.id_trabajo,
                "cliente_trabajo": result.cliente_trabajo,
                "fecha_trabajo": result.fecha_trabajo,
                "otros": result.FormularioCoche.otros,
                "fecha": result.FormularioCoche.fecha,
                "hora_partida": result.FormularioCoche.hora_partida,
                "estado_coche": result.FormularioCoche.estado_coche
            }
            for result in results_coche
        ]

        data_trabajo = [
            {
                "tipo": "formulario_trabajo",
                "id_coche": result.FormularioTrabajo.id_coche,
                "dni_trabajador": result.FormularioTrabajo.dni_trabajador,
                "nombre_trabajador": result.nombre_trabajador,
                "apellido_trabajador": result.apellido_trabajador,
                "id_trabajo": result.FormularioTrabajo.id_trabajo,
                "cliente_trabajo": result.cliente_trabajo,
                "fecha_trabajo": result.fecha_trabajo,
                "otros": result.FormularioTrabajo.otros,
                "fecha": result.FormularioTrabajo.fecha,
                "hora_final": result.FormularioTrabajo.hora_final,
                "horas_trabajadas": result.FormularioTrabajo.horas_trabajadas,
                "lugar_trabajo": result.FormularioTrabajo.lugar_trabajo,
                "tiempo_llegada": result.FormularioTrabajo.tiempo_llegada
            }
            for result in results_trabajo
        ]

        # Prepare response
        combined_data = {
            "formularios_coche": data_coche,
            "formularios_trabajo": data_trabajo
        }

        # Return Excel if requested
        if format.lower() == "excel":
            try:
                if not data_coche and not data_trabajo:
                    return JSONResponse(
                        status_code=404,
                        content={"detail": "No hay datos para exportar con los filtros seleccionados"}
                    )

                df_coche = pd.DataFrame(data_coche) if data_coche else None
                df_trabajo = pd.DataFrame(data_trabajo) if data_trabajo else None

                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"datos_combinados_{timestamp}.xlsx"
                output = BytesIO()

                with pd.ExcelWriter(output, engine="openpyxl") as writer:
                    if df_coche is not None and not df_coche.empty:
                        df_coche.to_excel(writer, sheet_name="Formularios Coche", index=False)
                    if df_trabajo is not None and not df_trabajo.empty:
                        df_trabajo.to_excel(writer, sheet_name="Formularios Trabajo", index=False)

                output.seek(0)
                return StreamingResponse(
                    output,
                    media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    headers={
                        "Content-Disposition": f"attachment; filename={filename}",
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        "Pragma": "no-cache",
                        "Expires": "0"
                    }
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error generating Excel file: {str(e)}")

        return combined_data

    except Exception as e:
        print(f"Error in query_combined_data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}") 