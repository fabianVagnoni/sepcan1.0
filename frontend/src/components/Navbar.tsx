import { useState } from 'react';
import { AppBar, Toolbar, Button, Menu, MenuItem, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import logo from '../assets/sepcan_logo.jpg';

// Forms submenu items
const formPages = [
  { name: 'Formulario de Coche', path: '/formulario-coche' },
  { name: 'Formulario de Trabajo', path: '/formulario-trabajo' },
];

// Private data submenu items
const privateDataPages = [
  { name: 'Coches', path: '/datos-privados/coches' },
  { name: 'Trabajadores', path: '/datos-privados/trabajadores' },
  { name: 'Trabajos', path: '/datos-privados/trabajos' },
];

const Navbar = () => {
  const [formsAnchorEl, setFormsAnchorEl] = useState<null | HTMLElement>(null);
  const [privateDataAnchorEl, setPrivateDataAnchorEl] = useState<null | HTMLElement>(null);

  const handleFormsClick = (event: React.MouseEvent<HTMLElement>) => {
    setFormsAnchorEl(event.currentTarget);
  };

  const handleFormsClose = () => {
    setFormsAnchorEl(null);
  };

  const handlePrivateDataClick = (event: React.MouseEvent<HTMLElement>) => {
    setPrivateDataAnchorEl(event.currentTarget);
  };

  const handlePrivateDataClose = () => {
    setPrivateDataAnchorEl(null);
  };

  // Common button styles for consistency
  const buttonStyles = {
    color: '#333',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 500,
    padding: '8px 12px',
    minHeight: '40px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: 'transparent', 
      color: 'rgba(0, 153, 204, 0.8)',
      textDecoration: 'underline',
      textUnderlineOffset: '6px',
      textDecorationThickness: '2px',
    },
  };

  return (
    <AppBar   
    position="static"
    color="transparent"
    elevation={0}
    sx={{
      backgroundColor: 'rgba(255, 255, 255, 0)',
      boxShadow: 'none',
    }} 
    >
      <Toolbar>
        {/* Logo on the left */}
        <Box sx={{ flexGrow: 1 }}>
          <img src={logo} alt="Logo" style={{ width: '125px', height: 'auto' }} />
        </Box>
        
        {/* Navigation items on the right */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1,  
          marginLeft: 15,
          alignItems: 'center',
          height: '40px' // Ensure consistent height for the container
        }}>
          <Button
            component={RouterLink}
            to="/"
            sx={buttonStyles}
          >
            INICIO
          </Button>

          <Box sx={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Button
              onClick={handleFormsClick}
              endIcon={<KeyboardArrowDownIcon sx={{ ml: 0.5 }} />}
              sx={{
                ...buttonStyles,
                '& .MuiButton-endIcon': {
                  marginLeft: 0.5, // Reduce space between text and icon
                  marginTop: 0, // Ensure icon is vertically centered
                  display: 'inline-flex',
                  alignItems: 'center'
                }
              }}
            >
              FORMULARIOS
            </Button>
            <Menu
              anchorEl={formsAnchorEl}
              open={Boolean(formsAnchorEl)}
              onClose={handleFormsClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              {formPages.map((page) => (
                <MenuItem
                  key={page.name}
                  component={RouterLink}
                  to={page.path}
                  onClick={handleFormsClose}
                  sx={{
                    color: 'var(--text-primary)',
                    fontFamily: 'Montserrat, sans-serif',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 153, 204, 0.04)',
                    }
                  }}
                >
                  {page.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Button
              onClick={handlePrivateDataClick}
              endIcon={<KeyboardArrowDownIcon sx={{ ml: 0.5 }} />}
              sx={{
                ...buttonStyles,
                '& .MuiButton-endIcon': {
                  marginLeft: 0.5, // Reduce space between text and icon
                  marginTop: 0, // Ensure icon is vertically centered
                  display: 'inline-flex',
                  alignItems: 'center'
                }
              }}
            >
              DATOS PRIVADOS
            </Button>
            <Menu
              anchorEl={privateDataAnchorEl}
              open={Boolean(privateDataAnchorEl)}
              onClose={handlePrivateDataClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              {privateDataPages.map((page) => (
                <MenuItem
                  key={page.name}
                  component={RouterLink}
                  to={page.path}
                  onClick={handlePrivateDataClose}
                  sx={{
                    color: 'var(--text-primary)',
                    fontFamily: 'Montserrat, sans-serif',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 153, 204, 0.04)',
                    }
                  }}
                >
                  {page.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Button
            component={RouterLink}
            to="/consultar"
            sx={buttonStyles}
          >
            CONSULTAR DATOS
          </Button>

          <Button
            component={RouterLink}
            to="/incidencias"
            sx={buttonStyles}
          >
            INCIDENCIAS
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 