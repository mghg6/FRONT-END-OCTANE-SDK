import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, IconButton, Autocomplete, Modal } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Swal from 'sweetalert2';
import '../entradasmp/entradas.scss';

// Interfaz para las filas de la tabla
interface EntradasPTRow {
  id: number;
  claveProducto: string;
  nombreProducto: string;
  claveUnidad: string;
  piezas: number;
  pesoNeto: number;
  trazabilidad: string;
  orden: string;
  ubicacion: string;
  numTarima: number;
  operadorEntrada: string;
}

// Lista de ubicaciones
const ubicaciones = [
  "PT1-C01", "PT1-C02", "PT1-C03", "PT1-C04", "PT1-C05", "PT1-C06", "PT1-C07", "PT1-C08", "PT1-EMBARQUES",
  "PT1-PASO1", "PT1-PASO4", "PT1-PASO5", "PT1-PASO6", "PT1-PASO8", "PT1-RAA-L1", "PT1-RB-L1", "PT1-RB-L2",
  "PT1-RD-L1", "PT1-RD-L2", "PT1-RE-L1", "PT1-RE-L2", "PT1-REPROCESOS", "PT1-RF-L1", "PT1-RF-L2", "PT1-RG-L1",
  "PT1-RG-L2", "PT1-RH-L1", "PT1-RH-L2", "PT1-RR-L1", "PT1-RR-L2", "PT1-RU-L1", "PT1-RU-L2", "PT1-RV-L1",
  "PT1-RV-L2", "PT1-RZ-L1", "PT1-RZ-L2", "PT1-UBICACIÓN-DE-SISTEMA"
];

const antennas = [
  { id: 1, name: 'EntradaPT' },
  { id: 2, name: 'SalidaMP' },
  { id: 3, name: 'Embarques' },
];

