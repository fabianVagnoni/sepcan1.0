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
import { getAllTrabajos, createTrabajo, updateTrabajo, getTrabajo, Trabajo as TrabajoType, TrabajoCreate, TrabajoUpdate } from '../../services/api'

// Interface for form data (without password)
interface TrabajoFormData {
  id: number
  cliente: string
  fecha: string
}

const DatosPrivadosTrabajos = () => {
  const [trabajos, setTrabajos] = useState<TrabajoType[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<TrabajoFormData>({
    id: 0,
    cliente: '',
    fecha: '',
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTrabajoId, setSelectedTrabajoId] = useState<number | null>(null)

  useEffect(() => {
    fetchTrabajos()
  }, [])

  const fetchTrabajos = async () => {
    setDataLoading(true)
    try {
      const data: TrabajoType[] = await getAllTrabajos()
      setTrabajos(data)
    } catch (err) {
      console.error('Error fetching trabajos:', err)
      setError('Error al cargar los trabajos. Por favor, inténtelo de nuevo más tarde.')
    } finally {
      setDataLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'id') {
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

  const handleOpenDialog = async (isEdit: boolean = false, id?: number) => {
    setIsEditing(isEdit);
    if (isEdit && id) {
      setSelectedTrabajoId(id);
      try {
        const trabajoData: TrabajoType = await getTrabajo(id);
        setFormData(trabajoData); // Directly use fetched data as it matches TrabajoFormData
        setDialogOpen(true);
      } catch (err) {
        console.error('Error fetching trabajo details:', err);
        setError('Error al obtener los detalles del trabajo.');
      }
    } else {
      setFormData({
        id: 0,
        cliente: '',
        fecha: '',
      });
      setSelectedTrabajoId(null);
      setDialogOpen(true);
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedTrabajoId(null);
    setIsEditing(false);
    // Reset form
    setFormData({ id: 0, cliente: '', fecha: '' });
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (isEditing && selectedTrabajoId) {
        const updateData: TrabajoUpdate = {
          cliente: formData.cliente,
          fecha: formData.fecha,
        };
        await updateTrabajo(selectedTrabajoId, updateData);
        setSuccess('Trabajo actualizado exitosamente');
      } else {
        const createData: TrabajoCreate = { ...formData }; // Create type doesn't have password
        await createTrabajo(createData);
        setSuccess('Trabajo creado exitosamente');
      }
      setDialogOpen(false);
      fetchTrabajos();
    } catch (err: any) {
      console.error('Error saving trabajo:', err);
      setError(err.response?.data?.detail || 'Error al guardar el trabajo. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const handleCloseSnackbar = () => {
    setError(null)
    setSuccess(null)
  }

  // Add handleDeleteTrabajo function to remove a job from frontend only
  const handleDeleteTrabajo = (id: number) => {
    // Filter out the job with the given ID
    const updatedTrabajos = trabajos.filter(trabajo => trabajo.id !== id);
    setTrabajos(updatedTrabajos);
    setSuccess('Trabajo eliminado (solo en frontend)');
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
          Gestión de Trabajos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Trabajo
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trabajos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay trabajos registrados
                  </TableCell>
                </TableRow>
              ) : (
                trabajos.map((trabajo) => (
                  <TableRow key={trabajo.id}>
                    <TableCell>{trabajo.id}</TableCell>
                    <TableCell>{trabajo.cliente}</TableCell>
                    <TableCell>{trabajo.fecha}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(true, trabajo.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteTrabajo(trabajo.id)}
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
        <DialogTitle>{isEditing ? 'Editar Trabajo' : 'Nuevo Trabajo'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ID"
                name="id"
                type="number"
                value={formData.id === 0 && !isEditing ? '' : formData.id}
                onChange={handleChange}
                required
                disabled={isEditing}
                helperText="ID del trabajo"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cliente"
                name="cliente"
                value={formData.cliente}
                onChange={handleChange}
                required
                helperText="Nombre del cliente"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha"
                name="fecha"
                value={formData.fecha}
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

export default DatosPrivadosTrabajos 