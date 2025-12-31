# Panel Administrativo - Sistema de Estudiantes

Panel administrativo desarrollado en React con Bootstrap para el sistema de gestión de estudiantes RegEstudiantes.

## 🚀 Pasos para Ejecutar el Proyecto

### 1. Configurar Backend
```bash
cd ../RegEstudiantes
npm install
```

### 2. Ejecutar Funciones SQL en Supabase
Abre Supabase SQL Editor y ejecuta el archivo `sql-functions.sql`

### 3. Iniciar Backend
```bash
cd ../RegEstudiantes
npm run dev
```

### 4. Configurar Frontend
```bash
cd admin-panel
npm install
npm start
```

## 📊 Características

- **Dashboard con Gráficos**: Visualización de ingresos y estudiantes
- **Reportes de Uniformes**: Gestión completa de ventas de uniformes
- **Responsive**: Adaptado para desktop y móvil
- **Exportación Excel**: Reportes exportables
- **Tiempo Real**: Datos actualizados desde la base de datos

## 🎯 Funcionalidades Implementadas

### Dashboard Principal
✅ Ingresos por Día  
✅ Ingresos por Mes  
✅ Ingresos por Tipo de Pago  
✅ Total de Estudiantes por Tipo  
✅ Estudiantes con Pagos Pendientes  
✅ Total de Mora cobrada  
✅ Ingresos por Métodos de Pago  

### Reportes de Uniformes
✅ Filtros por estado, fecha y tipo  
✅ Estadísticas de ventas  
✅ Exportación a Excel  
✅ Tabla detallada con acciones

## 🛠️ Tecnologías
- React 18 + TypeScript
- Bootstrap 5
- Chart.js para gráficos
- Axios para API
- XLSX para Excel