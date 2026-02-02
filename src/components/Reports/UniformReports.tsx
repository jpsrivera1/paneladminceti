import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import './UniformReports.css';

interface UniformPayment {
  id: number;
  student_name: string;
  uniform_type: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_status: string;
  payment_date: string | null;
  delivery_status: string;
}

interface UniformStats {
  totalSales: number;
  pendingPayments: number;
  deliveredUniforms: number;
  pendingDeliveries: number;
}

interface Filters {
  status: string;
  dateFrom: string;
  dateTo: string;
  uniformType: string;
}

const UniformReports: React.FC = () => {
  const [uniformPayments, setUniformPayments] = useState<UniformPayment[]>([]);
  const [stats, setStats] = useState<UniformStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Obtener la fecha actual de Guatemala (GMT-6)
  const getGuatemalaDate = () => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
  };
  
  const today = getGuatemalaDate().toISOString().split('T')[0];
  
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    dateFrom: today,
    dateTo: today,
    uniformType: 'all'
  });

  useEffect(() => {
    fetchUniformData();
  }, [filters]);

  const fetchUniformData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUniformReports(filters);
      setUniformPayments(response.payments || []);
      setStats(response.stats || {
        totalSales: 0,
        pendingPayments: 0,
        deliveredUniforms: 0,
        pendingDeliveries: 0
      });
    } catch (error) {
      console.error('Error fetching uniform data:', error);
      setUniformPayments([]);
      setStats({
        totalSales: 0,
        pendingPayments: 0,
        deliveredUniforms: 0,
        pendingDeliveries: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      await apiService.exportUniformReportExcel(filters);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { color: string; text: string } } = {
      'paid': { color: 'success', text: 'Pagado' },
      'pending': { color: 'warning', text: 'Pendiente' },
      'overdue': { color: 'danger', text: 'Vencido' }
    };
    const badge = badges[status] || { color: 'secondary', text: status };
    return <span className={`badge bg-${badge.color}`}>{badge.text}</span>;
  };

  const getDeliveryBadge = (status: string) => {
    const badges: { [key: string]: { color: string; text: string } } = {
      'delivered': { color: 'success', text: 'Entregado' },
      'pending': { color: 'warning', text: 'Pendiente' },
      'processing': { color: 'info', text: 'En Proceso' }
    };
    const badge = badges[status] || { color: 'secondary', text: status };
    return <span className={`badge bg-${badge.color}`}>{badge.text}</span>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="uniform-reports">
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Filtros de Búsqueda</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <label className="form-label">Estado de Pago:</label>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">Todos</option>
                    <option value="paid">Pagado</option>
                    <option value="pending">Pendiente</option>
                    <option value="overdue">Vencido</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Desde:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Hasta:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Tipo de Uniforme:</label>
                  <select
                    className="form-select"
                    value={filters.uniformType}
                    onChange={(e) => setFilters({...filters, uniformType: e.target.value})}
                  >
                    <option value="all">Todos</option>
                    <option value="diario">Uniforme Diario</option>
                    <option value="deportivo">Uniforme Deportivo</option>
                    <option value="gala">Uniforme de Gala</option>
                  </select>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button className="btn btn-success me-2" onClick={handleExportExcel}>
                    <i className="bi bi-file-earmark-excel me-1"></i>
                    Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title">Ventas Totales</h6>
                    <h4>Q{stats.totalSales.toLocaleString()}</h4>
                  </div>
                  <i className="bi bi-cash-stack fs-1"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title">Pagos Pendientes</h6>
                    <h4>{stats.pendingPayments}</h4>
                  </div>
                  <i className="bi bi-clock fs-1"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title">Uniformes Entregados</h6>
                    <h4>{stats.deliveredUniforms}</h4>
                  </div>
                  <i className="bi bi-check-circle fs-1"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title">Entregas Pendientes</h6>
                    <h4>{stats.pendingDeliveries}</h4>
                  </div>
                  <i className="bi bi-truck fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de reportes */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Reporte de Uniformes</h5>
              <span className="badge bg-primary">{uniformPayments.length} registros</span>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Tipo de Uniforme</th>
                      <th>Talla</th>
                      <th>Cantidad</th>
                      <th>Precio Unitario</th>
                      <th>Total</th>
                      <th>Estado de Pago</th>
                      <th>Fecha de Pago</th>
                      <th>Estado de Entrega</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniformPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="fw-bold">{payment.student_name}</td>
                        <td>{payment.uniform_type}</td>
                        <td>
                          <span className="badge bg-secondary">{payment.size}</span>
                        </td>
                        <td className="text-center">{payment.quantity}</td>
                        <td>Q{payment.unit_price.toLocaleString()}</td>
                        <td className="fw-bold">Q{payment.total_amount.toLocaleString()}</td>
                        <td>{getStatusBadge(payment.payment_status)}</td>
                        <td>
                          {payment.payment_date ? 
                            new Date(payment.payment_date).toLocaleDateString() : 
                            '-'
                          }
                        </td>
                        <td>{getDeliveryBadge(payment.delivery_status)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" title="Ver detalles">
                              <i className="bi bi-eye"></i>
                            </button>
                            <button className="btn btn-outline-success" title="Editar">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-outline-info" title="Imprimir">
                              <i className="bi bi-printer"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {uniformPayments.length === 0 && (
                  <div className="text-center py-4">
                    <i className="bi bi-inbox fs-1 text-muted"></i>
                    <p className="text-muted mt-2">No se encontraron registros</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniformReports;