import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { 
  getAllTrabajadores, 
  createTrabajador, 
  updateTrabajador, 
  getTrabajador, 
  Trabajador as TrabajadorType, 
  TrabajadorCreate, 
  TrabajadorUpdate 
} from '../../services/api'

// Interface for form data (without password)
interface TrabajadorFormData {
  dni: number
  nombre: string
  apellido: string
  fecha_nacimiento: string
  fecha_empleo: string
}

const DatosPrivadosTrabajadores = () => {
  const [trabajadores, setTrabajadores] = useState<TrabajadorType[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<TrabajadorFormData>({
    dni: 0,
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    fecha_empleo: '',
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTrabajadorDni, setSelectedTrabajadorDni] = useState<number | null>(null)

  useEffect(() => {
    fetchTrabajadores()
  }, [])

  const fetchTrabajadores = async () => {
    setDataLoading(true)
    try {
      const data: TrabajadorType[] = await getAllTrabajadores()
      setTrabajadores(data)
    } catch (err) {
      console.error('Error fetching trabajadores:', err)
      setError('Error al cargar los trabajadores. Por favor, inténtelo de nuevo más tarde.')
    } finally {
      setDataLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'dni') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleOpenDialog = async (isEdit: boolean = false, dni?: number) => {
    setIsEditing(isEdit);
    if (isEdit && dni) {
      setSelectedTrabajadorDni(dni);
      try {
        const trabajadorData: TrabajadorType = await getTrabajador(dni);
        setFormData(trabajadorData); // Directly use fetched data as it matches TrabajadorFormData
        setDialogOpen(true);
      } catch (err) {
        console.error('Error fetching trabajador details:', err);
        setError('Error al obtener los detalles del trabajador.');
      }
    } else {
      setFormData({
        dni: 0,
        nombre: '',
        apellido: '',
        fecha_nacimiento: '',
        fecha_empleo: '',
      });
      setSelectedTrabajadorDni(null);
      setDialogOpen(true);
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedTrabajadorDni(null);
    setIsEditing(false);
    // Reset form
    setFormData({ dni: 0, nombre: '', apellido: '', fecha_nacimiento: '', fecha_empleo: '' });
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (isEditing && selectedTrabajadorDni) {
        // Construct TrabajadorUpdate payload from formData (all fields are optional in Update type)
        const updateData: TrabajadorUpdate = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          fecha_nacimiento: formData.fecha_nacimiento,
          fecha_empleo: formData.fecha_empleo,
        };
        await updateTrabajador(selectedTrabajadorDni, updateData);
        setSuccess('Trabajador actualizado exitosamente');
      } else {
        const createData: TrabajadorCreate = { ...formData }; // Create type doesn't have password
        await createTrabajador(createData);
        setSuccess('Trabajador creado exitosamente');
      }
      setDialogOpen(false);
      fetchTrabajadores();
    } catch (err: any) {
      console.error('Error saving trabajador:', err);
      setError(err.response?.data?.detail || 'Error al guardar el trabajador. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const handleCloseSnackbar = () => {
    setError(null)
    setSuccess(null)
  }

  // Add handleDeleteTrabajador function to remove a worker from frontend only
  const handleDeleteTrabajador = (dni: number) => {
    // Filter out the worker with the given DNI
    const updatedTrabajadores = trabajadores.filter(trabajador => trabajador.dni !== dni);
    setTrabajadores(updatedTrabajadores);
    setSuccess('Trabajador eliminado (solo en frontend)');
  }

  if (dataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
      padding: '20px', 
      borderRadius: '10px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Trabajadores
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Trabajador
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>DNI</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Fecha de Nacimiento</TableCell>
                <TableCell>Fecha de Empleo</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trabajadores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay trabajadores registrados
                  </TableCell>
                </TableRow>
              ) : (
                trabajadores.map((trabajador) => (
                  <TableRow key={trabajador.dni}>
                    <TableCell>{trabajador.dni}</TableCell>
                    <TableCell>{trabajador.nombre}</TableCell>
                    <TableCell>{trabajador.apellido}</TableCell>
                    <TableCell>{trabajador.fecha_nacimiento}</TableCell>
                    <TableCell>{trabajador.fecha_empleo}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(true, trabajador.dni)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteTrabajador(trabajador.dni)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Editar Trabajador' : 'Nuevo Trabajador'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="DNI"
                name="dni"
                type="number"
                value={formData.dni === 0 && !isEditing ? '' : formData.dni}
                onChange={handleChange}
                required
                disabled={isEditing}
                helperText="Número de DNI del trabajador"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                helperText="Nombre del trabajador"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                helperText="Apellido del trabajador"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                required
                helperText="Formato: DD/MM/AAAA"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha de Empleo"
                name="fecha_empleo"
                value={formData.fecha_empleo}
                onChange={handleChange}
                required
                helperText="Formato: DD/MM/AAAA"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default DatosPrivadosTrabajadores 