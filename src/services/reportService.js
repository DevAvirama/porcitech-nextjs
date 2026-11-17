import { getApiBaseUrl } from './apiClient.js';

/**
 * Convierte los códigos de rango temporal del módulo Reportes a fechas YYYY-MM-DD.
 */
export function resolveReportDateBounds(dateRange = '30dias') {
  if (dateRange === 'historico') {
    return { fecha_inicio: null, fecha_fin: null };
  }
  const today = new Date();
  const daysMap = {
    '7dias': 7,
    '30dias': 30,
    trimestre: 90,
  };
  const days = daysMap[dateRange] ?? 30;
  const start = new Date(today);
  start.setDate(today.getDate() - days);

  const fmt = (d) => d.toISOString().split('T')[0];
  return {
    fecha_inicio: fmt(start),
    fecha_fin: fmt(today),
  };
}

/**
 * Descarga un archivo binario oficial (.xlsx o .pdf) desde GET /api/v1/reportes/exportar (HU39).
 */
export async function downloadOfficialReport({
  formato = 'xlsx',
  tipo = 'consolidado',
  fecha_inicio = null,
  fecha_fin = null,
  corral_id = null,
} = {}) {
  const query = new URLSearchParams();
  query.append('formato', formato);
  query.append('tipo', tipo);
  if (fecha_inicio) query.append('fecha_inicio', fecha_inicio);
  if (fecha_fin) query.append('fecha_fin', fecha_fin);
  if (corral_id && corral_id !== 'todos' && corral_id !== 'all') {
    query.append('corral_id', corral_id);
  }

  const base = getApiBaseUrl().replace(/\/+$/, '');
  const url = `${base}/reportes/exportar?${query.toString()}`;

  const headers = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('porcitech_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { method: 'GET', headers });
  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(errText || `Error ${response.status} al exportar el reporte`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] || `porcitech_reporte_${tipo}.${formato}`;

  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);

  return filename;
}
