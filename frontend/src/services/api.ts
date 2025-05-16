import axios from 'axios'

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
})

// Date format constants and utilities
export const DATE_FORMAT = 'DD/MM/YYYY'

/**
 * Convert a Date object to DD/MM/YYYY format string
 */
export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Convert date from YYYY-MM-DD (HTML input format) to DD/MM/YYYY (API format)
 */
export const htmlDateToApiDate = (htmlDate: string): string | null => {
  if (!htmlDate) return null
  
  try {
    // Split the input date by hyphens (YYYY-MM-DD)
    const parts = htmlDate.split('-')
    if (parts.length === 3) {
      // Rearrange to DD/MM/YYYY format
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    
    // If not in expected format, try using the Date object as fallback
    const date = new Date(htmlDate)
    if (!isNaN(date.getTime())) {
      return formatDate(date)
    }
    
    return null
  } catch (e) {
    console.error('Error converting HTML date to API date:', e)
    return null
  }
}

/**
 * Parse a string in DD/MM/YYYY format to a Date object
 */
export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null
  
  // Try DD/MM/YYYY format explicitly
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    // Make sure we interpret as day/month/year by explicitly parsing each part
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1 // JS months are 0-based
    const year = parseInt(parts[2], 10)
    
    // Validate date parts
    if (isNaN(day) || isNaN(month) || isNaN(year) || 
        day < 1 || day > 31 || month < 0 || month > 11) {
      return null
    }
    
    const date = new Date(year, month, day)
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  
  // Try YYYY-MM-DD format as fallback by splitting and rearranging
  const hyphenParts = dateStr.split('-')
  if (hyphenParts.length === 3) {
    const year = parseInt(hyphenParts[0], 10)
    const month = parseInt(hyphenParts[1], 10) - 1
    const day = parseInt(hyphenParts[2], 10)
    
    const date = new Date(year, month, day)
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  
  return null
}

/**
 * Convert date from DD/MM/YYYY (API format) to YYYY-MM-DD (HTML input format)
 */
export const apiDateToHtmlDate = (apiDate: string): string | null => {
  if (!apiDate) return null
  
  const date = parseDate(apiDate)
  if (!date) return null
  
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Types for entities based on database.py
export interface Coche {
  id_coche: number // Maps to ID in the database
  placa: number
  // marca, modelo, fecha_fabricacion, fecha_compra are NOT in database.py Coche model
}

export interface CocheCreate {
  id_coche: number // Assuming company provides this ID
  placa: number
}

export interface CocheUpdate { // Data to send for updating a Coche
  placa?: number
  // Other fields like marca, modelo are not in the DB model so cannot be updated here
}

export interface Trabajador {
  dni: number
  nombre: string
  apellido: string
  fecha_nacimiento: string
  fecha_empleo: string
}

export interface TrabajadorCreate extends Omit<Trabajador, 'dni'> {
  dni: number // Assuming DNI is still provided by user for creation
}

export interface TrabajadorUpdate { // Fields that can be updated
  nombre?: string
  apellido?: string
  fecha_nacimiento?: string
  fecha_empleo?: string
}

export interface Trabajo {
  id: number
  cliente: string
  fecha: string
}

export interface TrabajoCreate extends Omit<Trabajo, 'id'> {
  id: number // Assuming ID is provided by user for creation based on current frontend logic
}

export interface TrabajoUpdate { // Fields that can be updated
  cliente?: string
  fecha?: string
}

export interface FormularioCoche { // This matches database.py
  id_coche: number // Changed from placa_coche to align with backend model changes
  dni_trabajador: number
  id_trabajo: number
  otros?: string | null // Allow null for optional fields from DB
  fecha?: string | null
  hora_partida?: string | null
  estado_coche?: string | null
}

export interface FormularioTrabajo { // This matches database.py
  id_coche: number // Changed from placa_coche to align with backend model changes
  dni_trabajador: number
  id_trabajo: number
  otros?: string | null
  fecha?: string | null
  hora_final?: string | null
  horas_trabajadas?: number | null
  lugar_trabajo?: string | null
  tiempo_llegada?: number | null
}

// New Incidencia interface based on database.py
export interface Incidencia {
  id_incidencia: number
  id_coche: number
  gravedad: string // Maps to 'Gravity' in database.py
  fecha: string
  resuelta: boolean // Maps to 'Resolved' in database.py
  descripcion?: string // Added new field for incidence description
  id_mecanico?: number // Added new field for mechanic ID
  fecha_resolucion?: string // Added new field for resolution date
}

export interface QueryParams {
  dni_trabajador?: number
  id_trabajo?: number
  id_coche?: number
  fecha_inicio?: string
  fecha_fin?: string
  format?: 'json' | 'excel'
}

export interface CombinedDataResponse {
  formularios_coche: any[];
  formularios_trabajo: any[];
}

// API functions for Coche
// Note: Path parameter for get/update Coche should be id_coche if it's the PK
export const createCoche = async (data: CocheCreate) => {
  try {
    // Backend expects 'ID' for 'id_coche' if Pydantic model is named like DB column
    // However, we'll assume Pydantic model uses 'id_coche' for now.
    const response = await api.post('/coches/', data)
    return response.data
  } catch (error) {
    console.error('Error creando coche:', error)
    throw error
  }
}

// Assuming id_coche is the primary key used in the URL for updates
export const updateCoche = async (id_coche: number, data: CocheUpdate) => {
  try {
    const response = await api.put(`/coches/${id_coche}`, data)
    return response.data
  } catch (error) {
    console.error('Error actualizando coche:', error)
    throw error
  }
}

// Assuming id_coche is the primary key used in the URL for fetching a single coche
export const getCoche = async (id_coche: number): Promise<Coche> => {
  try {
    const response = await api.get(`/coches/${id_coche}`)
    return response.data // Should return Coche interface { id_coche, placa }
  } catch (error) {
    console.error('Error obteniendo coche:', error)
    throw error
  }
}

export const getAllCoches = async (): Promise<Coche[]> => { // Return type updated
  try {
    const response = await api.get('/coches/')
    return response.data
  } catch (error) {
    console.error('Error obteniendo coches:', error)
    throw error
  }
}

// API functions for Trabajador
export const createTrabajador = async (data: TrabajadorCreate) => {
  try {
    // Ensure dates are in DD/MM/YYYY format
    const formattedData = {
      ...data,
      fecha_nacimiento: data.fecha_nacimiento.includes('-') ? 
        htmlDateToApiDate(data.fecha_nacimiento) : data.fecha_nacimiento,
      fecha_empleo: data.fecha_empleo.includes('-') ? 
        htmlDateToApiDate(data.fecha_empleo) : data.fecha_empleo
    }
    
    const response = await api.post('/trabajadores/', formattedData)
    return response.data
  } catch (error) {
    console.error('Error creando trabajador:', error)
    throw error
  }
}

export const updateTrabajador = async (dni: number, data: TrabajadorUpdate) => {
  try {
    // Ensure dates are in DD/MM/YYYY format if provided
    const formattedData = { ...data }
    
    if (formattedData.fecha_nacimiento && formattedData.fecha_nacimiento.includes('-')) {
      formattedData.fecha_nacimiento = htmlDateToApiDate(formattedData.fecha_nacimiento) || formattedData.fecha_nacimiento
    }
    
    if (formattedData.fecha_empleo && formattedData.fecha_empleo.includes('-')) {
      formattedData.fecha_empleo = htmlDateToApiDate(formattedData.fecha_empleo) || formattedData.fecha_empleo
    }
    
    const response = await api.put(`/trabajadores/${dni}`, formattedData)
    return response.data
  } catch (error) {
    console.error('Error actualizando trabajador:', error)
    throw error
  }
}

export const getTrabajador = async (dni: number): Promise<Trabajador> => {
  try {
    const response = await api.get(`/trabajadores/${dni}`)
    return response.data
  } catch (error) {
    console.error('Error obteniendo trabajador:', error)
    throw error
  }
}

export const getAllTrabajadores = async (): Promise<Trabajador[]> => { // Return type updated
  try {
    const response = await api.get('/trabajadores/')
    return response.data
  } catch (error) {
    console.error('Error obteniendo trabajadores:', error)
    throw error
  }
}

// API functions for Trabajo
export const createTrabajo = async (data: TrabajoCreate) => {
  try {
    // Ensure date is in DD/MM/YYYY format
    const formattedData = {
      ...data,
      fecha: data.fecha.includes('-') ? 
        htmlDateToApiDate(data.fecha) : data.fecha
    }
    
    const response = await api.post('/trabajos/', formattedData)
    return response.data
  } catch (error) {
    console.error('Error creando trabajo:', error)
    throw error
  }
}

export const updateTrabajo = async (id: number, data: TrabajoUpdate) => {
  try {
    // Ensure date is in DD/MM/YYYY format if provided
    const formattedData = { ...data }
    
    if (formattedData.fecha && formattedData.fecha.includes('-')) {
      formattedData.fecha = htmlDateToApiDate(formattedData.fecha) || formattedData.fecha
    }
    
    const response = await api.put(`/trabajos/${id}`, formattedData)
    return response.data
  } catch (error) {
    console.error('Error actualizando trabajo:', error)
    throw error
  }
}

export const getTrabajo = async (id: number): Promise<Trabajo> => {
  try {
    const response = await api.get(`/trabajos/${id}`)
    return response.data
  } catch (error) {
    console.error('Error obteniendo trabajo:', error)
    throw error
  }
}

export const getAllTrabajos = async (): Promise<Trabajo[]> => { // Return type updated
  try {
    const response = await api.get('/trabajos/')
    return response.data
  } catch (error) {
    console.error('Error obteniendo trabajos:', error)
    throw error
  }
}

// API functions for FormularioCoche
export const createFormularioCoche = async (data: FormularioCoche) => {
  try {
    // Ensure date is in DD/MM/YYYY format if provided
    const formattedData = { ...data }
    
    if (formattedData.fecha && formattedData.fecha.includes('-')) {
      formattedData.fecha = htmlDateToApiDate(formattedData.fecha) || formattedData.fecha
    }
    
    const response = await api.post('/formulario-coche/', formattedData)
    return response.data // Now includes incidence information
  } catch (error) {
    console.error('Error creando formulario de coche:', error)
    throw error
  }
}

export const getAllFormulariosCoche = async (): Promise<FormularioCoche[]> => { // Return type updated
  try {
    const response = await api.get('/formularios-coche/')
    return response.data
  } catch (error) {
    console.error('Error obteniendo formularios de coche:', error)
    throw error
  }
}

// API functions for FormularioTrabajo
export const createFormularioTrabajo = async (data: FormularioTrabajo) => {
  try {
    // Ensure date is in DD/MM/YYYY format if provided
    const formattedData = { ...data }
    
    if (formattedData.fecha && formattedData.fecha.includes('-')) {
      formattedData.fecha = htmlDateToApiDate(formattedData.fecha) || formattedData.fecha
    }
    
    const response = await api.post('/formulario-trabajo/', formattedData)
    return response.data
  } catch (error) {
    console.error('Error creando formulario de trabajo:', error)
    throw error
  }
}

export const getAllFormulariosTrabajo = async (): Promise<FormularioTrabajo[]> => { // Return type updated
  try {
    const response = await api.get('/formularios-trabajo/')
    return response.data
  } catch (error) {
    console.error('Error obteniendo formularios de trabajo:', error)
    throw error
  }
}

// Query combined data
export const queryCombinedData = async (params: QueryParams): Promise<CombinedDataResponse | null> => {
  try {
    const formattedParams = { ...params }
    
    // Convert date formats if needed
    if (formattedParams.fecha_inicio) {
      formattedParams.fecha_inicio = formattedParams.fecha_inicio
    }
    
    if (formattedParams.fecha_fin) {
      formattedParams.fecha_fin = formattedParams.fecha_fin
    }
    
    if (params.format === 'excel') {
      // For Excel format, use a direct window.open to download the file
      const queryString = new URLSearchParams()
      if (params.dni_trabajador) queryString.append('dni_trabajador', params.dni_trabajador.toString())
      if (params.id_trabajo) queryString.append('id_trabajo', params.id_trabajo.toString())
      if (params.id_coche) queryString.append('id_coche', params.id_coche.toString())
      if (params.fecha_inicio) queryString.append('fecha_inicio', params.fecha_inicio)
      if (params.fecha_fin) queryString.append('fecha_fin', params.fecha_fin)
      queryString.append('format', 'excel')
      
      window.open(`/api/query/combined-data?${queryString.toString()}`, '_blank')
      return null
    } else {
      const response = await api.get<CombinedDataResponse>('/query/combined-data', { params: formattedParams })
      console.log('API response data:', response.data);
      return response.data
    }
  } catch (error) {
    console.error('Error consultando datos combinados:', error)
    throw error
  }
}

// API functions for Incidencias
export const getAllIncidencias = async (): Promise<Incidencia[]> => {
  try {
    const response = await api.get('/incidencias/')
    return response.data
  } catch (error) {
    console.error('Error fetching incidencias:', error)
    throw error
  }
}

export const getIncidencia = async (id: number): Promise<Incidencia> => {
  try {
    const response = await api.get(`/incidencias/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching incidencia:', error)
    throw error
  }
}

export const resolveIncidencia = async (id: number, id_mecanico: number): Promise<Incidencia> => {
  try {
    const response = await api.put(`/incidencias/${id}/resolve?id_mecanico=${id_mecanico}`)
    return response.data
  } catch (error) {
    console.error('Error resolving incidencia:', error)
    throw error
  }
}

// New functions to get trabajos without formularios
export const getAvailableTrabajosForCocheForm = async (): Promise<Trabajo[]> => {
  try {
    const response = await api.get('/trabajos/available-for-coche-form')
    return response.data
  } catch (error) {
    console.error('Error obteniendo trabajos disponibles para formulario de coche:', error)
    throw error
  }
}

export const getAvailableTrabajosForTrabajoForm = async (): Promise<Trabajo[]> => {
  try {
    const response = await api.get('/trabajos/available-for-trabajo-form')
    return response.data
  } catch (error) {
    console.error('Error obteniendo trabajos disponibles para formulario de trabajo:', error)
    throw error
  }
} 