import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backgeneralsistemaceti.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Autenticación
export const login = (data: { username: string; password: string }) => {
  return axiosInstance.post('/auth/login', data);
};

export const verificarSesion = (userId: string) => {
  return axiosInstance.post('/auth/verificar', { userId });
};

export const apiService = {
  // Dashboard endpoints
  getDashboardData: async (dateRange?: { start: string; end: string }) => {
    try {
      const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
      const response = await axiosInstance.get(`/dashboard${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getIncomeByDay: async () => {
    const response = await axiosInstance.get('/dashboard/income-by-day');
    return response.data;
  },

  getIncomeByMonth: async () => {
    const response = await axiosInstance.get('/dashboard/income-by-month');
    return response.data;
  },

  getIncomeByType: async () => {
    const response = await axiosInstance.get('/dashboard/income-by-type');
    return response.data;
  },

  getStudentsByType: async () => {
    const response = await axiosInstance.get('/dashboard/students-by-type');
    return response.data;
  },

  getPendingPayments: async () => {
    const response = await axiosInstance.get('/dashboard/pending-payments');
    return response.data;
  },

  getTotalMora: async () => {
    const response = await axiosInstance.get('/dashboard/total-mora');
    return response.data;
  },

  getIncomeByPaymentMethod: async () => {
    const response = await axiosInstance.get('/dashboard/income-by-payment-method');
    return response.data;
  },

  getMonthlyIncome: async (year: number, month: number) => {
    const response = await axiosInstance.get(`/dashboard/monthly-income?year=${year}&month=${month}`);
    return response.data;
  },

  // Uniform reports endpoints
  getUniformReports: async (filters: any) => {
    const params = new URLSearchParams();
    
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.uniformType !== 'all') params.append('uniformType', filters.uniformType);

    const response = await axiosInstance.get(`/uniformes/reports?${params}`);
    return response.data;
  },

  exportUniformReportExcel: async (filters: any) => {
    const params = new URLSearchParams();
    
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.uniformType !== 'all') params.append('uniformType', filters.uniformType);

    const response = await axiosInstance.get(`/uniformes/export-excel?${params}`, {
      responseType: 'blob'
    });
    
    // Crear y descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte-uniformes-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Uniform inventory endpoint
  getUniformInventory: async () => {
    const response = await axiosInstance.get('/uniformes/inventario-tallas');
    return response.data;
  },

  // Teacher (Docentes) endpoints
  getTeachers: async (params?: any) => {
    const response = await axiosInstance.get('/docentes', { params });
    return response.data;
  },

  getTeacherReport: async (id: string, params: { fecha_inicio: string; fecha_fin: string }) => {
    const response = await axiosInstance.get(`/asistencias-docentes/docente/${id}`, { params });
    return response.data;
  },
};

export default apiService;