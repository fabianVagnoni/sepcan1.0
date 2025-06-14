# SEPCAN MARINA - Backend API

<!-- Language Toggles -->
<div align="center">
<details open>
<summary><strong>🇪🇸 Español</strong></summary>
</div>

### 📋 Descripción

API backend desarrollada con **FastAPI** para el sistema SEPCAN MARINA. Proporciona servicios REST para la gestión de vehículos, trabajadores, trabajos, formularios e incidencias con detección automática mediante IA.

### 🏗️ Arquitectura

```
FastAPI Application
├── app/
│   ├── database/          # Configuración de base de datos
│   ├── models/           # Modelos SQLAlchemy
│   ├── routers/          # Endpoints de la API
│   ├── schemas/          # Esquemas Pydantic
│   └── __init__.py
├── main.py              # Punto de entrada de la aplicación
└── requirements.txt     # Dependencias
```

### 🚀 Tecnologías

- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para Python
- **Pydantic** - Validación de datos
- **Azure SQL** - Base de datos en la nube
- **Google Gemini AI** - Detección automática de incidencias
- **uvicorn** - Servidor ASGI

### 📊 Modelo de Base de Datos

El sistema utiliza 6 tablas principales:

1. **coches** - Información de vehículos
2. **trabajadores** - Datos de empleados
3. **trabajos** - Información de trabajos/clientes
4. **formularios_coche** - Formularios de vehículos
5. **formularios_trabajo** - Formularios de trabajos
6. **incidencias** - Incidencias detectadas

**Diagrama ER:** [`/design/Sepcan_Marina_ER_Model.jpg`](../design/Sepcan_Marina_ER_Model.jpg)

### 🛠️ Instalación y Configuración

#### 1. Requisitos Previos
```bash
# Python 3.9 o superior
python --version

# pip actualizado
pip install --upgrade pip
```

#### 2. Instalación de Dependencias
```bash
cd backend
pip install -r requirements.txt
```

#### 3. Configuración de Variables de Entorno

Crear archivo `.env` en el directorio backend:
```env
# Azure SQL Database
AZURE_SQL_USER=tu_usuario_db
AZURE_SQL_PASSWORD=tu_contraseña_db
AZURE_SQL_SERVER=tu_servidor.database.windows.net
AZURE_SQL_DATABASE=tu_base_de_datos

# Google Gemini AI
GEMMA_KEY=tu_clave_gemini_ai

# Configuración del servidor
PORT=8000
```

#### 4. Inicialización de la Base de Datos
```bash
# Las tablas se crean automáticamente al iniciar la aplicación
python main.py
```

#### 5. Ejecutar en Desarrollo
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 📡 API Endpoints

#### **Vehículos (`/coches`)**
- `POST /coches/` - Crear vehículo
- `GET /coches/` - Listar todos los vehículos
- `GET /coches/{id}` - Obtener vehículo por ID
- `PUT /coches/{id}` - Actualizar vehículo

#### **Trabajadores (`/trabajadores`)**
- `POST /trabajadores/` - Crear trabajador
- `GET /trabajadores/` - Listar todos los trabajadores
- `GET /trabajadores/{dni}` - Obtener trabajador por DNI
- `PUT /trabajadores/{dni}` - Actualizar trabajador

#### **Trabajos (`/trabajos`)**
- `POST /trabajos/` - Crear trabajo
- `GET /trabajos/` - Listar todos los trabajos
- `GET /trabajos/{id}` - Obtener trabajo por ID
- `PUT /trabajos/{id}` - Actualizar trabajo
- `GET /trabajos/available-for-coche-form` - Trabajos disponibles para formulario de coche
- `GET /trabajos/available-for-trabajo-form` - Trabajos disponibles para formulario de trabajo

#### **Formularios (`/formulario-coche`, `/formulario-trabajo`)**
- `POST /formulario-coche/` - Crear formulario de vehículo
- `GET /formularios-coche/` - Listar formularios de vehículos
- `POST /formulario-trabajo/` - Crear formulario de trabajo
- `GET /formularios-trabajo/` - Listar formularios de trabajos

#### **Incidencias (`/incidencias`)**
- `GET /incidencias/` - Listar todas las incidencias
- `GET /incidencias/{id}` - Obtener incidencia por ID
- `PUT /incidencias/{id}/resolve` - Marcar incidencia como resuelta
- `POST /incidencias/check-and-save-from-form` - Detectar incidencias automáticamente

