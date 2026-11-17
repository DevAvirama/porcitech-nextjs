import { apiFetch } from './apiClient.js';

/**
 * Servicio para la gestión de corrales en la API backend de PorciTech (FastAPI).
 */

/**
 * Obtiene la lista de corrales.
 * @param {boolean} [soloActivos=true] - Filtrar únicamente corrales activos.
 * @returns {Promise<Array<{ id: string, codigo: string, descripcion: string, fase: string, capacidad_maxima: number, activo: boolean }>>}
 */
export async function getCorrales(soloActivos = true) {
  const query = soloActivos ? '?activo=true' : '';
  return await apiFetch(`/corrales${query}`);
}

/**
 * Obtiene el detalle de un corral específico por su UUID.
 * @param {string} id - UUID del corral.
 * @returns {Promise<{ id: string, codigo: string, descripcion: string, fase: string, capacidad_maxima: number, activo: boolean }>}
 */
export async function getCorralById(id) {
  if (!id) throw new Error('Se requiere el ID del corral');
  return await apiFetch(`/corrales/${id}`);
}

/**
 * Crea un nuevo corral en el sistema.
 * Endpoint: POST /api/v1/corrales
 * @param {object} corralData
 * @param {string} corralData.codigo
 * @param {string} [corralData.descripcion]
 * @param {string} corralData.fase
 * @param {number} corralData.capacidad_maxima
 * @param {string} [corralData.fecha_inicio]
 * @param {boolean} [corralData.activo=true]
 * @returns {Promise<object>}
 */
export async function createCorral(corralData) {
  if (!corralData.codigo || !corralData.fase || !corralData.capacidad_maxima) {
    throw new Error('Código, fase y capacidad máxima son obligatorios');
  }
  return await apiFetch('/corrales', {
    method: 'POST',
    body: corralData,
  });
}

/**
 * Actualiza las propiedades de un corral existente.
 * Endpoint: PUT /api/v1/corrales/{id}
 * @param {string} id - UUID del corral
 * @param {object} corralData - Datos a actualizar
 * @returns {Promise<object>}
 */
export async function updateCorral(id, corralData) {
  if (!id) throw new Error('Se requiere el ID del corral a actualizar');
  return await apiFetch(`/corrales/${id}`, {
    method: 'PUT',
    body: corralData,
  });
}

/**
 * Elimina o desactiva (soft-delete) un corral.
 * Endpoint: DELETE /api/v1/corrales/{id}
 * @param {string} id - UUID del corral
 * @returns {Promise<{ message: string }>}
 */
export async function deleteCorral(id) {
  if (!id) throw new Error('Se requiere el ID del corral a eliminar');
  return await apiFetch(`/corrales/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Consulta la auditoría de vacíos sanitarios Todo Adentro / Todo Afuera (HU38).
 */
export async function getSanitaryRestAudit(params = {}) {
  const query = new URLSearchParams();
  if (params.corral_id) query.append('corral_id', params.corral_id);
  if (params.fecha_inicio) query.append('fecha_inicio', params.fecha_inicio);
  if (params.fecha_fin) query.append('fecha_fin', params.fecha_fin);
  if (params.solo_alertas) query.append('solo_alertas', 'true');
  const qs = query.toString();
  return await apiFetch(qs ? `/corrales/auditoria-vacios?${qs}` : '/corrales/auditoria-vacios');
}

/**
 * Registra un ciclo sanitario (entrada/salida de lote) en un corral (HU38).
 */
export async function createCorralCycle(corralId, data) {
  if (!corralId) throw new Error('Se requiere el ID del corral');
  return await apiFetch(`/corrales/${corralId}/ciclos`, {
    method: 'POST',
    body: data,
  });
}

/**
 * Actualiza fecha de salida o verificación de desinfección de un ciclo sanitario (HU38).
 */
export async function updateCorralCycle(cicloId, data) {
  if (!cicloId) throw new Error('Se requiere el ID del ciclo sanitario');
  return await apiFetch(`/corrales/ciclos/${cicloId}`, {
    method: 'PUT',
    body: data,
  });
}

const corralService = {
  getCorrales,
  getCorralById,
  createCorral,
  updateCorral,
  deleteCorral,
  getSanitaryRestAudit,
  createCorralCycle,
  updateCorralCycle,
};

export default corralService;
