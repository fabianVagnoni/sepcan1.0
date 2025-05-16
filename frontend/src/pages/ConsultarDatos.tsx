import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
  DialogContentText,
  DialogActions,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Chip,
  styled
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import { queryCombinedData } from '../services/api'

// Styled components for custom tabs with stronger styling
const StyledTabs = styled(Tabs)(() => ({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: '3px',
    '&::before': {
      content: '""',
      display: 'block',
      width: '100%',
      height: '100%',
      borderRadius: '1.5px',
      backgroundColor: 'rgba(0, 153, 204, 0.8)',
    }
  },
  '& .MuiTabs-flexContainer': {
    borderBottom: 'none',
  }
}));

const StyledTab = styled(Tab)(() => ({
  textTransform: 'none',
  backgroundColor: 'transparent !important',
  color: '#333 !important',
  fontFamily: 'Montserrat, sans-serif !important',
  fontWeight: 500,
  fontSize: '1rem',
  padding: '8px 12px',
  minHeight: '40px',
  minWidth: 'auto',
  margin: '0 4px',
  '&:hover': {
    backgroundColor: 'transparent !important',
    color: 'rgba(0, 153, 204, 0.8) !important',
    textDecoration: 'underline',
    textUnderlineOffset: '6px',
    textDecorationThickness: '2px',
  },
  '&.Mui-selected': {
    color: 'rgba(0, 153, 204, 0.8) !important',
    backgroundColor: 'transparent !important',
    border: 'none',
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'transparent !important',
  }
}));

// Form data interface
interface FormData {
  fecha_inicio?: string;
  fecha_fin?: string;
  format?: 'json' | 'excel';
  password: string;
}

// Result data interfaces
interface FormularioCoche {
  tipo: string;
  id_coche: number;
  marca_coche: string;
  modelo_coche: string;
  dni_trabajador: number;
  nombre_trabajador: string;
  apellido_trabajador: string;
  id_trabajo: number;
  cliente_trabajo: string;
  fecha_trabajo: string;
  fecha: string;
  hora_partida: string;
  estado_coche: string;
  otros?: string;
}

interface FormularioTrabajo {
  tipo: string;
  id_coche: number;
  marca_coche: string;
  modelo_coche: string;
  dni_trabajador: number;
  nombre_trabajador: string;
  apellido_trabajador: string;
  id_trabajo: number;
  cliente_trabajo: string;
  fecha_trabajo: string;
  fecha?: string;
  hora_final?: string;
  horas_trabajadas?: number;
  lugar_trabajo?: string;
  tiempo_llegada?: number;
  otros?: string;
}

interface CombinedData {
  formularios_coche: FormularioCoche[];
  formularios_trabajo: FormularioTrabajo[];
}

// Interface for filter options
interface FilterOption {
  id: number | string;
  name: string;
}

