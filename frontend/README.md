# SEPCAN MARINA - Frontend Application

<!-- Language Toggles -->
<div align="center">
<details open>
<summary><strong>🇪🇸 Español</strong></summary>
</div>

### 📋 Descripción

Aplicación frontend desarrollada con **React + TypeScript** para el sistema SEPCAN MARINA. Proporciona una interfaz de usuario moderna y responsiva para la gestión de formularios de vehículos, trabajos, consultas de datos e incidencias.

### 🏗️ Arquitectura

```
React Application (Vite)
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── pages/            # Páginas principales
│   ├── services/         # Servicios de API
│   ├── assets/           # Recursos estáticos
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── public/               # Archivos públicos
└── index.html           # Página HTML base
```

### 🚀 Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Herramienta de construcción rápida
- **Material-UI (MUI)** - Componentes UI
- **React Router** - Enrutamiento
- **React Hook Form** - Manejo de formularios
- **Axios** - Cliente HTTP
- **Azure Static Web Apps** - Hosting

### 🎨 Características de Diseño

- **Diseño Responsivo** - Funciona en desktop y móviles
- **Imagen de Fondo** - Efecto blur sutil para mejor legibilidad
- **Tema Personalizado** - Colores corporativos de SEPCAN MARINA
- **Animaciones** - Transiciones suaves y efectos hover
- **Material Design** - Componentes consistentes y modernos

### 📱 Páginas Principales

#### 🏠 **Dashboard (`/`)**
- Página principal con acceso rápido a todas las funcionalidades
- Cards interactivos para cada módulo
- Navegación intuitiva

#### 📝 **Formularios**
- **Formulario de Coche (`/formulario-coche`)**
  - Registro de vehículos antes de trabajos
  - Validación automática de datos
  - Detección de incidencias con IA
  
- **Formulario de Trabajo (`/formulario-trabajo`)**
  - Registro de trabajos completados
  - Campos para horas trabajadas, ubicación, etc.
  - Validación de datos obligatorios

#### 🔐 **Datos Privados**
- **Gestión de Coches (`/datos-privados/coches`)**
  - CRUD completo de vehículos
  - Validación de placas únicas
  
- **Gestión de Trabajadores (`/datos-privados/trabajadores`)**
  - CRUD completo de empleados
  - Gestión de DNI y fechas

- **Gestión de Trabajos (`/datos-privados/trabajos`)**
  - CRUD completo de trabajos
  - Gestión de clientes y fechas

#### 📊 **Consultas (`/consultar`)**
- Filtrado avanzado por fechas, trabajadores, vehículos
- Visualización de datos en tablas
- Exportación a Excel
- Filtros adicionales dinámicos

#### 🚨 **Incidencias (`/incidencias`)**
- Lista de todas las incidencias detectadas
- Clasificación por niveles de gravedad
- Resolución de incidencias
- Detalles expandibles

### 🛠️ Instalación y Desarrollo

#### 1. Requisitos Previos
```bash
# Node.js 18 o superior
node --version

# npm actualizado
npm install -g npm@latest
```

#### 2. Instalación de Dependencias
```bash
cd frontend
npm install
```

#### 3. Configuración de Variables de Entorno

Crear archivo `.env` en el directorio frontend:
```env
# Contraseña de acceso para datos privados
VITE_APP_ACCESS_PASSWORD=tu_contraseña_acceso

# URL del backend (opcional para desarrollo)
VITE_API_BASE_URL=http://localhost:8000
```

#### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

#### 5. Construir para Producción
```bash
npm run build
```

### 🌐 Servicios de API

La aplicación se conecta al backend a través del archivo `src/services/api.ts` que incluye:

#### **Servicios Principales:**
- **Coches:** CRUD completo + obtener lista
- **Trabajadores:** CRUD completo + obtener lista
- **Trabajos:** CRUD completo + trabajos disponibles
- **Formularios:** Creación y listado de formularios
- **Incidencias:** Listado y resolución
- **Consultas:** Datos combinados con filtros

#### **Funciones de Utilidad:**
- `formatDate()` - Formato DD/MM/YYYY
- `parseDate()` - Parsing de fechas
- `htmlDateToApiDate()` - Conversión de formatos

### 🎨 Personalización de Estilos

