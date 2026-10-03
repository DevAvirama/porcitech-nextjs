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

const corralService = {
  getCorrales,
  getCorralById,
};

export default corralService;
