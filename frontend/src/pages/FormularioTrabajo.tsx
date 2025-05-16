import React, { useState, useEffect } from 'react'
import { 
  Container, Grid, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, 
  Alert, Snackbar, Paper, Box, SelectChangeEvent
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  FormularioTrabajo, 
  createFormularioTrabajo, 
  getAvailableTrabajosForTrabajoForm, 
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

const FormularioTrabajoPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as LocationState || {}
  
  // Form data state
  const [formData, setFormData] = useState<FormularioTrabajo>({
    id_coche: locationState.id_coche || 0,
    dni_trabajador: locationState.dni_trabajador || 0,
    id_trabajo: locationState.id_trabajo || 0,
    otros: '',
    fecha: formatDate(new Date()),
    hora_final: '',
    horas_trabajadas: 0,
    lugar_trabajo: '',
    tiempo_llegada: 0
  })
  
  // Options for dropdowns
  const [trabajos, setTrabajos] = useState<any[]>([])
  const [trabajadores, setTrabajadores] = useState<any[]>([])
  const [coches, setCoches] = useState<any[]>([])
  
  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Load options data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trabajosData, trabajadoresData, cochesData] = await Promise.all([
          getAvailableTrabajosForTrabajoForm(),
          getAllTrabajadores(),
          getAllCoches()
        ])
        
        setTrabajos(trabajosData)
        setTrabajadores(trabajadoresData)
        setCoches(cochesData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Error cargando datos. Por favor, recarga la página.')
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
    if (['horas_trabajadas', 'tiempo_llegada'].includes(name) && typeof value === 'string') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseFloat(value)
      })
      return
    }
    
    // Handle ID fields as integers
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
        throw new Error('Por favor, rellena todos los campos obligatorios.')
      }
      
      // Create the form
      await createFormularioTrabajo(formData)
      setSuccess(true)
      
      // Clear form or redirect based on your app flow
      // You might want to navigate somewhere else or reset the form
      setTimeout(() => {
        navigate('/')  // Redirect to home page after successful submission
      }, 2000)
    } catch (err: any) {
      console.error('Error submitting form:', err)
      setError(err.message || 'Error al enviar el formulario. Por favor, inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleCloseSnackbar = () => {
    setSuccess(false)
    setError(null)
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Formulario de Finalización de Trabajo
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
            
            {/* Finish time */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="hora_final"
                name="hora_final"
                label="Hora de Finalización"
                type="time"
                value={formData.hora_final || ''}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            {/* Hours worked */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="horas_trabajadas"
                name="horas_trabajadas"
                label="Horas Trabajadas"
                type="number"
                value={formData.horas_trabajadas || ''}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 0, step: 0.5 }
                }}
              />
            </Grid>
            
            {/* Arrival time to workplace */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="tiempo_llegada"
                name="tiempo_llegada"
                label="Tiempo de Llegada (minutos)"
                type="number"
                value={formData.tiempo_llegada || ''}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            
            {/* Workplace */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="lugar_trabajo"
                name="lugar_trabajo"
                label="Lugar de Trabajo"
                value={formData.lugar_trabajo || ''}
                onChange={handleChange}
                placeholder="Dirección o descripción del lugar de trabajo"
              />
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
                placeholder="Notas adicionales sobre el trabajo realizado"
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
    </Container>
  )
}

export default FormularioTrabajoPage 