#### **Imagen de Fondo**
```css
/* Ubicación: src/assets/background_pic.jpg */
/* Configuración en src/App.tsx */
background-image: url('./assets/background_pic.jpg')
filter: blur(5px)
opacity: 0.7
```

#### **Colores Corporativos**
```css
/* Definidos en src/index.css */
:root {
  --navy-blue: #1a237e;
  --light-blue: #0099cc;
  --text-primary: #333;
  --background-overlay: rgba(255, 255, 255, 0.9);
}
```

#### **Componentes Personalizados**
- Navbar con menús desplegables
- Botones con efectos hover
- Cards con animaciones
- Formularios con validación visual

### 📱 Responsividad

La aplicación está optimizada para:
- **Desktop:** Experiencia completa con todas las funcionalidades
- **Tablet:** Diseño adaptado con navegación simplificada
- **Móvil:** Interfaz táctil optimizada

### 🔒 Autenticación

Sistema de autenticación por contraseña para:
- Acceso a datos privados (CRUD)
- Consultas de datos
- Exportación de reportes

### 🚀 Despliegue en Azure

#### Azure Static Web Apps

La aplicación se despliega automáticamente en Azure Static Web Apps mediante GitHub Actions:

**Archivo de configuración:** `.github/workflows/azure-static-web-apps-red-glacier-0d0021210.yml`

#### Configuración de Azure:
```yaml
# Configuración automática
app_location: "/frontend"
api_location: ""
output_location: "dist"
```

### 📊 Funcionalidades Avanzadas

#### **Filtrado Dinámico**
- Filtros por trabajador, vehículo, fecha
- Chips visuales para filtros activos
- Reinicio rápido de filtros

#### **Exportación de Datos**
- Exportación a Excel directa
- Nombres de archivo con timestamp
- Descarga automática

#### **Gestión de Estados**
- React Hook Form para formularios
- Estado local para filtros
- Manejo de errores centralizado

### 🧪 Testing

```bash
# Instalar dependencias de testing (cuando estén disponibles)
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Ejecutar tests
npm run test
```

### 📖 Estructura de Componentes

#### **Componentes Principales:**
- `Navbar.tsx` - Navegación principal
- `Dashboard.tsx` - Página de inicio
- `FormularioCoche.tsx` - Formulario de vehículos
- `FormularioTrabajo.tsx` - Formulario de trabajos
- `ConsultarDatos.tsx` - Página de consultas
- `Incidencias.tsx` - Gestión de incidencias

#### **Páginas de Datos Privados:**
- `DatosPrivadosCoches.tsx` - CRUD de coches
- `DatosPrivadosTrabajadores.tsx` - CRUD de trabajadores
- `DatosPrivadosTrabajos.tsx` - CRUD de trabajos

</details>

<div align="center">
<details>
<summary><strong>🇬🇧 English</strong></summary>
</div>

### 📋 Description

Frontend application developed with **React + TypeScript** for the SEPCAN MARINA system. Provides a modern and responsive user interface for managing vehicle forms, jobs, data queries, and incidents.

### 🏗️ Architecture

```
React Application (Vite)
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Main pages
│   ├── services/         # API services
│   ├── assets/           # Static resources
│   ├── App.tsx           # Main component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Public files
└── index.html           # Base HTML page
```

### 🚀 Technologies

- **React 18** - UI library
- **TypeScript** - Static typing
- **Vite** - Fast build tool
- **Material-UI (MUI)** - UI components
- **React Router** - Routing
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Azure Static Web Apps** - Hosting

### 🎨 Design Features

- **Responsive Design** - Works on desktop and mobile
- **Background Image** - Subtle blur effect for better readability
- **Custom Theme** - SEPCAN MARINA corporate colors
- **Animations** - Smooth transitions and hover effects
- **Material Design** - Consistent and modern components

### 📱 Main Pages

#### 🏠 **Dashboard (`/`)**
- Main page with quick access to all functionalities
- Interactive cards for each module
- Intuitive navigation

#### 📝 **Forms**
- **Vehicle Form (`/formulario-coche`)**
  - Vehicle registration before jobs
  - Automatic data validation
  - AI incident detection
  
- **Job Form (`/formulario-trabajo`)**
  - Completed job registration
  - Fields for worked hours, location, etc.
  - Required data validation

