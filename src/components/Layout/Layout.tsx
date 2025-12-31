import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      onLogout();
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <nav id="sidebar" className="bg-primary text-white sidebar">
        <div className="position-sticky">
          <div className="sidebar-header p-3 border-bottom border-light">
            <h4 className="fw-bold">📊 Admin Panel</h4>
            <p className="mb-0 small">Sistema de Estudiantes</p>
          </div>
          
          <div className="list-group list-group-flush">
            <Link
              to="/dashboard"
              className={`list-group-item list-group-item-action bg-primary text-white border-0 ${
                location.pathname === '/' || location.pathname === '/dashboard' ? 'active-sidebar' : ''
              }`}
            >
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard
            </Link>
            
            <Link
              to="/inventario-uniformes"
              className={`list-group-item list-group-item-action bg-primary text-white border-0 ${
                location.pathname === '/inventario-uniformes' ? 'active-sidebar' : ''
              }`}
            >
              <i className="bi bi-box-seam me-2"></i>
              Inventario de Uniformes
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow-1">
        {/* Top navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
          <div className="container-fluid">
            <h5 className="mb-0">
              {location.pathname === '/' || location.pathname === '/dashboard' 
                ? 'Dashboard Principal' 
                : location.pathname === '/inventario-uniformes'
                ? 'Inventario de Uniformes'
                : 'Panel Administrativo'
              }
            </h5>
            <div className="d-flex align-items-center">
              <span className="navbar-text me-3">
                <i className="bi bi-person-circle me-1"></i>
                Administrador
              </span>
              <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i>
                Salir
              </button>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <div className="content p-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;