import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Collapse
} from '@mui/material'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import FilterListIcon from '@mui/icons-material/FilterList'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { 
  Incidencia as IncidenciaType, 
  getAllIncidencias, 
  resolveIncidencia, 
  formatDate,
  getTrabajador
} from '../services/api'

const Incidencias = () => {
  const [incidencias, setIncidencias] = useState<IncidenciaType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroGravedad, setFiltroGravedad] = useState<string>('todas')
  const [filtroResuelta, setFiltroResuelta] = useState<string>('todas')
  const [showFilters, setShowFilters] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null)
  const [solverId, setSolverId] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [mechanicNames, setMechanicNames] = useState<Record<number, string>>({})

  // Fetch incidencias from the API
  useEffect(() => {
    const fetchIncidencias = async () => {
      setLoading(true)
      try {
        const data = await getAllIncidencias()
        setIncidencias(data)
        setError(null)
        
        // Fetch mechanic names for resolved incidencias
        const mechanicIds = data
          .filter(inc => inc.resuelta && inc.id_mecanico)
          .map(inc => inc.id_mecanico as number)
          
        if (mechanicIds.length > 0) {
          const uniqueIds = Array.from(new Set(mechanicIds))
          fetchMechanicNames(uniqueIds)
        }
      } catch (err) {
        console.error('Error fetching incidencias:', err)
        setError('Error al cargar las incidencias. Por favor, inténtelo de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    fetchIncidencias()
  }, [refreshTrigger]) // Refetch when refreshTrigger changes
  
  // Helper function to fetch mechanic names
  const fetchMechanicNames = async (mechanicIds: number[]) => {
    const promises = mechanicIds.map(async (id) => {
      try {
        const mechanic = await getTrabajador(id)
        return { id, name: `${mechanic.nombre} ${mechanic.apellido}` }
      } catch (error) {
        console.error(`Error fetching mechanic ${id}:`, error)
        return { id, name: `DNI: ${id}` }
      }
    })
    
    const results = await Promise.all(promises)
    const namesMap: Record<number, string> = {}
    
    results.forEach(result => {
      namesMap[result.id] = result.name
    })
    
    setMechanicNames(namesMap)
  }

  // Toggle row expansion
  const handleRowClick = (id: number, event: React.MouseEvent) => {
    // Don't toggle if clicking on the action button
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter incidents based on user selections
  const incidenciasFiltradas = incidencias.filter(incidencia => {
    const pasaFiltroGravedad = filtroGravedad === 'todas' || incidencia.gravedad.toLowerCase() === filtroGravedad.toLowerCase()
    const pasaFiltroResuelta = filtroResuelta === 'todas' || 
      (filtroResuelta === 'si' && incidencia.resuelta) || 
      (filtroResuelta === 'no' && !incidencia.resuelta)
    
    return pasaFiltroGravedad && pasaFiltroResuelta
  })

  // Get urgency/gravity color based on level
  const getGravityColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'baja':
        return 'success.main'
      case 'media':
        return 'warning.main'
      case 'alta':
        return 'orange'
      case 'crítica':
      case 'critica':
        return 'error.main'
      default:
        return 'grey.500'
    }
  }
  
  // Helper to format dates consistently in DD/MM/YYYY
  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return "No disponible"
    
    // If already in DD/MM/YYYY format, return as is
    if (dateStr.includes('/') && dateStr.split('/').length === 3) {
      return dateStr
    }
    
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) {
        return dateStr // Return original if parsing fails
      }
      return formatDate(date)
    } catch (err) {
      console.error('Error formatting date:', err)
      return dateStr
    }
  }

  const handleCloseSnackbar = () => {
    setError(null)
    setSuccessMessage(null)
  }

  const handleResetFilters = () => {
    setFiltroGravedad('todas')
    setFiltroResuelta('todas')
  }

  const handleDialogOpen = (incidentId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row expansion when clicking on action button
    setSelectedIncidentId(incidentId)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedIncidentId(null)
    setSolverId('')
  }

  const handleSolveIncident = async () => {
    if (!selectedIncidentId) return
    if (!solverId.trim() || isNaN(parseInt(solverId))) {
      setError('Por favor, ingrese un ID de mecánico válido')
      return
    }

    try {
      await resolveIncidencia(selectedIncidentId, parseInt(solverId))
      setSuccessMessage(`Incidencia ${selectedIncidentId} marcada como resuelta correctamente`)
      handleDialogClose()
      // Trigger a refetch of the data
      setRefreshTrigger(prev => prev + 1)
    } catch (err) {
      console.error('Error resolving incident:', err)
      setError('Error al marcar la incidencia como resuelta. Por favor, inténtelo de nuevo.')
    }
  }

  // Format description for display - truncate if too long
  const formatDescription = (description?: string) => {
    if (!description) return "No hay descripción disponible";
    if (description.length > 50) {
      return description.substring(0, 47) + "...";
    }
    return description;
  }

  // Get mechanic info display
  const getMechanicInfo = (id_mecanico?: number) => {
    if (!id_mecanico) return "No asignado"
    
    return mechanicNames[id_mecanico] || `DNI: ${id_mecanico}`
  }

  if (loading && incidencias.length === 0) {
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
      <Typography variant="h4" gutterBottom align="center">
        Incidencias de Vehículos
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          startIcon={<FilterListIcon />} 
          onClick={() => setShowFilters(!showFilters)}
          variant="outlined"
          sx={{ mb: 2, color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
      </Box>

      {showFilters && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Nivel de Gravedad</InputLabel>
                <Select
                  value={filtroGravedad}
                  label="Nivel de Gravedad"
                  onChange={(e) => setFiltroGravedad(e.target.value)}
                >
                  <MenuItem value="todas">Todas</MenuItem>
                  <MenuItem value="baja">Baja</MenuItem>
                  <MenuItem value="media">Media</MenuItem>
                  <MenuItem value="alta">Alta</MenuItem>
                  <MenuItem value="crítica">Crítica</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtroResuelta}
                  label="Estado"
                  onChange={(e) => setFiltroResuelta(e.target.value)}
                >
                  <MenuItem value="todas">Todas</MenuItem>
                  <MenuItem value="si">Resueltas</MenuItem>
                  <MenuItem value="no">Pendientes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button 
                variant="outlined" 
                onClick={handleResetFilters}
                fullWidth
                sx={{ color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                Reiniciar Filtros
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {loading && incidencias.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="40px"></TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Gravedad</TableCell>
                <TableCell>ID Coche</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Resuelta</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidenciasFiltradas.length > 0 ? (
                incidenciasFiltradas.map((incidencia) => (
                  <>
                    <TableRow 
                      key={incidencia.id_incidencia} 
                      hover
                      onClick={(event) => handleRowClick(incidencia.id_incidencia, event)}
                      sx={{ 
                        cursor: 'pointer',
                        '&.MuiTableRow-hover:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        }
                      }}
                    >
                      <TableCell>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRowClick(incidencia.id_incidencia, event);
                          }}
                        >
                          {expandedRows[incidencia.id_incidencia] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{incidencia.id_incidencia}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FiberManualRecordIcon 
                            sx={{ 
                              color: getGravityColor(incidencia.gravedad),
                              mr: 1,
                              fontSize: '12px'
                            }} 
                          />
                          <Chip 
                            label={incidencia.gravedad}
                            size="small"
                            sx={{ 
                              bgcolor: `${getGravityColor(incidencia.gravedad)}15`,
                              color: getGravityColor(incidencia.gravedad),
                              fontWeight: 500
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{incidencia.id_coche}</TableCell>
                      <TableCell>{formatDateString(incidencia.fecha)}</TableCell>
                      <TableCell>
                        <Tooltip title="Haz clic para ver la descripción completa" arrow>
                          <span>{formatDescription(incidencia.descripcion)}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={incidencia.resuelta ? 'Sí' : 'No'} 
                          color={incidencia.resuelta ? 'success' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={(event) => handleDialogOpen(incidencia.id_incidencia, event)}
                          title="Marcar como resuelta"
                          disabled={incidencia.resuelta}
                        >
                          <CheckCircleOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                        <Collapse in={expandedRows[incidencia.id_incidencia]} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            <Typography variant="h6" gutterBottom component="div">
                              Descripción Completa
                            </Typography>
                            <Typography paragraph>
                              {incidencia.descripcion || "No hay descripción disponible para esta incidencia."}
                            </Typography>
                            
                            {incidencia.resuelta && (
                              <>
                                <Typography variant="h6" gutterBottom component="div">
                                  Detalles de Resolución
                                </Typography>
                                <Typography paragraph>
                                  <strong>Fecha de Resolución:</strong> {formatDateString(incidencia.fecha_resolucion)}
                                </Typography>
                                <Typography paragraph>
                                  <strong>Mecánico:</strong> {getMechanicInfo(incidencia.id_mecanico)}
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No se encontraron incidencias con los filtros seleccionados
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog for solving incident */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Marcar incidencia como resuelta</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Está seguro de que desea marcar esta incidencia como resuelta?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="solverId"
            label="ID del responsable (DNI del mecánico)"
            type="number"
            fullWidth
            variant="outlined"
            value={solverId}
            onChange={(e) => setSolverId(e.target.value)}
            error={solverId !== '' && isNaN(parseInt(solverId))}
            helperText={solverId !== '' && isNaN(parseInt(solverId)) ? "Debe ser un número válido" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button 
            onClick={handleSolveIncident} 
            variant="contained"
            disabled={!solverId.trim()}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Incidencias 