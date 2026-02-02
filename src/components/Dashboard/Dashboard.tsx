import React, { useState, useEffect, useCallback } from 'react';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { apiService } from '../../services/apiService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Dashboard.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface DashboardData {
  incomeByDay: Array<{dia: string, total_ingresos: number}>;
  incomeByMonth: Array<{mes: string, total_ingresos: number}>;
  incomeByType: Array<{tipo_pago: string, total_ingresos: number}>;
  studentsByType: Array<{tipo_estudiante: string, total: number}>;
  pendingPayments: Array<{estudiante: string, tipo_pago: string, monto_pendiente: number}>;
  totalMora: number;
  incomeByPaymentMethod: Array<{metodo_pago: string, total_ingresos: number}>;
  monthlyIncome: number;
  dailyIncome: number;
  rangeIncome: number; // Nueva propiedad para ingresos del rango seleccionado
  currentMonthIncome: number; // Nueva propiedad para ingresos del mes actual completo
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Obtener la fecha actual y la fecha de ayer en Guatemala (GMT-6)
  const getGuatemalaDate = () => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
  };
  
  const today = getGuatemalaDate();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: yesterdayStr,  // Día anterior
    end: todayStr         // Día actual
  });
  
  const [useSingleDate, setUseSingleDate] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Cargando datos con rango:', selectedDateRange); // Debug
      const dashboardData = await apiService.getDashboardData(selectedDateRange);
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Mostrar error al usuario
      alert('Error al cargar los datos del dashboard. Verifica que el backend esté ejecutándose en el puerto 3000.');
    } finally {
      setLoading(false);
    }
  }, [selectedDateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const generatePDFReport = async () => {
    try {
      setGeneratingReport(true);
      
      // Obtener datos detallados del backend
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backgeneralsistemaceti.onrender.com/api';
      const response = await fetch(`${API_BASE_URL}/dashboard/detailed-report?start=${selectedDateRange.start}&end=${selectedDateRange.end}`);
      const reportData = await response.json();

      // Crear documento PDF
      const doc = new jsPDF();
      
      // Título del reporte
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE INGRESOS', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Período: ${selectedDateRange.start} al ${selectedDateRange.end}`, 105, 30, { align: 'center' });
      
      let yPosition = 50;

      // Resumen de ingresos totales
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN DE INGRESOS', 14, yPosition);
      yPosition += 10;

      // Tabla de resumen por tipo de pago
      const summaryData = reportData.summary.map((item: any) => [
        item.tipo_pago,
        item.cantidad_pagos.toString(),
        `Q${item.total_ingresos.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Tipo de Pago', 'Cantidad', 'Total Ingresos']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { left: 14, right: 14 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;

      // Total general
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(46, 204, 113);
      doc.rect(14, yPosition - 5, 182, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(`TOTAL GENERAL: Q${reportData.totalGeneral.toLocaleString()}`, 105, yPosition, { align: 'center' });
      
      // Pie de página
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generado: ${new Date().toLocaleString('es-GT')}`, 105, 285, { align: 'center' });
      doc.text('Página 1 de 1', 105, 290, { align: 'center' });

      // ====== ELIMINADO TODO EL CÓDIGO DE DETALLES ======
      // Solo mostrar resumen, sin páginas de detalle

      // Guardar PDF
      doc.save(`Reporte_Ingresos_${selectedDateRange.start}_${selectedDateRange.end}.pdf`);
      
      alert('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte. Verifica que el backend esté ejecutándose.');
    } finally {
      setGeneratingReport(false);
    }
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

  if (!data) {
    return <div className="alert alert-danger">Error al cargar los datos del dashboard</div>;
  }

  // Configuraciones de gráficos
  const incomeByTypeChart = {
    labels: data.incomeByType.map(item => item.tipo_pago),
    datasets: [
      {
        label: 'Ingresos por Tipo',
        data: data.incomeByType.map(item => item.total_ingresos),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#E7E9ED',
          '#C9CBCF',
          '#FF6B9D',
          '#4D5360'
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#E7E9ED',
          '#C9CBCF',
          '#FF6B9D',
          '#4D5360'
        ],
        borderWidth: 2,
      },
    ],
  };

  const incomeByMonthChart = {
    labels: data.incomeByMonth.slice(0, 12).reverse().map(item => {
      const [year, month] = item.mes.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                         'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }),
    datasets: [
      {
        label: 'Ingresos Mensuales',
        data: data.incomeByMonth.slice(0, 12).reverse().map(item => item.total_ingresos),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const studentsByTypeChart = {
    labels: data.studentsByType.map(item => item.tipo_estudiante),
    datasets: [
      {
        label: 'Estudiantes por Tipo',
        data: data.studentsByType.map(item => item.total),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        borderWidth: 1,
      },
    ],
  };

  const paymentMethodChart = {
    labels: data.incomeByPaymentMethod.map(item => item.metodo_pago),
    datasets: [
      {
        label: 'Ingresos por Método de Pago',
        data: data.incomeByPaymentMethod.map(item => item.total_ingresos),
        backgroundColor: data.incomeByPaymentMethod.map(item => {
          const metodo = item.metodo_pago.toLowerCase();
          if (metodo.includes('efectivo')) return '#A8E063'; // Verde limón
          if (metodo.includes('transferencia')) return '#56CCF2'; // Celeste
          return '#4BC0C0'; // Color por defecto
        }),
        borderColor: data.incomeByPaymentMethod.map(item => {
          const metodo = item.metodo_pago.toLowerCase();
          if (metodo.includes('efectivo')) return '#7CB342'; // Verde limón oscuro
          if (metodo.includes('transferencia')) return '#2196F3'; // Celeste oscuro
          return '#36A2EB'; // Color por defecto
        }),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || context.parsed || 0;
            return `${label}: Q${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return 'Q' + value.toLocaleString();
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Q${context.parsed.y.toLocaleString()}`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#444',
        anchor: 'end' as const,
        align: 'top' as const,
        formatter: (value: number) => `Q${value.toLocaleString()}`,
        font: {
          weight: 'bold' as const,
          size: 12
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return 'Q' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Filtro de Fechas</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-12 mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="singleDateCheck"
                      checked={useSingleDate}
                      onChange={(e) => {
                        setUseSingleDate(e.target.checked);
                        if (e.target.checked) {
                          // Si se activa, igualar ambas fechas
                          setSelectedDateRange({...selectedDateRange, end: selectedDateRange.start});
                        }
                      }}
                    />
                    <label className="form-check-label" htmlFor="singleDateCheck">
                      Buscar por una sola fecha
                    </label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label">{useSingleDate ? 'Fecha:' : 'Fecha Inicio:'}</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDateRange.start}
                    onChange={(e) => {
                      if (useSingleDate) {
                        // Si está activado el modo una sola fecha, actualizar ambas
                        setSelectedDateRange({start: e.target.value, end: e.target.value});
                      } else {
                        setSelectedDateRange({...selectedDateRange, start: e.target.value});
                      }
                    }}
                  />
                </div>
                {!useSingleDate && (
                  <div className="col-md-4">
                    <label className="form-label">Fecha Fin:</label>
                    <input
                      type="date"
                      className="form-control"
                      value={selectedDateRange.end}
                      onChange={(e) => setSelectedDateRange({...selectedDateRange, end: e.target.value})}
                    />
                  </div>
                )}
                <div className={`col-md-${useSingleDate ? '8' : '4'} d-flex align-items-end`}>
                  <button 
                    className="btn btn-success me-2" 
                    onClick={generatePDFReport}
                    disabled={generatingReport}
                  >
                    <i className="bi bi-file-earmark-pdf me-2"></i>
                    {generatingReport ? 'Generando...' : 'Generar Reporte'}
                  </button>
                  <button className="btn btn-primary" onClick={fetchDashboardData}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="row mb-4">
        <div className="col-md-2">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title" style={{fontSize: '0.9rem'}}>Ingresos del Mes</h6>
                  <h4>Q{data.currentMonthIncome?.toLocaleString() || '0'}</h4>
                </div>
                <i className="bi bi-calendar-month fs-1"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title" style={{fontSize: '0.9rem'}}>Total Estudiantes</h6>
                  <h4>{data.studentsByType.reduce((sum, item) => sum + item.total, 0)}</h4>
                </div>
                <i className="bi bi-people fs-1"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title" style={{fontSize: '0.9rem'}}>
                    {useSingleDate ? 'Ingresos del Día' : 'Ingresos del Día (Inicio)'}
                  </h6>
                  <h4>Q{data.dailyIncome?.toLocaleString() || '0'}</h4>
                </div>
                <i className="bi bi-calendar-check fs-1"></i>
              </div>
            </div>
          </div>
        </div>
        {!useSingleDate && (
          <div className="col-md-2">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title" style={{fontSize: '0.9rem'}}>Ingresos del Rango</h6>
                    <h4>Q{data.rangeIncome?.toLocaleString() || '0'}</h4>
                  </div>
                  <i className="bi bi-calendar-range fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className={`col-md-${useSingleDate ? '4' : '2'}`}>
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title" style={{fontSize: '0.9rem'}}>Total Mora</h6>
                  <h4>Q{data.totalMora?.toLocaleString() || '0'}</h4>
                </div>
                <i className="bi bi-clock fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Ingresos por Mes</h5>
            </div>
            <div className="card-body">
              <Line data={incomeByMonthChart} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Estudiantes por Tipo</h5>
            </div>
            <div className="card-body">
              <Pie data={studentsByTypeChart} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Ingresos por Tipo de Pago</h5>
            </div>
            <div className="card-body">
              <Bar data={incomeByTypeChart} options={barChartOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Ingresos por Método de Pago</h5>
            </div>
            <div className="card-body">
              <Bar data={paymentMethodChart} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de pagos pendientes */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Pagos Pendientes</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Tipo de Pago</th>
                      <th>Monto Pendiente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pendingPayments.slice(0, 10).map((payment, index) => (
                      <tr key={index}>
                        <td>{payment.estudiante}</td>
                        <td>{payment.tipo_pago}</td>
                        <td className="text-danger fw-bold">
                          Q{payment.monto_pendiente.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;