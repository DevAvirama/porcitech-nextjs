import { apiFetch } from './apiClient.js';

/**
 * Servicio para la gestión de animales en la API backend de PorciTech (FastAPI).
 */

/**
 * Obtiene la lista de animales aplicando filtros opcionales.
 * 
 * @param {object} [params={}] - Filtros de consulta.
 * @param {string} [params.search] - Término de búsqueda (arete, alias, raza).
 * @param {string} [params.corral_id] - UUID del corral.
 * @param {string} [params.estado] - Estado o fase del animal.
 * @returns {Promise<Array<object>>} Lista de animales retornada por la API.
 */
export async function getAnimales(params = {}) {
  const query = new URLSearchParams();

  if (params.search && params.search.trim()) {
    query.append('search', params.search.trim());
  }
  if (params.corral_id && params.corral_id !== 'all') {
    query.append('corral_id', params.corral_id);
  }
  if (params.estado && params.estado !== 'all') {
    query.append('estado', params.estado);
  }

  const queryString = query.toString();
  const endpoint = queryString ? `/animales?${queryString}` : '/animales';
  return await apiFetch(endpoint);
}

/**
 * Obtiene el detalle completo de un animal por su UUID.
 * 
 * @param {string} id - UUID del animal.
 * @returns {Promise<object>} Detalle del animal.
 */
export async function getAnimalById(id) {
  if (!id) throw new Error('Se requiere el ID del animal');
  return await apiFetch(`/animales/${id}`);
}

/**
 * Crea un nuevo registro de animal en la base de datos PostgreSQL.
 * 
 * @param {object} animalData - Datos del animal a registrar.
 * @param {string} animalData.codigo_arete - Código identificador único del arete.
 * @param {string} [animalData.codigo_qr] - Código QR único.
 * @param {string} [animalData.nombre_alias] - Nombre o apodo del cerdo.
 * @param {'macho' | 'hembra'} animalData.sexo - Sexo biológico del animal.
 * @param {string} animalData.raza - Raza del animal.
 * @param {string} animalData.fecha_nacimiento - Fecha de nacimiento (YYYY-MM-DD).
 * @param {string} [animalData.estado='activo'] - Estado o fase del animal.
 * @param {string | null} [animalData.corral_id] - UUID del corral asignado (opcional).
 * @param {number} [animalData.peso_actual_kg] - Peso inicial en kg (opcional).
 * @returns {Promise<object>} Animal creado en PostgreSQL.
 */
export async function createAnimal(animalData) {
  if (!animalData.codigo_arete) {
    throw new Error('El código de arete es obligatorio.');
  }
  if (!animalData.sexo || !['macho', 'hembra'].includes(animalData.sexo)) {
    throw new Error('El sexo debe ser "macho" o "hembra".');
  }

  // Si no se especificó código QR, autogenerar uno con base en el arete
  const payload = {
    ...animalData,
    codigo_qr: animalData.codigo_qr?.trim() || `QR-${animalData.codigo_arete.trim()}`,
    corral_id: animalData.corral_id && animalData.corral_id !== '' ? animalData.corral_id : null,
  };

  return await apiFetch('/animales', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Consulta pública o rápida de un animal mediante su código QR para trazabilidad en campo.
 * 
 * @param {string} codigoQr - Código QR grabado o generado.
 * @returns {Promise<object>} Ficha de trazabilidad del animal.
 */
export async function getAnimalByQr(codigoQr) {
  if (!codigoQr) throw new Error('Se requiere el código QR');
  return await apiFetch(`/animales/qr/${encodeURIComponent(codigoQr)}`);
}

/**
 * Actualiza los datos de un animal existente.
 * 
 * @param {string} id - UUID del animal.
 * @param {object} animalData - Campos a actualizar.
 * @returns {Promise<object>} Animal actualizado.
 */
export async function updateAnimal(id, animalData) {
  if (!id) throw new Error('Se requiere el ID del animal a actualizar');
  return await apiFetch(`/animales/${id}`, {
    method: 'PUT',
    body: animalData,
  });
}

/**
 * Elimina o desactiva un animal por su ID.
 * 
 * @param {string} id - UUID del animal.
 * @returns {Promise<any>}
 */
export async function deleteAnimal(id) {
  if (!id) throw new Error('Se requiere el ID del animal');
  return await apiFetch(`/animales/${id}`, {
    method: 'DELETE',
  });
}

const animalService = {
  getAnimales,
  getAnimalById,
  createAnimal,
  getAnimalByQr,
  updateAnimal,
  deleteAnimal,
};

export default animalService;