#### **Consultas (`/query`)**
- `GET /query/combined-data` - Consultar datos combinados
  - Parámetros: `dni_trabajador`, `id_trabajo`, `id_coche`, `fecha_inicio`, `fecha_fin`, `format`
  - Formatos: `json`, `excel`

### 🤖 Detección Automática de Incidencias

El sistema utiliza **Google Gemini AI** para detectar automáticamente incidencias en los vehículos:

#### Niveles de Gravedad:
- **0 - Crítica:** Necesita atención inmediata
- **1 - Alta:** Necesita atención en menos de 1 hora
- **2 - Media:** Necesita atención hoy
- **3 - Baja:** Puede seguir en uso hoy
- **4 - Nula:** Sin incidencias

#### Proceso:
1. Al enviar un formulario de vehículo
2. La IA analiza el estado y comentarios
3. Determina el nivel de gravedad
4. Guarda automáticamente la incidencia si es necesario

### 🗃️ Estructura de Datos

#### Modelos Principales:

**Coche:**
```python
{
    "id_coche": int,
    "placa": int
}
```

**Trabajador:**
```python
{
    "dni": int,
    "nombre": str,
    "apellido": str,
    "fecha_nacimiento": str,  # DD/MM/YYYY
    "fecha_empleo": str       # DD/MM/YYYY
}
```

**Trabajo:**
```python
{
    "id": int,
    "cliente": str,
    "fecha": str  # DD/MM/YYYY
}
```

**FormularioCoche:**
```python
{
    "id_coche": int,
    "dni_trabajador": int,
    "id_trabajo": int,
    "otros": str,
    "fecha": str,           # DD/MM/YYYY
    "hora_partida": str,    # HH:MM
    "estado_coche": str
}
```

**Incidencia:**
```python
{
    "id_incidencia": int,
    "id_coche": int,
    "gravedad": str,
    "fecha": str,
    "resuelta": bool,
    "descripcion": str,
    "id_mecanico": int,
    "fecha_resolucion": str
}
```

### 🚀 Despliegue en Azure

#### Azure Web App

La aplicación se despliega automáticamente en Azure Web App mediante GitHub Actions:

**Archivo de configuración:** `.github/workflows/main_sepcan-operation-backend.yml`

#### Variables de Entorno en Azure:
```bash
AZURE_SQL_USER
AZURE_SQL_PASSWORD
AZURE_SQL_SERVER
AZURE_SQL_DATABASE
GEMMA_KEY
```

### 📈 Monitoreo y Logs

Los logs se configuran para Azure App Service:
- Nivel: INFO y superior
- Formato: Timestamp - Level - Module - Message
- Salida: stdout (capturado por Azure)

### 🔒 Seguridad

- Validación de datos con Pydantic
- Conexión segura a Azure SQL (SSL)
- Manejo de errores y excepciones
- Logging de operaciones críticas

### 🧪 Testing

```bash
# Instalar dependencias de testing
pip install pytest httpx

# Ejecutar tests (cuando estén disponibles)
pytest
```

</details>

<div align="center">
<details>
<summary><strong>🇬🇧 English</strong></summary>
</div>

### 📋 Description

Backend API developed with **FastAPI** for the SEPCAN MARINA system. Provides REST services for managing vehicles, workers, jobs, forms, and incidents with automatic AI detection.

### 🏗️ Architecture

```
FastAPI Application
├── app/
│   ├── database/          # Database configuration
│   ├── models/           # SQLAlchemy models
│   ├── routers/          # API endpoints
│   ├── schemas/          # Pydantic schemas
│   └── __init__.py
├── main.py              # Application entry point
└── requirements.txt     # Dependencies
```

### 🚀 Technologies

- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - Python ORM
- **Pydantic** - Data validation
- **Azure SQL** - Cloud database
- **Google Gemini AI** - Automatic incident detection
- **uvicorn** - ASGI server

### 📊 Database Model

The system uses 6 main tables:

1. **coches** - Vehicle information
2. **trabajadores** - Employee data
3. **trabajos** - Job/client information
4. **formularios_coche** - Vehicle forms
5. **formularios_trabajo** - Job forms
6. **incidencias** - Detected incidents

**ER Diagram:** [`/design/Sepcan_Marina_ER_Model.jpg`](../design/Sepcan_Marina_ER_Model.jpg)

### 🛠️ Installation and Setup

#### 1. Prerequisites
```bash
# Python 3.9 or higher
python --version

# Updated pip
pip install --upgrade pip
```

#### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### 3. Environment Variables Setup

