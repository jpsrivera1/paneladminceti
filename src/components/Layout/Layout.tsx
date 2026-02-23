import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      onLogout();
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <nav id="sidebar" className={`bg-primary text-white sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="position-sticky">
          <div className="sidebar-header p-3 border-bottom border-light">
            <button
              onClick={toggleSidebar}
              className="btn btn-sm btn-outline-light mb-2 w-100 d-flex justify-content-end align-items-center"
              title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              <i className={`bi bi-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
            </button>
            {!isCollapsed && (
              <>
                <h4 className="fw-bold">📊 Admin Panel</h4>
                <p className="mb-0 small">Sistema de Estudiantes</p>
              </>
            )}
            {isCollapsed && (
              <div className="text-center">
                <h4 className="mb-0">📊</h4>
              </div>
            )}
          </div>
          
          <div className="list-group list-group-flush">
            <Link
              to="/dashboard"
              className={`list-group-item list-group-item-action bg-primary text-white border-0 ${
                location.pathname === '/' || location.pathname === '/dashboard' ? 'active-sidebar' : ''
              } ${isCollapsed ? 'text-center' : ''}`}
              title={isCollapsed ? 'Dashboard' : ''}
            >
              <i className="bi bi-speedometer2 me-2"></i>
              {!isCollapsed && 'Dashboard'}
            </Link>
            
            <Link
              to="/inventario-uniformes"
              className={`list-group-item list-group-item-action bg-primary text-white border-0 ${
                location.pathname === '/inventario-uniformes' ? 'active-sidebar' : ''
              } ${isCollapsed ? 'text-center' : ''}`}
              title={isCollapsed ? 'Inventario de Uniformes' : ''}
            >
              <i className="bi bi-box-seam me-2"></i>
              {!isCollapsed && 'Inventario de Uniformes'}
            </Link>

            <Link
              to="/reportes-docentes"
              className={`list-group-item list-group-item-action bg-primary text-white border-0 ${
                location.pathname === '/reportes-docentes' ? 'active-sidebar' : ''
              } ${isCollapsed ? 'text-center' : ''}`}
              title={isCollapsed ? 'Reportes de Docentes' : ''}
            >
              <i className="bi bi-person-video3 me-2"></i>
              {!isCollapsed && 'Reportes de Docentes'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow-1">
        {/* Top navbar */}
        <nav className={`navbar navbar-expand-lg navbar-light bg-light shadow-sm ${isCollapsed ? 'navbar-collapsed' : ''}`}>
          <div className="container-fluid">
            <h5 className="mb-0">
              {location.pathname === '/' || location.pathname === '/dashboard' 
                ? 'Dashboard Principal' 
                : location.pathname === '/inventario-uniformes'
                ? 'Inventario de Uniformes'
                : location.pathname === '/reportes-docentes'
                ? 'Reportes de Docentes'
                : 'Panel Administrativo'
              }
            </h5>
            <div className="d-flex align-items-center">
              {!isCollapsed && (
                <span className="navbar-text me-3">
                  <i className="bi bi-person-circle me-1"></i>
                  Administrador
                </span>
              )}
              <button className="btn btn-outline-danger btn-sm" onClick={handleLogout} title="Cerrar sesión">
                <i className="bi bi-box-arrow-right me-1"></i>
                {!isCollapsed && 'Salir'}
              </button>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <div className={`content p-4 ${isCollapsed ? 'content-collapsed' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;