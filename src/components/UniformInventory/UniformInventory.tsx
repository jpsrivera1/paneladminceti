import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import './UniformInventory.css';

interface TallaInfo {
  talla: string;
  cantidad: number;
}

interface ItemInfo {
  item_id: number;
  item_nombre: string;
  tallas: TallaInfo[];
  total: number;
}

interface CategoriaReporte {
  categoria_id: number;
  categoria_nombre: string;
  categoria_descripcion: string;
  items: ItemInfo[];
  total_registros: number;
}

const UniformInventory: React.FC = () => {
  const [reporteData, setReporteData] = useState<CategoriaReporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventarioData();
  }, []);

  const fetchInventarioData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUniformInventory();
      setReporteData(response.data || []);
    } catch (error) {
      console.error('Error fetching uniform inventory:', error);
      setError('Error al cargar el inventario de uniformes');
      setReporteData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Preparar datos para CSV
    const csvData: string[] = [];
    csvData.push('Categoría,Prenda,Talla,Cantidad');

    reporteData.forEach(categoria => {
      categoria.items.forEach(item => {
        item.tallas.forEach(talla => {
          csvData.push(`${categoria.categoria_nombre},${item.item_nombre},${talla.talla},${talla.cantidad}`);
        });
      });
    });

    // Crear y descargar archivo
    const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario-uniformes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getCategoryColor = (nombre: string) => {
    if (nombre.includes('Kinder') || nombre.includes('Primaria')) return 'warning';
    if (nombre.includes('Básico') || nombre.includes('Carrera')) return 'lime';
    if (nombre.includes('Fin de Semana')) return 'primary';
    return 'secondary';
  };

  const getCategoryIcon = (nombre: string) => {
    if (nombre.includes('Kinder') || nombre.includes('Primaria')) return 'bi-stars';
    if (nombre.includes('Básico') || nombre.includes('Carrera')) return 'bi-mortarboard';
    if (nombre.includes('Fin de Semana')) return 'bi-calendar-week';
    return 'bi-tag';
  };

  if (loading) {
    return (
      <div className="uniform-inventory">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando inventario de uniformes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="uniform-inventory">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button className="btn btn-primary" onClick={fetchInventarioData}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="uniform-inventory">
      <div className="inventory-header no-print">
        <div className="header-content">
          <h1 className="inventory-title">
            <i className="bi bi-box-seam me-2"></i>
            Inventario de Uniformes por Tallas
          </h1>
          <p className="inventory-subtitle">
            Reporte de tallas registradas por categoría para pedidos
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline-primary" onClick={fetchInventarioData}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Actualizar
          </button>
          <button className="btn btn-outline-success" onClick={handleExport}>
            <i className="bi bi-file-earmark-spreadsheet me-2"></i>
            Exportar CSV
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <i className="bi bi-printer me-2"></i>
            Imprimir
          </button>
        </div>
      </div>

      {/* Información de fecha */}
      <div className="report-info">
        <div className="info-card">
          <i className="bi bi-calendar3 me-2"></i>
          <span>Fecha de generación: {new Date().toLocaleDateString('es-GT', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })}</span>
        </div>
        <div className="info-card">
          <i className="bi bi-graph-up me-2"></i>
          <span>Total de registros: {reporteData.reduce((sum, cat) => sum + cat.total_registros, 0)}</span>
        </div>
      </div>

      {/* Categorías */}
      {reporteData.map((categoria) => (
        <div key={categoria.categoria_id} className="category-section">
          <div className={`category-header bg-${getCategoryColor(categoria.categoria_nombre)}`}>
            <h2 className="category-title">
              <i className={`${getCategoryIcon(categoria.categoria_nombre)} me-2`}></i>
              {categoria.categoria_nombre}
            </h2>
          </div>
          
          <p className="category-description">{categoria.categoria_descripcion}</p>

          {/* Items de la categoría */}
          <div className="items-grid">
            {categoria.items.map((item) => (
              <div key={item.item_id} className="item-card">
                <div className="item-header">
                  <h3 className="item-name">
                    <i className="bi bi-person-badge me-2"></i>
                    {item.item_nombre}
                  </h3>
                  <span className="item-total">{item.total} uds.</span>
                </div>

                {/* Tallas en formato horizontal */}
                <div className="sizes-container">
                  {item.tallas.length > 0 ? (
                    <div className="sizes-row">
                      {item.tallas.map((talla, index) => (
                        <div key={index} className="size-chip">
                          <span className="size-label">{talla.talla}</span>
                          <span className="size-quantity">{talla.cantidad}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-sizes">
                      <i className="bi bi-inbox me-2"></i>
                      Sin tallas registradas
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {reporteData.length === 0 && (
        <div className="empty-state">
          <i className="bi bi-inbox display-1 text-muted"></i>
          <h3 className="mt-3">No hay datos disponibles</h3>
          <p className="text-muted">No se encontraron registros de uniformes</p>
        </div>
      )}
    </div>
  );
};

export default UniformInventory;