Create `.env` file in backend directory:
```env
# Azure SQL Database
AZURE_SQL_USER=your_db_user
AZURE_SQL_PASSWORD=your_db_password
AZURE_SQL_SERVER=your_server.database.windows.net
AZURE_SQL_DATABASE=your_database

# Google Gemini AI
GEMMA_KEY=your_gemini_ai_key

# Server configuration
PORT=8000
```

#### 4. Database Initialization
```bash
# Tables are created automatically when starting the application
python main.py
```

#### 5. Run in Development
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 📡 API Endpoints

#### **Vehicles (`/coches`)**
- `POST /coches/` - Create vehicle
- `GET /coches/` - List all vehicles
- `GET /coches/{id}` - Get vehicle by ID
- `PUT /coches/{id}` - Update vehicle

#### **Workers (`/trabajadores`)**
- `POST /trabajadores/` - Create worker
- `GET /trabajadores/` - List all workers
- `GET /trabajadores/{dni}` - Get worker by DNI
- `PUT /trabajadores/{dni}` - Update worker

#### **Jobs (`/trabajos`)**
- `POST /trabajos/` - Create job
- `GET /trabajos/` - List all jobs
- `GET /trabajos/{id}` - Get job by ID
- `PUT /trabajos/{id}` - Update job
- `GET /trabajos/available-for-coche-form` - Available jobs for vehicle form
- `GET /trabajos/available-for-trabajo-form` - Available jobs for job form

#### **Forms (`/formulario-coche`, `/formulario-trabajo`)**
- `POST /formulario-coche/` - Create vehicle form
- `GET /formularios-coche/` - List vehicle forms
- `POST /formulario-trabajo/` - Create job form
- `GET /formularios-trabajo/` - List job forms

#### **Incidents (`/incidencias`)**
- `GET /incidencias/` - List all incidents
- `GET /incidencias/{id}` - Get incident by ID
- `PUT /incidencias/{id}/resolve` - Mark incident as resolved
- `POST /incidencias/check-and-save-from-form` - Automatically detect incidents

#### **Queries (`/query`)**
- `GET /query/combined-data` - Query combined data
  - Parameters: `dni_trabajador`, `id_trabajo`, `id_coche`, `fecha_inicio`, `fecha_fin`, `format`
  - Formats: `json`, `excel`

### 🤖 Automatic Incident Detection

The system uses **Google Gemini AI** to automatically detect vehicle incidents:

#### Severity Levels:
- **0 - Critical:** Needs immediate attention
- **1 - High:** Needs attention in less than 1 hour
- **2 - Medium:** Needs attention today
- **3 - Low:** Can continue in use today
- **4 - None:** No incidents

#### Process:
1. When submitting a vehicle form
2. AI analyzes state and comments
3. Determines severity level
4. Automatically saves incident if necessary

### 🗃️ Data Structure

#### Main Models:

**Vehicle:**
```python
{
    "id_coche": int,
    "placa": int
}
```

**Worker:**
```python
{
    "dni": int,
    "nombre": str,
    "apellido": str,
    "fecha_nacimiento": str,  # DD/MM/YYYY
    "fecha_empleo": str       # DD/MM/YYYY
}
```

**Job:**
```python
{
    "id": int,
    "cliente": str,
    "fecha": str  # DD/MM/YYYY
}
```

**VehicleForm:**
```python
{
    "id_coche": int,
    "dni_trabajador": int,
    "id_trabajo": int,
    "otros": str,
    "fecha": str,           # DD/MM/YYYY
    "hora_partida": str,    # HH:MM
    "estado_coche": str
}
```

**Incident:**
```python
{
    "id_incidencia": int,
    "id_coche": int,
    "gravedad": str,
    "fecha": str,
    "resuelta": bool,
    "descripcion": str,
    "id_mecanico": int,
    "fecha_resolucion": str
}
```

### 🚀 Azure Deployment

#### Azure Web App

The application deploys automatically to Azure Web App via GitHub Actions:

**Configuration file:** `.github/workflows/main_sepcan-operation-backend.yml`

#### Environment Variables in Azure:
```bash
AZURE_SQL_USER
AZURE_SQL_PASSWORD
AZURE_SQL_SERVER
AZURE_SQL_DATABASE
GEMMA_KEY
```

### 📈 Monitoring and Logs

Logs are configured for Azure App Service:
- Level: INFO and above
- Format: Timestamp - Level - Module - Message
- Output: stdout (captured by Azure)

### 🔒 Security

- Data validation with Pydantic
- Secure connection to Azure SQL (SSL)
- Error and exception handling
- Critical operation logging

### 🧪 Testing

```bash
# Install testing dependencies
pip install pytest httpx

# Run tests (when available)
pytest
```

</details> 