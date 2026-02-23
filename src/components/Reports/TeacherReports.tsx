import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JSZip from 'jszip';
import './TeacherReports.css';

interface Teacher {
  id: string;
  nombre: string;
  jornada: string;
  estado: string;
}

interface ReportData {
  asistencias: Array<{
    fecha: string;
    hora_entrada: string;
  }>;
  resumen: {
    total_dias: number;
  };
}

interface DateRange {
  inicio: string;
  fin: string;
}

interface Filters {
  jornada: string;
  modalidad: 'todos' | 'por_jornada';
}

interface Progress {
  actual: number;
  total: number;
}

const TeacherReports: React.FC = () => {
  const getGuatemalaDate = () => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
  };

  const guatemalaDate = getGuatemalaDate();
  const [rangoFechas, setRangoFechas] = useState<DateRange>({
    inicio: new Date(guatemalaDate.getFullYear(), guatemalaDate.getMonth(), 1).toISOString().split('T')[0],
    fin: guatemalaDate.toISOString().split('T')[0]
  });

  const [filtros, setFiltros] = useState<Filters>({
    jornada: '',
    modalidad: 'todos'
  });

  const [docentes, setDocentes] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [progreso, setProgreso] = useState<Progress>({ actual: 0, total: 0 });

  useEffect(() => {
    cargarDocentes();
  }, []);

  const cargarDocentes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTeachers();
      const data = response.docentes || [];
      
      const docentesActivos = data.filter((doc: Teacher) => doc.estado === 'Activo');
      
      setDocentes(docentesActivos);
    } catch (error) {
      console.error('Error al cargar docentes:', error);
      alert('Error al cargar docentes');
    } finally {
      setLoading(false);
    }
  };

  const jornadas = Array.from(new Set(docentes.map(d => d.jornada))).filter(Boolean).sort();

  const docentesFiltrados = docentes.filter(doc => {
    if (filtros.modalidad === 'por_jornada' && filtros.jornada) {
      return doc.jornada === filtros.jornada;
    }
    return true;
  });

  const generarPDFIndividual = async (docente: Teacher, reporteData: ReportData) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Asistencias - Docente', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Control Académico', 105, 25, { align: 'center' });

    // Información del docente
    let y = 45;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Docente', 14, y);

    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${docente.nombre}`, 14, y);
    y += 6;
    doc.text(`Jornada: ${docente.jornada || 'N/A'}`, 14, y);
    y += 6;
    doc.text(`Estado: ${docente.estado || 'N/A'}`, 14, y);

    // Período del reporte
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Período del Reporte', 14, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Desde: ${rangoFechas.inicio}`, 14, y);
    y += 6;
    doc.text(`Hasta: ${rangoFechas.fin}`, 14, y);

    // Tabla de asistencias
    y += 10;
    const asistencias = reporteData.asistencias || [];
    
    if (asistencias.length > 0) {
      const tableData = asistencias.map(asist => [
        asist.fecha,
        asist.hora_entrada || 'N/A'
      ]);

      (doc as any).autoTable({
        startY: y,
        head: [['Fecha', 'Hora de Entrada']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { halign: 'center' },
          1: { halign: 'center' }
        }
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('No hay registros de asistencia en el período seleccionado', 14, y);
      y += 10;
    }

    // Resumen
    y += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen', 14, y);
    
    y += 8;
    const resumenData = [
      ['Total de días asistidos', `${reporteData.resumen?.total_dias || 0}`]
    ];

    (doc as any).autoTable({
      startY: y,
      head: [['Concepto', 'Valor']],
      body: resumenData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      }
    });

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(128);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        `Generado: ${new Date().toLocaleDateString('es-GT')}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    return doc;
  };

  const generarReportesMasivos = async () => {
    if (docentesFiltrados.length === 0) {
      alert('No hay docentes para generar reportes');
      return;
    }

    if (!rangoFechas.inicio || !rangoFechas.fin) {
      alert('Debe seleccionar un rango de fechas');
      return;
    }

    setGenerando(true);
    setProgreso({ actual: 0, total: docentesFiltrados.length });

    try {
      const zip = new JSZip();
      let exitosos = 0;
      let fallidos = 0;

      const docentesPorJornada: { [key: string]: Teacher[] } = {};
      docentesFiltrados.forEach(doc => {
        const jornada = doc.jornada || 'Sin Jornada';
        if (!docentesPorJornada[jornada]) {
          docentesPorJornada[jornada] = [];
        }
        docentesPorJornada[jornada].push(doc);
      });

      for (const [jornada, docentesJornada] of Object.entries(docentesPorJornada)) {
        const carpetaJornada = zip.folder(jornada);

        for (const docente of docentesJornada) {
          try {
            setProgreso(prev => ({ ...prev, actual: prev.actual + 1 }));

            const response = await apiService.getTeacherReport(docente.id, {
              fecha_inicio: rangoFechas.inicio,
              fecha_fin: rangoFechas.fin
            });

            const pdf = await generarPDFIndividual(docente, response);
            const pdfBlob = pdf.output('blob');

            const nombreArchivo = `${docente.nombre.replace(/[^a-zA-Z0-9\s]/g, '')}.pdf`;
            carpetaJornada?.file(nombreArchivo, pdfBlob);

            exitosos++;
          } catch (error) {
            console.error(`Error al generar PDF para ${docente.nombre}:`, error);
            fallidos++;
          }
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reportes_Docentes_${rangoFechas.inicio}_a_${rangoFechas.fin}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(`Reportes generados: ${exitosos} exitosos${fallidos > 0 ? `, ${fallidos} fallidos` : ''}`);
    } catch (error) {
      console.error('Error al generar reportes masivos:', error);
      alert('Error al generar reportes masivos');
    } finally {
      setGenerando(false);
      setProgreso({ actual: 0, total: 0 });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando docentes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-reports-container">
      {/* Header */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h1 className="h3 mb-2 fw-bold text-primary">
            <i className="bi bi-person-video3 me-2"></i>
            Reportes Masivos - Docentes
          </h1>
          <p className="text-muted mb-0">
            Genera reportes de asistencia para múltiples docentes en un solo archivo
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h2 className="h5 mb-4 fw-bold">Configuración de Reportes</h2>
          
          {/* Rango de fechas */}
          <div className="row mb-3">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Fecha Inicio</label>
              <input
                type="date"
                value={rangoFechas.inicio}
                onChange={(e) => setRangoFechas({...rangoFechas, inicio: e.target.value})}
                className="form-control"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Fecha Fin</label>
              <input
                type="date"
                value={rangoFechas.fin}
                onChange={(e) => setRangoFechas({...rangoFechas, fin: e.target.value})}
                className="form-control"
              />
            </div>
          </div>

          {/* Modalidad de generación */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Generar reportes para:</label>
            <select
              value={filtros.modalidad}
              onChange={(e) => setFiltros({...filtros, modalidad: e.target.value as 'todos' | 'por_jornada', jornada: ''})}
              className="form-select"
            >
              <option value="todos">Todos los docentes</option>
              <option value="por_jornada">Por jornada específica</option>
            </select>
          </div>

          {/* Filtro de jornada */}
          {filtros.modalidad === 'por_jornada' && (
            <div className="mb-3">
              <label className="form-label fw-semibold">Seleccionar Jornada</label>
              <select
                value={filtros.jornada}
                onChange={(e) => setFiltros({...filtros, jornada: e.target.value})}
                className="form-select"
              >
                <option value="">Seleccione una jornada</option>
                {jornadas.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
          )}

          {/* Información de reportes a generar */}
          <div className="alert alert-info">
            <i className="bi bi-bar-chart-fill me-2"></i>
            Se generarán <strong>{docentesFiltrados.length}</strong> reportes
            <br />
            <small className="text-muted">Los reportes se organizarán en carpetas por jornada</small>
          </div>
        </div>
      </div>

      {/* Botón de generación */}
      <div className="card shadow-sm">
        <div className="card-body">
          <button
            onClick={generarReportesMasivos}
            disabled={generando || docentesFiltrados.length === 0}
            className={`btn w-100 btn-lg ${
              generando || docentesFiltrados.length === 0
                ? 'btn-secondary'
                : 'btn-primary'
            }`}
          >
            {generando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generando {progreso.actual} de {progreso.total}...
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-arrow-down me-2"></i>
                Generar Reportes Masivos
              </>
            )}
          </button>

          {generando && (
            <div className="mt-3">
              <div className="progress">
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: `${(progreso.actual / progreso.total) * 100}%` }}
                  aria-valuenow={(progreso.actual / progreso.total) * 100}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {Math.round((progreso.actual / progreso.total) * 100)}%
                </div>
              </div>
              <p className="text-center text-muted mt-2 mb-0">
                {Math.round((progreso.actual / progreso.total) * 100)}% completado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherReports;
