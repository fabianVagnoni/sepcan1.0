import { Link as RouterLink } from 'react-router-dom'
import { Typography, Button, Box, Paper } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 500,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Página No Encontrada
        </Typography>
        <Typography variant="body1" paragraph>
          La página que está buscando no existe o ha sido movida.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/"
          sx={{ mt: 2 }}
        >
          Volver al Inicio
        </Button>
      </Paper>
    </Box>
  )
}

export default NotFound 