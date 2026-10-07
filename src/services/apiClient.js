/**
 * Resuelve dinámicamente la URL base de la API backend de PorciTech.
 * En el cliente, si se accede por IP de red (ej: 192.168.32.134), apunta al mismo host en el puerto 8000.
 */
export const getApiBaseUrl = () => {
  // En el navegador (cliente), apuntar dinámicamente al mismo host/IP que abrió la página pero en el puerto 8000
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname) {
      return `http://${hostname}:8000/api/v1`;
    }
  }
  // Si hay una variable explícita definida en build time que no sea localhost, usarla
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Fallback para ejecución en servidor (SSR/Next.js interno)
  return process.env.INTERNAL_API_URL || "http://127.0.0.1:8000/api/v1";
};

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Cliente HTTP centralizado para comunicación con la API backend de PorciTech (FastAPI).
 * 
 * @param {string} endpoint - Ruta relativa (e.g. '/auth/login') o URL absoluta.
 * @param {RequestInit & { body?: any }} options - Opciones de configuración de fetch.
 * @returns {Promise<any>} Datos parseados de la respuesta.
 */
export async function apiFetch(endpoint, options = {}) {
  const { headers = {}, body, ...restOptions } = options;

  const configHeaders = { ...headers };

  // Interceptar peticiones y añadir Bearer token si existe en localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('porcitech_token');
    if (token && !configHeaders.Authorization && !configHeaders.authorization) {
      configHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Manejo de Content-Type y serialización del body
  let processedBody = body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (!isFormData) {
    if (!configHeaders['Content-Type'] && !configHeaders['content-type']) {
      configHeaders['Content-Type'] = 'application/json';
    }
    // Serializar body si es un objeto JS plano
    if (
      body !== undefined &&
      body !== null &&
      typeof body === 'object' &&
      !(body instanceof Blob) &&
      !(body instanceof ArrayBuffer)
    ) {
      processedBody = JSON.stringify(body);
    }
  }

  // Construir la URL completa asegurando formato limpio y host dinámico
  const base = getApiBaseUrl();
  const cleanBase = base.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${cleanBase}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...restOptions,
    headers: configHeaders,
    body: processedBody,
  });

  // Manejo de 401 Unauthorized: limpiar credenciales y redirigir
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('porcitech_token');
      localStorage.removeItem('porcitech_user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'porcitech_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      if (window.location.pathname !== '/login') {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/login';
      }
    }
  }

  // Manejo de errores HTTP (!res.ok)
  if (!response.ok) {
    let errorDetail = `Error ${response.status}: ${response.statusText || 'Error en la petición'}`;

    try {
      const errorData = await response.json();
      if (errorData) {
        if (typeof errorData.detail === 'string') {
          errorDetail = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // Formateo de errores de validación estructurados de FastAPI / Pydantic
          errorDetail = errorData.detail
            .map((item) => (item.msg ? `${item.loc?.slice(-1)[0] || 'Campo'}: ${item.msg}` : JSON.stringify(item)))
            .join(' | ');
        } else if (errorData.message) {
          errorDetail = errorData.message;
        } else if (typeof errorData === 'string') {
          errorDetail = errorData;
        }
      }
    } catch {
      try {
        const textData = await response.text();
        if (textData) {
          errorDetail = textData;
        }
      } catch {
        // En caso de que no se pueda leer el cuerpo, mantener el mensaje predeterminado
      }
    }

    const error = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }

  // Si la respuesta es 204 No Content
  if (response.status === 204) {
    return null;
  }

  // Parsear JSON o fallback a texto según el Content-Type de respuesta
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  return await response.text();
}

export default apiFetch;
