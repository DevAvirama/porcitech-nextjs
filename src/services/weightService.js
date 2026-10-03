import { apiFetch } from './apiClient.js';

/**
 * Servicio para la gestión de pesajes, analítica de series temporales (TimescaleDB)
 * e inferencia de visión artificial (YOLO + OpenCV en microservicio Docker).
 */

/**
 * Envía una imagen dorsal a la API de visión artificial para estimación morfométrica y de peso.
 * Endpoint: POST /api/v1/vision/estimate-weight (multipart/form-data)
 *
 * @param {object} params
 * @param {File | Blob} params.imageFile - Archivo binario de imagen (JPEG/PNG).
 * @param {string} params.animalId - UUID del cerdo seleccionado.
 * @param {string} params.corralId - UUID del corral donde se ubica el animal.
 * @param {boolean} [params.persist=true] - Si es true, persiste el pesaje en TimescaleDB y actualiza animales.
 * @returns {Promise<{
 *   detectado: boolean,
 *   mensaje?: string,
 *   confianza?: number,
 *   peso_estimado_kg?: number,
 *   area_cm2?: number,
 *   largo_cm?: number,
 *   ancho_cm?: number,
 *   bbox?: { x_min: number, y_min: number, x_max: number, y_max: number },
 *   id_registro_persistido?: string,
 *   tiempo_registro?: string
 * }>}
 */
export async function estimateWeightWithAI({ imageFile, animalId, corralId, persist = true }) {
  if (!imageFile) {
    throw new Error('Se requiere un archivo de imagen para la estimación biométrica.');
  }
  if (!animalId) {
    throw new Error('Debes seleccionar el cerdo para asociar el pesaje.');
  }
  if (!corralId) {
    throw new Error('Debes seleccionar el corral de procedencia del ejemplar.');
  }

  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('id_cerdo', animalId);
  formData.append('corral_id', corralId);
  formData.append('persistir', String(persist));

  return await apiFetch('/vision/estimate-weight', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Obtiene la serie temporal de Ganancia Media Diaria (GMD) agregada por corral desde TimescaleDB.
 * Endpoint: GET /api/v1/pesajes/corral/{corral_id}/gmd?limite={limite}
 *
 * @param {string} corralId - UUID del corral a consultar.
 * @param {number} [limite=30] - Número máximo de registros o días cronológicos.
 * @returns {Promise<Array<{
 *   fecha: string,
 *   peso_promedio_kg: number,
 *   gmd_kg: number,
 *   variacion_porcentual?: number
 * }>>}
 */
export async function getCorralGMD(corralId, limite = 30) {
  if (!corralId) throw new Error('Se requiere el ID del corral.');
  return await apiFetch(`/pesajes/corral/${corralId}/gmd?limite=${limite}`);
}

/**
 * Obtiene el historial cronológico completo de pesajes de un cerdo individual.
 * Endpoint: GET /api/v1/pesajes/animal/{animal_id}
 *
 * @param {string} animalId - UUID del cerdo.
 * @returns {Promise<Array<{
 *   id: string,
 *   id_cerdo: string,
 *   corral_id?: string,
 *   peso_kg: number,
 *   tiempo: string,
 *   metodo?: 'ia_vision' | 'manual_bascula',
 *   confianza?: number,
 *   observaciones?: string
 * }>>}
 */
export async function getAnimalWeightHistory(animalId) {
  if (!animalId) throw new Error('Se requiere el ID del animal.');
  return await apiFetch(`/pesajes/animal/${animalId}`);
}

/**
 * Registra un pesaje manual de báscula física en la hipertabla de TimescaleDB.
 * Endpoint: POST /api/v1/pesajes/manual
 *
 * @param {object} data
 * @param {string} data.id_cerdo - UUID del cerdo.
 * @param {string} [data.corral_id] - UUID del corral.
 * @param {number} data.peso_kg - Peso registrado en báscula.
 * @param {string} [data.tiempo] - Marca temporal en formato ISO8601.
 * @param {string} [data.observaciones] - Comentarios zootécnicos adicionales.
 * @returns {Promise<object>} Registro insertado en la base de datos.
 */
export async function registerManualWeight(data) {
  if (!data.id_cerdo) {
    throw new Error('Se requiere seleccionar el cerdo.');
  }
  const peso = parseFloat(data.peso_kg);
  if (isNaN(peso) || peso <= 0) {
    throw new Error('El peso debe ser un número positivo mayor a 0 kg.');
  }

  const payload = {
    id_cerdo: data.id_cerdo,
    corral_id: data.corral_id && data.corral_id !== '' ? data.corral_id : null,
    peso_kg: peso,
    tiempo: data.tiempo || new Date().toISOString(),
    observaciones: data.observaciones || null,
  };

  return await apiFetch('/pesajes/manual', {
    method: 'POST',
    body: payload,
  });
}

const weightService = {
  estimateWeightWithAI,
  getCorralGMD,
  getAnimalWeightHistory,
  registerManualWeight,
};

export default weightService;