const ConsultarDatos = () => {
  const [results, setResults] = useState<CombinedData>({ formularios_coche: [], formularios_trabajo: [] })
  const [filteredResults, setFilteredResults] = useState<CombinedData>({ formularios_coche: [], formularios_trabajo: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [queryAction, setQueryAction] = useState<'query' | 'export'>('query')
  const [activeTab, setActiveTab] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [workerOptions, setWorkerOptions] = useState<FilterOption[]>([])
  const [carOptions, setCarOptions] = useState<FilterOption[]>([])
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([])
  const [selectedCars, setSelectedCars] = useState<number[]>([])

  const CORRECT_PASSWORD = import.meta.env.VITE_APP_ACCESS_PASSWORD

  const {
    control,
    handleSubmit,
    formState: { },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      fecha_inicio: '',
      fecha_fin: '',
      format: 'json',
      password: '',
    },
  })

  // Extract unique workers and cars from results for filter options
  useEffect(() => {
    if (results.formularios_coche.length > 0 || results.formularios_trabajo.length > 0) {
      // Extract unique workers
      const workersSet = new Set<string>()
      const carsSet = new Set<string>()
      
      // Process car forms
      results.formularios_coche.forEach(form => {
        workersSet.add(`${form.dni_trabajador}:${form.nombre_trabajador} ${form.apellido_trabajador}`)
        carsSet.add(`${form.id_coche}:Coche ${form.id_coche}`)
      })
      
      // Process work forms
      results.formularios_trabajo.forEach(form => {
        workersSet.add(`${form.dni_trabajador}:${form.nombre_trabajador} ${form.apellido_trabajador}`)
        carsSet.add(`${form.id_coche}:Coche ${form.id_coche}`)
      })
      
      // Convert to array of objects for select options
      const workerOptionsArray = Array.from(workersSet).map(worker => {
        const [id, name] = worker.split(':')
        return { id: parseInt(id), name }
      })
      
      const carOptionsArray = Array.from(carsSet).map(car => {
        const [id, name] = car.split(':')
        return { id: parseInt(id), name }
      })
      
      setWorkerOptions(workerOptionsArray)
      setCarOptions(carOptionsArray)
      
      // Initialize with all results
      setFilteredResults(results)
    }
  }, [results])
  
  // Apply filters when selection changes
  useEffect(() => {
    if (results.formularios_coche.length === 0 && results.formularios_trabajo.length === 0) {
      return
    }
    
    const filteredData: CombinedData = {
      formularios_coche: [],
      formularios_trabajo: []
    }
    
    // Apply worker and car filters to car forms
    filteredData.formularios_coche = results.formularios_coche.filter(form => {
      const workerMatch = selectedWorkers.length === 0 || selectedWorkers.includes(form.dni_trabajador)
      const carMatch = selectedCars.length === 0 || selectedCars.includes(form.id_coche)
      return workerMatch && carMatch
    })
    
    // Apply worker and car filters to work forms
    filteredData.formularios_trabajo = results.formularios_trabajo.filter(form => {
      const workerMatch = selectedWorkers.length === 0 || selectedWorkers.includes(form.dni_trabajador)
      const carMatch = selectedCars.length === 0 || selectedCars.includes(form.id_coche)
      return workerMatch && carMatch
    })
    
    setFilteredResults(filteredData)
  }, [selectedWorkers, selectedCars, results])

  const handlePasswordSubmit = async () => {
    const password = watch('password')
    if (password === CORRECT_PASSWORD) {
      setPasswordDialogOpen(false)
      setPasswordError(null)
      
      if (queryAction === 'query') {
        await executeQuery()
      } else {
        await executeExport()
      }
    } else {
      setPasswordError('Contraseña incorrecta')
    }
  }

  const executeQuery = async () => {
    setIsLoading(true)
    try {
      const formData = watch()
      const { password, ...queryData } = formData
      
      // Debug log
      console.log("Query params:", queryData);
      
      // Format dates for user feedback
      let dateMessage = "";
      if (queryData.fecha_inicio) {
        const startDate = new Date(queryData.fecha_inicio);
        const formattedStartDate = `${startDate.getDate().toString().padStart(2, '0')}/${(startDate.getMonth() + 1).toString().padStart(2, '0')}/${startDate.getFullYear()}`;
        dateMessage += `desde ${formattedStartDate}`;
      }
      if (queryData.fecha_fin) {
        const endDate = new Date(queryData.fecha_fin);
        const formattedEndDate = `${endDate.getDate().toString().padStart(2, '0')}/${(endDate.getMonth() + 1).toString().padStart(2, '0')}/${endDate.getFullYear()}`;
        dateMessage += dateMessage ? ` hasta ${formattedEndDate}` : `hasta ${formattedEndDate}`;
      }
      
      const data = await queryCombinedData(queryData)
      setResults(data || { formularios_coche: [], formularios_trabajo: [] })
      
      // Reset filters when new data is loaded
      setSelectedWorkers([])
      setSelectedCars([])
      
      // Debug logging
      console.log("API response:", data);
      if (data?.formularios_trabajo) {
        console.log("Trabajo results count:", data.formularios_trabajo.length);
        if (data.formularios_trabajo.length > 0) {
          console.log("First trabajo record:", data.formularios_trabajo[0]);
        }
      }
      
      // Show feedback about the search
      const totalResults = (data?.formularios_coche?.length || 0) + (data?.formularios_trabajo?.length || 0);
      if (totalResults === 0 && dateMessage) {
        alert(`No se encontraron resultados ${dateMessage}. Intente con un rango de fechas diferente.`);
      }
    } catch (error) {
      console.error('Error querying data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const executeExport = async () => {
    try {
      const formData = watch();
      const { password, ...queryData } = formData;
      
      // Debug log
      console.log("Export params:", queryData);
      
      // Generate a unique timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      // Build the query string
      const queryString = new URLSearchParams();
      if (queryData.fecha_inicio) queryString.append('fecha_inicio', queryData.fecha_inicio);
      if (queryData.fecha_fin) queryString.append('fecha_fin', queryData.fecha_fin);
      queryString.append('format', 'excel');
      // Add timestamp to prevent caching
      queryString.append('_t', timestamp.toString());
      
      // Use direct window.open approach with _blank target
      const exportUrl = `/api/query/combined-data?${queryString.toString()}`;
      window.open(exportUrl, '_blank');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error al exportar los datos. Por favor, inténtelo de nuevo más tarde.');
    }
  }

  const onSubmit = async () => {
    setQueryAction('query')
    setPasswordDialogOpen(true)
  }

  const handleExport = () => {
    setQueryAction('export')
    setPasswordDialogOpen(true)
  }

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false)
    setPasswordError(null)
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle worker selection
  const handleWorkerChange = (event: any) => {
    const value = event.target.value as number[]
    setSelectedWorkers(value)
  }
  
  // Handle car selection
  const handleCarChange = (event: any) => {
    const value = event.target.value as number[]
    setSelectedCars(value)
  }
  
  // Reset all filters
  const handleResetFilters = () => {
    setSelectedWorkers([])
    setSelectedCars([])
  }

  return (
    <Box sx={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
      padding: '20px', 
      borderRadius: '10px' }}>
      <Typography variant="h4" gutterBottom align="center">
        Consultar Datos
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filtros de Búsqueda
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle2">Rango de Fechas</Typography>
              </Divider>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                El filtro buscará trabajos realizados entre las fechas seleccionadas (formato DD/MM/AAAA).
              </Typography>
            </Grid>
            
            {/* Date range filters */}
            <Grid item xs={12} md={6}>
              <Controller
                name="fecha_inicio"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Fecha de Inicio"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    helperText="Filtrar desde esta fecha (inclusive)"
                    inputProps={{
                      max: "2050-12-31",
                      min: "1900-01-01"
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="fecha_fin"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Fecha de Fin"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    helperText="Filtrar hasta esta fecha (inclusive)"
                    inputProps={{
                      max: "2030-12-31",
                      min: "1900-01-01"
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Consultar'}
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleExport}
                fullWidth
                disabled={isLoading}
                sx={{ color: 'white' }}
              >
                Exportar a Excel
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {(results.formularios_coche.length > 0 || results.formularios_trabajo.length > 0) && (
        <>
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
                Filtros Adicionales
              </Typography>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth>
                    <InputLabel id="workers-filter-label">Trabajadores</InputLabel>
                    <Select
                      labelId="workers-filter-label"
                      id="workers-filter"
                      multiple
                      value={selectedWorkers}
                      onChange={handleWorkerChange}
                      input={<OutlinedInput label="Trabajadores" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const worker = workerOptions.find(w => w.id === value);
                            return <Chip key={value} label={worker?.name || value} />
                          })}
                        </Box>
                      )}
                    >
                      {workerOptions.map((worker) => (
                        <MenuItem key={worker.id} value={worker.id as number}>
                          <Checkbox checked={selectedWorkers.includes(worker.id as number)} />
                          <ListItemText primary={worker.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth>
                    <InputLabel id="cars-filter-label">Vehículos</InputLabel>
                    <Select
                      labelId="cars-filter-label"
                      id="cars-filter"
                      multiple
                      value={selectedCars}
                      onChange={handleCarChange}
                      input={<OutlinedInput label="Vehículos" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const car = carOptions.find(c => c.id === value);
                            return <Chip key={value} label={car?.name || value} />
                          })}
                        </Box>
                      )}
                    >
                      {carOptions.map((car) => (
                        <MenuItem key={car.id} value={car.id as number}>
                          <Checkbox checked={selectedCars.includes(car.id as number)} />
                          <ListItemText primary={car.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
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
          
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resultados
            </Typography>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <StyledTabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="Tabs de resultados"
              >
                <StyledTab 
                  label={`Formularios Coche (${filteredResults.formularios_coche.length})`} 
                />
                <StyledTab 
                  label={`Formularios Trabajo (${filteredResults.formularios_trabajo.length})`} 
                />
              </StyledTabs>
            </Box>
            
            {/* Formularios Coche Table */}
            {activeTab === 0 && (
              <TableContainer>
                {filteredResults.formularios_coche.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>DNI Trabajador</TableCell>
                        <TableCell>Nombre Trabajador</TableCell>
                        <TableCell>ID Coche</TableCell>
                        <TableCell>ID Trabajo</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Fecha Trabajo</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Hora Partida</TableCell>
                        <TableCell>Estado Coche</TableCell>
                        <TableCell>Otros</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredResults.formularios_coche.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>{result.dni_trabajador}</TableCell>
                          <TableCell>{result.nombre_trabajador} {result.apellido_trabajador}</TableCell>
                          <TableCell>{result.id_coche}</TableCell>
                          <TableCell>{result.id_trabajo}</TableCell>
                          <TableCell>{result.cliente_trabajo}</TableCell>
                          <TableCell>{result.fecha_trabajo}</TableCell>
                          <TableCell>{result.fecha}</TableCell>
                          <TableCell>{result.hora_partida}</TableCell>
                          <TableCell>{result.estado_coche}</TableCell>
                          <TableCell>{result.otros}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography variant="body1" align="center" sx={{ py: 3 }}>
                    No se encontraron formularios de coche con los filtros seleccionados.
                  </Typography>
                )}
              </TableContainer>
            )}
            
            {/* Formularios Trabajo Table */}
            {activeTab === 1 && (
              <TableContainer>
                {filteredResults.formularios_trabajo.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>DNI Trabajador</TableCell>
                        <TableCell>Nombre Trabajador</TableCell>
                        <TableCell>ID Coche</TableCell>
                        <TableCell>ID Trabajo</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Fecha Trabajo</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Hora Final</TableCell>
                        <TableCell>Horas Trabajadas</TableCell>
                        <TableCell>Lugar Trabajo</TableCell>
                        <TableCell>Tiempo Llegada</TableCell>
                        <TableCell>Otros</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredResults.formularios_trabajo.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>{result.dni_trabajador}</TableCell>
                          <TableCell>{result.nombre_trabajador} {result.apellido_trabajador}</TableCell>
                          <TableCell>{result.id_coche}</TableCell>
                          <TableCell>{result.id_trabajo}</TableCell>
                          <TableCell>{result.cliente_trabajo}</TableCell>
                          <TableCell>{result.fecha_trabajo}</TableCell>
                          <TableCell>{result.fecha || '-'}</TableCell>
                          <TableCell>{result.hora_final || '-'}</TableCell>
                          <TableCell>{result.horas_trabajadas !== undefined ? result.horas_trabajadas : '-'}</TableCell>
                          <TableCell>{result.lugar_trabajo || '-'}</TableCell>
                          <TableCell>{result.tiempo_llegada !== undefined ? result.tiempo_llegada : '-'}</TableCell>
                          <TableCell>{result.otros || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography variant="body1" align="center" sx={{ py: 3 }}>
                    No se encontraron formularios de trabajo con los filtros seleccionados.
                  </Typography>
                )}
              </TableContainer>
            )}
          </Paper>
        </>
      )}
      
      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog}>
        <DialogTitle>Verificación de Acceso</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Por favor, ingrese la contraseña para acceder a los datos.
          </DialogContentText>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                margin="dense"
                label="Contraseña"
                type="password"
                fullWidth
                variant="outlined"
                error={!!passwordError}
                helperText={passwordError}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancelar</Button>
          <Button onClick={handlePasswordSubmit} variant="contained" color="primary">
            {queryAction === 'query' ? 'Consultar' : 'Exportar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ConsultarDatos 