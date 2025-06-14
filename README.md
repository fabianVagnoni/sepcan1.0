# SEPCAN MARINA - Sistema de Gestión de Operaciones

<!-- Language Selection -->
<div align="center">
<a href="#español">🇪🇸 Español</a> | <a href="#english">🇬🇧 English</a>
</div>

---

## Español

### 📋 Descripción del Proyecto

SEPCAN MARINA es un sistema integral de gestión de operaciones diseñado para empresas de servicios que utilizan vehículos. El sistema permite gestionar formularios de vehículos, trabajos realizados, incidencias, y generar reportes exportables.

### 🏗️ Arquitectura del Sistema

El proyecto está desplegado en **Microsoft Azure** con la siguiente arquitectura:

```
Frontend (Azure Static Web App)
    ↕️
Backend (Azure Web App - FastAPI)
    ↕️
Base de Datos (Azure SQL Database)
```

### 🚀 Tecnologías Utilizadas

**Frontend:**
- React 18 + TypeScript
- Vite (Build Tool)
- Material-UI (MUI)
- React Router
- Axios

**Backend:**
- FastAPI
- SQLAlchemy (ORM)
- Pydantic (Validación de datos)
- Python 3.9+

**Base de Datos:**
- Azure SQL Database
- Modelo relacional optimizado

**Inteligencia Artificial:**
- Google Gemini AI (Detección automática de incidencias)

**DevOps:**
- GitHub Actions (CI/CD)
- Azure Static Web Apps
- Azure Web Apps

### 📊 Modelo de Base de Datos

El sistema utiliza un modelo de base de datos relacional optimizado. Consulta el diagrama ER en:
- 📁 [`/design/Sepcan_Marina_ER_Model.jpg`](./design/Sepcan_Marina_ER_Model.jpg)

### 🎯 Funcionalidades Principales

1. **📝 Gestión de Formularios**
   - Formularios de recogida de vehículos
   - Formularios de finalización de trabajos
   - Validación automática de datos

2. **🚨 Sistema de Incidencias**
   - Detección automática con IA
   - Clasificación por niveles de gravedad
   - Seguimiento y resolución

3. **📊 Consultas y Reportes**
   - Filtrado avanzado por fechas, trabajadores, vehículos
   - Exportación a Excel
   - Visualización de datos en tiempo real

4. **🔐 Gestión de Datos Privados**
   - CRUD de vehículos, trabajadores y trabajos
   - Autenticación por contraseña
   - Interfaz administrativa

### 📁 Estructura del Proyecto

```
sepcan1.0/
├── frontend/          # Aplicación React
├── backend/           # API FastAPI
├── design/           # Diagramas y diseños
├── .github/          # GitHub Actions workflows
└── README.md         # Este archivo
```

### 🛠️ Instalación y Desarrollo

#### Requisitos Previos
- Node.js 18+
- Python 3.9+
- Azure SQL Database

#### Configuración Local

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/sepcan1.0.git
cd sepcan1.0
```

2. **Backend:**
```bash
cd backend
pip install -r requirements.txt
# Configurar variables de entorno en .env
uvicorn main:app --reload
```

3. **Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 🌐 Variables de Entorno

**Backend (.env):**
```env
AZURE_SQL_USER=tu_usuario
AZURE_SQL_PASSWORD=tu_contraseña
AZURE_SQL_SERVER=tu_servidor.database.windows.net
AZURE_SQL_DATABASE=tu_base_de_datos
GEMMA_KEY=tu_clave_gemini_ai
```

**Frontend:**
```env
VITE_APP_ACCESS_PASSWORD=tu_contraseña_acceso
```

### 🚀 Despliegue en Azure

El proyecto utiliza GitHub Actions para despliegue automático:

1. **Frontend:** Azure Static Web Apps
2. **Backend:** Azure Web Apps
3. **Base de Datos:** Azure SQL Database

Ver archivos de configuración en `.github/workflows/`

### 📖 Documentación Detallada

- **Backend:** [backend/README.md](./backend/README.md)
- **Frontend:** [frontend/README.md](./frontend/README.md)

### 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### 📄 Licencia

Este proyecto es propietario de SEPCAN MARINA.

---

## English

### 📋 Project Description

SEPCAN MARINA is a comprehensive operations management system designed for service companies that use vehicles. The system allows managing vehicle forms, completed jobs, incidents, and generating exportable reports.

### 🏗️ System Architecture

The project is deployed on **Microsoft Azure** with the following architecture:

```
Frontend (Azure Static Web App)
    ↕️
Backend (Azure Web App - FastAPI)
    ↕️
Database (Azure SQL Database)
```

### 🚀 Technologies Used

**Frontend:**
- React 18 + TypeScript
- Vite (Build Tool)
- Material-UI (MUI)
- React Router
- Axios

**Backend:**
- FastAPI
- SQLAlchemy (ORM)
- Pydantic (Data validation)
- Python 3.9+

**Database:**
- Azure SQL Database
- Optimized relational model

**Artificial Intelligence:**
- Google Gemini AI (Automatic incident detection)

**DevOps:**
- GitHub Actions (CI/CD)
- Azure Static Web Apps
- Azure Web Apps

### 📊 Database Model

The system uses an optimized relational database model. Check the ER diagram at:
- 📁 [`/design/Sepcan_Marina_ER_Model.jpg`](./design/Sepcan_Marina_ER_Model.jpg)

### 🎯 Main Features

1. **📝 Form Management**
   - Vehicle pickup forms
   - Job completion forms
   - Automatic data validation

2. **🚨 Incident System**
   - Automatic AI detection
   - Classification by severity levels
   - Tracking and resolution

3. **📊 Queries and Reports**
   - Advanced filtering by dates, workers, vehicles
   - Excel export
   - Real-time data visualization

4. **🔐 Private Data Management**
   - CRUD for vehicles, workers, and jobs
   - Password authentication
   - Administrative interface

### 📁 Project Structure

```
sepcan1.0/
├── frontend/          # React application
├── backend/           # FastAPI API
├── design/           # Diagrams and designs
├── .github/          # GitHub Actions workflows
└── README.md         # This file
```

### 🛠️ Installation and Development

#### Prerequisites
- Node.js 18+
- Python 3.9+
- Azure SQL Database

#### Local Setup

1. **Clone repository:**
```bash
git clone https://github.com/your-user/sepcan1.0.git
cd sepcan1.0
```

2. **Backend:**
```bash
cd backend
pip install -r requirements.txt
# Configure environment variables in .env
uvicorn main:app --reload
```

3. **Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 🌐 Environment Variables

**Backend (.env):**
```env
AZURE_SQL_USER=your_user
AZURE_SQL_PASSWORD=your_password
AZURE_SQL_SERVER=your_server.database.windows.net
AZURE_SQL_DATABASE=your_database
GEMMA_KEY=your_gemini_ai_key
```

**Frontend:**
```env
VITE_APP_ACCESS_PASSWORD=your_access_password
```

### 🚀 Azure Deployment

The project uses GitHub Actions for automatic deployment:

1. **Frontend:** Azure Static Web Apps
2. **Backend:** Azure Web Apps
3. **Database:** Azure SQL Database

See configuration files in `.github/workflows/`

### 📖 Detailed Documentation

- **Backend:** [backend/README.md](./backend/README.md)
- **Frontend:** [frontend/README.md](./frontend/README.md)

### 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

### 📄 License

This project is proprietary to SEPCAN MARINA.

