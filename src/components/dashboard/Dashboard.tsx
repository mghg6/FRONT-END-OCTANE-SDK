import React from 'react';
import { Box, Grid, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import './dashboard.scss';

// Definir el tipo para los elementos de los botones
interface ButtonItem {
  icon: React.ElementType; // Tipo para los iconos importados
  label: string;
  path: string;
}

const buttons: ButtonItem[] = [
  { icon: WarehouseIcon, label: 'SALIDA ALMACEN', path: '/salida-almacen' },
  { icon: LocalShippingIcon, label: 'ENTRADA ALMACEN', path: '/entrada-almacen' },
  { icon: FlightTakeoffIcon, label: 'EMBARQUE 1', path: '/embarque-1' },
  { icon: FlightTakeoffIcon, label: 'EMBARQUE 2', path: '/embarque-2' },
  { icon: FlightTakeoffIcon, label: 'EMBARQUE 3', path: '/embarque-3' },
];

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isXSmall = useMediaQuery(theme.breakpoints.down('xs'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const iconSize = isXSmall ? 40 : 60;

  return (
    <Box
      className="dashboard-container"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f6f8',
      }}
    >
      <Grid container spacing={4} justifyContent="center" alignItems="center">
        {buttons.map((item, index) => {
          const Icon = item.icon; // Se asegura que Icon sea el componente adecuado
          return (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <Link to={item.path} style={{ textDecoration: 'none', width: '100%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 150,
                    height: '100%',
                    backgroundColor: '#46707e',
                    borderRadius: 2,
                    boxShadow: 3,
                    color: 'white',
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#3b5c6b',
                    },
                    padding: theme.spacing(2),
                  }}
                >
                  <Icon sx={{ fontSize: iconSize }} />
                  <Typography
                    variant="h6"
                    sx={{
                      mt: 2,
                      fontSize: isXSmall || isSmall ? '0.875rem' : '1rem',
                      textAlign: 'center',
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              </Link>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};