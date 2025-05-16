import React, { useState, useEffect } from 'react'
import {
  Container, Grid, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, 
  Alert, Snackbar, Paper, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  SelectChangeEvent
} from '@mui/material'
import { useLocation } from 'react-router-dom'
import { 
  FormularioCoche, 
  createFormularioCoche, 
  getAvailableTrabajosForCocheForm, 
  getAllTrabajadores, 
  getAllCoches,
  formatDate,
  htmlDateToApiDate
} from '../services/api'

interface LocationState {
  id_coche?: number
  dni_trabajador?: number
  id_trabajo?: number
}

interface IncidenceInfo {
  has_incidencia: boolean
  severity_level: number
  severity_name: string
  saved: boolean
  incidencia_id?: number
  descripcion?: string
}

const FormularioCochePage: React.FC = () => {
  // const _navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as LocationState || {}
  
  // Form data state
  const [formData, setFormData] = useState<FormularioCoche>({
    id_coche: locationState.id_coche || 0,
    dni_trabajador: locationState.dni_trabajador || 0,
    id_trabajo: locationState.id_trabajo || 0,
    otros: '',
    fecha: formatDate(new Date()),
    hora_partida: '',
    estado_coche: ''
  })
  
  // Options for dropdowns
  const [trabajos, setTrabajos] = useState<any[]>([])
  const [trabajadores, setTrabajadores] = useState<any[]>([])
  const [coches, setCoches] = useState<any[]>([])
  
  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // New state for incidence dialog
  const [incidenceInfo, setIncidenceInfo] = useState<IncidenceInfo | null>(null)
  const [showIncidenceDialog, setShowIncidenceDialog] = useState(false)
  
  // Load options data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trabajosData, trabajadoresData, cochesData] = await Promise.all([
          getAvailableTrabajosForCocheForm(),
          getAllTrabajadores(),
          getAllCoches()
        ])
        
        setTrabajos(trabajosData)
        setTrabajadores(trabajadoresData)
        setCoches(cochesData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Error cargando datos. Por favor, recarga la página.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<unknown>
  ) => {
    const { name, value } = e.target
    
    if (!name) return // Guard clause for cases where name is undefined
    
    // Special handling for date fields to ensure correct format
    if (name === 'fecha' && typeof value === 'string') {
      // If the value is in YYYY-MM-DD format (from date input), convert to DD/MM/YYYY
      if (value.includes('-')) {
        const formattedDate = htmlDateToApiDate(value)
        setFormData({
          ...formData,
          [name]: formattedDate || value
        })
        return
      }
    }
    
    // Handle numeric fields
    if (['id_coche', 'dni_trabajador', 'id_trabajo'].includes(name) && typeof value === 'string') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseInt(value)
      })
      return
    }
    
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    
    try {
      // Validate required fields
      if (!formData.id_coche || !formData.dni_trabajador || !formData.id_trabajo) {
        throw new Error('Por favor, rellene todos los campos obligatorios.')
      }
      
      // Create the form
      const response = await createFormularioCoche(formData)
      
      // Check if there was an incidence detected
      if (response && response.has_incidencia) {
        // Set incidence info and show dialog
        setIncidenceInfo(response)
        setShowIncidenceDialog(true)
      } else {
        setSuccess(true)
        
        // Reset form
        setTimeout(() => {
          setFormData({
            id_coche: 0,
            dni_trabajador: 0,
            id_trabajo: 0,
            otros: '',
            fecha: formatDate(new Date()),
            hora_partida: '',
            estado_coche: ''
          })
        }, 2000)
      }
    } catch (err: any) {
      console.error('Error submitting form:', err)
      setError(err.message || 'Error al enviar el formulario. Por favor, inténtelo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleCloseSnackbar = () => {
    setSuccess(false)
    setError(null)
  }
  
  const handleCloseIncidenceDialog = () => {
    setShowIncidenceDialog(false)
    
    // Reset form after closing dialog
    setFormData({
      id_coche: 0,
      dni_trabajador: 0,
      id_trabajo: 0,
      otros: '',
      fecha: formatDate(new Date()),
      hora_partida: '',
      estado_coche: ''
    })
  }
  
  // Get the severity color based on level
  const getSeverityColor = (level: number) => {
    switch (level) {
      case 0: return '#d32f2f' // Critical - Red
      case 1: return '#f57c00' // High - Orange
      case 2: return '#ffb74d' // Medium - Amber
      case 3: return '#4caf50' // Low - Green
      default: return '#2196f3' // None or unknown - Blue
    }
  }
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Cargando...</Typography>
      </Box>
    )
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Formulario de Recogida de Coche
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {/* Coche selection */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel id="coche-label">Coche</InputLabel>
                <Select
                  labelId="coche-label"
                  id="id_coche"
                  name="id_coche"
                  value={formData.id_coche || ''}
                  label="Coche"
                  onChange={handleChange}
                  disabled={Boolean(locationState.id_coche)}
                >
                  <MenuItem value={0} disabled>Seleccione un coche</MenuItem>
                  {coches.map((coche) => (
                    <MenuItem key={coche.id_coche} value={coche.id_coche}>
                      ID: {coche.id_coche} - Placa: {coche.placa}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Trabajador selection */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel id="trabajador-label">Trabajador</InputLabel>
                <Select
                  labelId="trabajador-label"
                  id="dni_trabajador"
                  name="dni_trabajador"
                  value={formData.dni_trabajador || ''}
                  label="Trabajador"
                  onChange={handleChange}
                  disabled={Boolean(locationState.dni_trabajador)}
                >
                  <MenuItem value={0} disabled>Seleccione un trabajador</MenuItem>
                  {trabajadores.map((trabajador) => (
                    <MenuItem key={trabajador.dni} value={trabajador.dni}>
                      {trabajador.nombre} {trabajador.apellido} (DNI: {trabajador.dni})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Trabajo selection */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel id="trabajo-label">Trabajo</InputLabel>
                <Select
                  labelId="trabajo-label"
                  id="id_trabajo"
                  name="id_trabajo"
                  value={formData.id_trabajo || ''}
                  label="Trabajo"
                  onChange={handleChange}
                  disabled={Boolean(locationState.id_trabajo)}
                >
                  <MenuItem value={0} disabled>Seleccione un trabajo</MenuItem>
                  {trabajos.map((trabajo) => (
                    <MenuItem key={trabajo.id} value={trabajo.id}>
                      ID: {trabajo.id} - Cliente: {trabajo.cliente}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Date picker */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="fecha"
                name="fecha"
                label="Fecha"
                type="date"
                // Convert DD/MM/YYYY to YYYY-MM-DD for the input field
                value={formData.fecha ? formData.fecha.split('/').reverse().join('-') : ''}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            {/* Departure time */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="hora_partida"
                name="hora_partida"
                label="Hora de Partida"
                type="time"
                value={formData.hora_partida || ''}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            {/* Car state */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="estado-coche-label">Estado del Coche</InputLabel>
                <Select
                  labelId="estado-coche-label"
                  id="estado_coche"
                  name="estado_coche"
                  value={formData.estado_coche || ''}
                  label="Estado del Coche"
                  onChange={handleChange}
                >
                  <MenuItem value="">Seleccione un estado</MenuItem>
                  <MenuItem value="Limpio">Limpio</MenuItem>
                  <MenuItem value="Muy Limpio">Muy Limpio</MenuItem>
                  <MenuItem value="Sucio">Sucio</MenuItem>
                  <MenuItem value="Muy Sucio">Muy Sucio</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Other comments */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="otros"
                name="otros"
                label="Otros Comentarios"
                value={formData.otros || ''}
                onChange={handleChange}
                placeholder="Notas adicionales sobre el vehículo o trabajo"
                multiline
                rows={4}
              />
            </Grid>
            
            {/* Submit button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={submitting}
                sx={{ mt: 3, mb: 2 }}
              >
                {submitting ? 'Enviando...' : 'Enviar Formulario'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Success/Error notifications */}
      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Formulario enviado correctamente.
        </Alert>
      </Snackbar>
      
      {/* Incidence Dialog */}
      <Dialog
        open={showIncidenceDialog}
        onClose={handleCloseIncidenceDialog}
        aria-labelledby="incidence-dialog-title"
      >
        <DialogTitle id="incidence-dialog-title" sx={{ 
          backgroundColor: incidenceInfo?.has_incidencia 
            ? getSeverityColor(incidenceInfo?.severity_level) 
            : '#4caf50',
          color: 'white'
        }}>
          {incidenceInfo?.has_incidencia 
            ? `¡Incidencia Detectada! Nivel: ${incidenceInfo?.severity_name}` 
            : "No Se Detectaron Incidencias"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 2 }}>
            {incidenceInfo?.has_incidencia 
              ? `Se ha detectado una incidencia de nivel ${incidenceInfo?.severity_level} (${incidenceInfo?.severity_name}) para el coche seleccionado. La incidencia ha sido registrada con ID: ${incidenceInfo?.incidencia_id}.`
              : "No se ha detectado ninguna incidencia para el coche seleccionado."}
          </DialogContentText>
          {incidenceInfo?.has_incidencia && (
            <DialogContentText sx={{ mt: 2, fontWeight: 'bold' }}>
              Se notificará al equipo de mantenimiento para resolver esta incidencia.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIncidenceDialog} color="primary">
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default FormularioCochePage 