#### 🔐 **Private Data**
- **Vehicle Management (`/datos-privados/coches`)**
  - Complete CRUD for vehicles
  - Unique license plate validation
  
- **Worker Management (`/datos-privados/trabajadores`)**
  - Complete CRUD for employees
  - DNI and date management

- **Job Management (`/datos-privados/trabajos`)**
  - Complete CRUD for jobs
  - Client and date management

#### 📊 **Queries (`/consultar`)**
- Advanced filtering by dates, workers, vehicles
- Data visualization in tables
- Excel export
- Dynamic additional filters

#### 🚨 **Incidents (`/incidencias`)**
- List of all detected incidents
- Classification by severity levels
- Incident resolution
- Expandable details

### 🛠️ Installation and Development

#### 1. Prerequisites
```bash
# Node.js 18 or higher
node --version

# Updated npm
npm install -g npm@latest
```

#### 2. Install Dependencies
```bash
cd frontend
npm install
```

#### 3. Environment Variables Setup

Create `.env` file in frontend directory:
```env
# Access password for private data
VITE_APP_ACCESS_PASSWORD=your_access_password

# Backend URL (optional for development)
VITE_API_BASE_URL=http://localhost:8000
```

#### 4. Run in Development
```bash
npm run dev
```

#### 5. Build for Production
```bash
npm run build
```

### 🌐 API Services

The application connects to the backend through `src/services/api.ts` which includes:

#### **Main Services:**
- **Vehicles:** Complete CRUD + get list
- **Workers:** Complete CRUD + get list
- **Jobs:** Complete CRUD + available jobs
- **Forms:** Form creation and listing
- **Incidents:** Listing and resolution
- **Queries:** Combined data with filters

#### **Utility Functions:**
- `formatDate()` - DD/MM/YYYY format
- `parseDate()` - Date parsing
- `htmlDateToApiDate()` - Format conversion

### 🎨 Style Customization

#### **Background Image**
```css
/* Location: src/assets/background_pic.jpg */
/* Configuration in src/App.tsx */
background-image: url('./assets/background_pic.jpg')
filter: blur(5px)
opacity: 0.7
```

#### **Corporate Colors**
```css
/* Defined in src/index.css */
:root {
  --navy-blue: #1a237e;
  --light-blue: #0099cc;
  --text-primary: #333;
  --background-overlay: rgba(255, 255, 255, 0.9);
}
```

#### **Custom Components**
- Navbar with dropdown menus
- Buttons with hover effects
- Cards with animations
- Forms with visual validation

### 📱 Responsiveness

The application is optimized for:
- **Desktop:** Complete experience with all functionalities
- **Tablet:** Adapted design with simplified navigation
- **Mobile:** Optimized touch interface

### 🔒 Authentication

Password authentication system for:
- Access to private data (CRUD)
- Data queries
- Report export

### 🚀 Azure Deployment

#### Azure Static Web Apps

The application deploys automatically to Azure Static Web Apps via GitHub Actions:

**Configuration file:** `.github/workflows/azure-static-web-apps-red-glacier-0d0021210.yml`

#### Azure Configuration:
```yaml
# Automatic configuration
app_location: "/frontend"
api_location: ""
output_location: "dist"
```

### 📊 Advanced Features

#### **Dynamic Filtering**
- Filters by worker, vehicle, date
- Visual chips for active filters
- Quick filter reset

#### **Data Export**
- Direct Excel export
- Timestamped filenames
- Automatic download

#### **State Management**
- React Hook Form for forms
- Local state for filters
- Centralized error handling

### 🧪 Testing

```bash
# Install testing dependencies (when available)
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm run test
```

### 📖 Component Structure

#### **Main Components:**
- `Navbar.tsx` - Main navigation
- `Dashboard.tsx` - Home page
- `FormularioCoche.tsx` - Vehicle form
- `FormularioTrabajo.tsx` - Job form
- `ConsultarDatos.tsx` - Query page
- `Incidencias.tsx` - Incident management

#### **Private Data Pages:**
- `DatosPrivadosCoches.tsx` - Vehicle CRUD
- `DatosPrivadosTrabajadores.tsx` - Worker CRUD
- `DatosPrivadosTrabajos.tsx` - Job CRUD

</details>
