import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss'; // Ajuste de importación para TSX, sin extensión
import { Dashboard } from './components/dashboard/Dashboard';
import ProductDetail from './components/entradaAlmacen/ProductDetail';

// Definir los componentes funcionales con TypeScript
const Embarque1: React.FC = () => <div>Embarque 1</div>;
const Embarque2: React.FC = () => <div>Embarque 2</div>;
const Embarque3: React.FC = () => <div>Embarque 3</div>;
const SalidaAlmacen: React.FC = () => <div>Salida Almacén</div>;

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        {/* Rutas de la aplicación */}
        <Routes>
          <Route path="/" element={<Dashboard />} /> {/* Dashboard principal */}
          <Route path="/salida-almacen" element={<SalidaAlmacen />} /> {/* Vista Salida Almacén */}
          <Route path="/entrada-almacen" element={<ProductDetail />} /> {/* Vista Entrada Almacén */}
          <Route path="/embarque-1" element={<Embarque1 />} />
          <Route path="/embarque-2" element={<Embarque2 />} />
          <Route path="/embarque-3" element={<Embarque3 />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;