const EntradasPT: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAntenna, setSelectedAntenna] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [records, setRecords] = useState<EntradasPTRow[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<EntradasPTRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 });

  // Estado para los operadores (personas)
  const [personas, setPersonas] = useState<string[]>([]);

  // Función para obtener los operadores desde la API
  const fetchOperadores = async () => {
    try {
      const response = await fetch('http://172.16.10.31/api/OperadoresRFID');
      if (response.ok) {
        const data = await response.json();
        // Mapear la respuesta para extraer solo los nombres de los operadores
        setPersonas(data.map((operador: any) => operador.nombreOperador));
      } else {
        console.error('Error al obtener los operadores');
      }
    } catch (error) {
      console.error('Error al obtener los operadores:', error);
    }
  };

  useEffect(() => {
    // Llamamos a la función fetchOperadores al cargar el componente
    fetchOperadores();
  }, []); // El arreglo vacío asegura que se ejecute solo una vez al montar el componente

  const formatConditionalValue = (claveUnidad: string, piezas: number, pesoNeto: number) => {
    if (['MIL', 'H87', 'XBX'].includes(claveUnidad)) {
      return piezas;
    }
    return pesoNeto;
  };

  const handleUbicacionChange = (id: number, newUbicacion: string) => {
    setRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.id === id ? { ...record, ubicacion: newUbicacion } : record
      )
    );
  };

  const handleLoadRecords = async () => {
    if (!startDate || !endDate) {
      console.log('Fecha de inicio o fecha de fin no seleccionada');
      return;
    }
  
    if (!selectedAntenna) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Por favor selecciona una antena antes de continuar.',
      });
      return;
    }
  
    Swal.fire({
      title: 'Cargando registros...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  
    try {
      const response = await fetch(
        `http://172.16.10.31/api/ProdExtraInfo/FiltrarEntradasAlmacen?fechaInicio=${startDate}&fechaFin=${endDate}&antena=${selectedAntenna.name}`
      );
  
      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
      }
  
      const data: any[] = await response.json();
      console.log('Datos recibidos:', data);
  
      const formattedRecords = data.map((item: any) => ({
        id: item.id, // Para identificar cada fila en la tabla
        numTarima: item.numTarima,
        claveProducto: item.prodEtiquetaRFID.claveProducto,
        nombreProducto: item.prodEtiquetaRFID.nombreProducto,
        claveUnidad: item.prodEtiquetaRFID.claveUnidad,
        piezas: item.prodEtiquetaRFID.piezas,
        pesoNeto: item.prodEtiquetaRFID.pesoNeto,
        orden: item.prodEtiquetaRFID.orden,
        trazabilidad: item.prodEtiquetaRFID.trazabilidad,
        operadorEntrada: item.operadorEntrada,
        ubicacion: "", // Inicialmente vacío; puedes actualizarlo después
      }));
  
      console.log('Registros formateados:', formattedRecords);
  
      setRecords(formattedRecords);
  
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Registros cargados',
        text: 'Los registros se han cargado correctamente.',
      });
    } catch (error) {
      console.error('Error al cargar los registros:', error);
  
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al cargar los registros. Por favor, intenta nuevamente.',
      });
    }
  };

  const handleOpenModal = () => {
    const selectedRows = records.filter(record => record.ubicacion); // Filtra los registros con una ubicación seleccionada
    setSelectedRecords(selectedRows);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const columns: GridColDef[] = [
    { field: 'numTarima', headerName: 'No.', width: 100 },
    { field: 'claveProducto', headerName: 'Clave Producto', width: 200 },
    { field: 'nombreProducto', headerName: 'Nombre Producto', width: 450 },
    { field: 'claveUnidad', headerName: 'Clave Unidad', width: 150 },
    {
      field: 'conditionalValue',
      headerName: 'Cantidad/Peso',
      width: 150,
      renderCell: (params) => (
        <span>
          {formatConditionalValue(params.row.claveUnidad, params.row.piezas, params.row.pesoNeto)}
        </span>
      )
    },
    { field: 'orden', headerName: 'Orden', width: 150 },
    { field: 'trazabilidad', headerName: 'Trazabilidad', width: 200 },
    { field: 'operadorEntrada', headerName: 'Operador Entrada', width: 200 },
    {
      field: 'ubicacion',
      headerName: 'Ubicación',
      width: 300,
      renderCell: (params) => (
        <Autocomplete
          options={ubicaciones}
          value={params.row.ubicacion || ""}
          onChange={(event, newValue) => handleUbicacionChange(params.row.id, newValue || "")}
          renderInput={(params) => <TextField {...params} variant="standard" label="Selecciona Ubicación" />}
        />
      ),
    },
  ];

  const handleConfirmarSubidaSAP = async () => {
    if (!selectedPerson) {
      console.error('No se ha seleccionado a la persona para la confirmación');
      return;
    }
    // Mostrar una alerta de confirmación antes de proceder
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas confirmar la subida a SAP con el operador ${selectedPerson}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      // Si el usuario confirma, proceder con la subida a SAP
      for (const record of selectedRecords) {
        try {
          const response = await fetch(
            `http://172.16.10.31/api/StatusSAP/StatusByTrazabilidad/${record.trazabilidad}?operadorAltaSAP=${encodeURIComponent(selectedPerson)}&Ubicacion=${encodeURIComponent(record.ubicacion)}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 3 }), // Enviamos el status como 3 (puedes ajustar según sea necesario)
            }
          );

          if (!response.ok) {
            throw new Error(`Error en la actualización de la trazabilidad: ${record.trazabilidad}`);
          }

          console.log(`Actualización exitosa para trazabilidad: ${record.trazabilidad}`);
        } catch (error: any) {
          console.error('Error al subir a SAP:', error);
          Swal.fire('Error', `Error al actualizar la trazabilidad ${record.trazabilidad}: ${error.message}`, 'error');
        }
      }

      // Mostrar una alerta de éxito cuando todos los registros han sido procesados
      Swal.fire('Éxito', 'Todos los registros se han subido correctamente a SAP.', 'success');

      // Después de procesar todos los registros, cerrar la modal
      handleCloseModal();
    } else {
      // Si el usuario cancela, mostramos un mensaje de cancelación
      Swal.fire('Cancelado', 'La subida a SAP ha sido cancelada.', 'info');
    }
  };

  return (
    <div className="entradas-container">
      <Box sx={{ width: '100%', p: 1, position: 'relative' }}>
        <IconButton
          onClick={() => navigate('/ModulosEntradas')}
          sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
        >
          <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
        </IconButton>
        <Box sx={{ pt: 3, width: '100%', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
            CONSULTA DE ENTRADAS PT
          </Typography>
        </Box>
      </Box>

      <Box className="filter-box">
        <Autocomplete
          options={antennas}
          getOptionLabel={(option) => option.name}
          onChange={(event, newValue) => setSelectedAntenna(newValue)}
          renderInput={(params) => <TextField {...params} label="Selecciona Antena" />}
          sx={{ width: '300px', mr: 2 }}
        />
        <TextField
          label="Fecha Inicio"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: '200px', mr: 2 }}
        />
        <TextField
          label="Fecha Fin"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: '200px', mr: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleLoadRecords}
          sx={{
            backgroundColor: '#46707e',
            color: 'white',
            '&:hover': { backgroundColor: '#3b5c6b' },
            height: '56px'
          }}
        >
          Cargar Registros
        </Button>
      </Box>

      <Box className="data-grid-container">
        <DataGrid
          rows={records}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 15, 25]}
          checkboxSelection
        />
      </Box>
      <Box className="filter-box">
        <Button
          variant="contained"
          onClick={handleOpenModal}
          sx={{
            backgroundColor: '#46707e',
            color: 'white',
            '&:hover': { backgroundColor: '#3b5c6b' },
            height: '56px',
            ml: 2
          }}
        >
          Confirmar Selección
        </Button>
      </Box>

      <Modal open={isModalOpen} onClose={handleCloseModal} style={{ zIndex: 1050 }}>
        <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, width: '80%', margin: 'auto', mt: 5 }}>
          <Typography variant="h6" gutterBottom>
            Confirmar Información para Subir a SAP
          </Typography>
          <Box className="data-grid-container" sx={{ mb: 3 }}>
            <DataGrid
              rows={selectedRecords}
              columns={columns}
              pageSizeOptions={[5, 10, 15, 25]}
              autoHeight
            />
          </Box>
          <Autocomplete
            options={personas}
            getOptionLabel={(option) => option}
            onChange={(event, newValue) => setSelectedPerson(newValue || null)}
            renderInput={(params) => <TextField {...params} label="Selecciona quién realiza la confirmación" fullWidth />}
          />
          <Button
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: '#46707e',
              color: 'white',
              '&:hover': { backgroundColor: '#3b5c6b' }
            }}
            onClick={handleConfirmarSubidaSAP}
          >
            Subir a SAP
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default EntradasPT;
