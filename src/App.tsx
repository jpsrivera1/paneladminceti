import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import UniformInventory from './components/UniformInventory/UniformInventory';
import TeacherReports from './components/Reports/TeacherReports';
import Login from './components/Login/Login';
import { verificarSesion } from './services/apiService';
import './App.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario en localStorage
    const verificarUsuario = async () => {
      const savedUser = localStorage.getItem('adminUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          // Verificar que la sesión siga siendo válida
          await verificarSesion(userData.id);
          setUser(userData);
        } catch (error) {
          console.error('Sesión inválida:', error);
          localStorage.removeItem('adminUser');
          setUser(null);
        }
      }
      setLoading(false);
    };

    verificarUsuario();
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Layout onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventario-uniformes" element={<UniformInventory />} />
            <Route path="/reportes-docentes" element={<TeacherReports />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}

export default App;
