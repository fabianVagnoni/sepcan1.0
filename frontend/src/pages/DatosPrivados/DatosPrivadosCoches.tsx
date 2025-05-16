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
import { getAllCoches, createCoche, updateCoche, getCoche, Coche as CocheType, CocheCreate, CocheUpdate } from '../../services/api'

interface CocheFormData {
  id_coche: number;
  placa: number;
}

const DatosPrivadosCoches = () => {
  const [coches, setCoches] = useState<CocheType[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<CocheFormData>({
    id_coche: 0,
    placa: 0,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCocheId, setSelectedCocheId] = useState<number | null>(null)

  useEffect(() => {
    fetchCoches()
  }, [])

  const fetchCoches = async () => {
    setDataLoading(true)
    try {
      const data: CocheType[] = await getAllCoches()
      setCoches(data)
    } catch (err) {
      console.error('Error fetching coches:', err)
      setError('Error al cargar los coches. Por favor, inténtelo de nuevo más tarde.')
    } finally {
      setDataLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'placa' || name === 'id_coche') {
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

  const handleOpenDialog = async (isEdit: boolean = false, cocheId?: number) => {
    setIsEditing(isEdit);
    if (isEdit && cocheId) {
      setSelectedCocheId(cocheId);
      try {
        const cocheDetails: CocheType = await getCoche(cocheId);
        setFormData({ id_coche: cocheDetails.id_coche, placa: cocheDetails.placa });
        setDialogOpen(true);
      } catch (err) {
        console.error('Error fetching coche details:', err);
        setError('Error al obtener los detalles del coche.');
      }
    } else {
      setFormData({
        id_coche: 0,
        placa: 0,
      });
      setSelectedCocheId(null);
      setDialogOpen(true);
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedCocheId(null)
    setIsEditing(false)
    setFormData({ id_coche: 0, placa: 0 });
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (isEditing && selectedCocheId) {
        const updateData: CocheUpdate = { placa: formData.placa };
        await updateCoche(selectedCocheId, updateData);
        setSuccess('Coche actualizado exitosamente');
      } else {
        const createData: CocheCreate = { id_coche: formData.id_coche, placa: formData.placa };
        await createCoche(createData);
        setSuccess('Coche creado exitosamente');
      }
      setDialogOpen(false);
      fetchCoches();
    } catch (err: any) {
      console.error('Error saving coche:', err);
      setError(err.response?.data?.detail || 'Error al guardar el coche. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const handleCloseSnackbar = () => {
    setError(null)
    setSuccess(null)
  }

  const handleDeleteCoche = (cocheId: number) => {
    const updatedCoches = coches.filter(coche => coche.id_coche !== cocheId);
    setCoches(updatedCoches);
    setSuccess('Coche eliminado (solo en frontend)');
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
          Gestión de Coches
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Coche
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Coche</TableCell>
                <TableCell>Placa</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No hay coches registrados
                  </TableCell>
                </TableRow>
              ) : (
                coches.map((coche) => (
                  <TableRow key={coche.id_coche}>
                    <TableCell>{coche.id_coche}</TableCell>
                    <TableCell>{coche.placa}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(true, coche.id_coche)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteCoche(coche.id_coche)}
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
      
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Editar Coche' : 'Nuevo Coche'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID Coche"
                name="id_coche"
                type="number"
                value={formData.id_coche === 0 && !isEditing ? '' : formData.id_coche}
                onChange={handleChange}
                required
                disabled={isEditing}
                helperText={isEditing ? "El ID del coche no se puede cambiar" : "ID del coche (asignado por la empresa)"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Placa"
                name="placa"
                type="number"
                value={formData.placa === 0 ? '' : formData.placa}
                onChange={handleChange}
                required
                helperText="Número de placa del coche"
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

export default DatosPrivadosCoches 