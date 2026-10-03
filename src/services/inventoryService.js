import { apiFetch } from './apiClient.js';

/**
 * Servicio para la gestión de inventario y bodega en la API backend de PorciTech (FastAPI).
 */

/**
 * Obtiene la lista de categorías de inventario disponibles.
 * Endpoint: GET /api/v1/inventario/categorias
 * 
 * @returns {Promise<Array<{
 *   id: string,
 *   codigo: string,
 *   nombre: string,
 *   color: string,
 *   descripcion: string
 * }>>}
 */
export async function getCategories() {
  return await apiFetch('/inventario/categorias');
}

/**
 * Obtiene la lista de artículos e insumos con filtros opcionales.
 * Endpoint: GET /api/v1/inventario/items
 * 
 * @param {object} [params={}] - Filtros de consulta.
 * @param {string} [params.categoria_id] - UUID de la categoría.
 * @param {string} [params.search] - Término de búsqueda por nombre o SKU.
 * @param {boolean | string} [params.bajo_stock] - Filtrar insumos con stock por debajo del mínimo.
 * @returns {Promise<Array<{
 *   id: string,
 *   categoria_id: string,
 *   categoria_codigo: string,
 *   codigo_sku: string,
 *   nombre: string,
 *   unidad_medida: string,
 *   stock_actual: number,
 *   stock_minimo: number,
 *   costo_unitario: number,
 *   ubicacion_bodega: string
 * }>>}
 */
export async function getItems(params = {}) {
  const query = new URLSearchParams();

  if (params.categoria_id && params.categoria_id !== 'all') {
    query.append('categoria_id', params.categoria_id);
  }
  if (params.search && params.search.trim()) {
    query.append('search', params.search.trim());
  }
  if (params.bajo_stock !== undefined && params.bajo_stock !== false && params.bajo_stock !== '') {
    query.append('bajo_stock', String(params.bajo_stock));
  }

  const queryString = query.toString();
  const endpoint = queryString ? `/inventario/items?${queryString}` : '/inventario/items';
  return await apiFetch(endpoint);
}

/**
 * Obtiene el detalle completo de un artículo por su UUID.
 * Endpoint: GET /api/v1/inventario/items/{id}
 * 
 * @param {string} id - UUID del insumo.
 * @returns {Promise<object>} Detalle del insumo incluyendo lotes y métricas.
 */
export async function getItemById(id) {
  if (!id) throw new Error('Se requiere el ID del artículo de inventario');
  return await apiFetch(`/inventario/items/${id}`);
}

/**
 * Registra un nuevo artículo de inventario en la base de datos PostgreSQL.
 * Endpoint: POST /api/v1/inventario/items
 * 
 * @param {object} itemData - Datos del insumo a crear.
 * @param {string} itemData.categoria_id - UUID de la categoría.
 * @param {string} itemData.codigo_sku - Código SKU único.
 * @param {string} itemData.nombre - Nombre descriptivo del producto.
 * @param {string} itemData.unidad_medida - Unidad (Bultos, Litros, Kg, etc.).
 * @param {number} itemData.stock_minimo - Umbral de stock mínimo de seguridad.
 * @param {number} itemData.costo_unitario - Costo unitario promedio en COP.
 * @param {string} [itemData.ubicacion_bodega] - Ubicación en granja o bodega.
 * @returns {Promise<object>} Artículo creado en la base de datos.
 */
export async function createItem(itemData) {
  return await apiFetch('/inventario/items', {
    method: 'POST',
    body: itemData,
  });
}

/**
 * Obtiene el historial de movimientos de bodega (Kardex).
 * Endpoint: GET /api/v1/inventario/movimientos
 * 
 * @param {object} [params={ limite: 20 }] - Filtros de consulta.
 * @param {number} [params.limite=20] - Límite de movimientos a recuperar.
 * @param {string} [params.item_id] - Filtrar movimientos de un insumo específico.
 * @returns {Promise<Array<{
 *   id: string,
 *   item_id: string,
 *   item_nombre: string,
 *   tipo_movimiento: 'entrada_compra' | 'salida_consumo' | 'ajuste_merma' | 'devolucion',
 *   cantidad: number,
 *   costo_unitario: number,
 *   fecha_movimiento: string,
 *   motivo: string,
 *   usuario_nombre: string
 * }>>}
 */
export async function getMovements(params = { limite: 20 }) {
  const query = new URLSearchParams();

  if (params.limite) {
    query.append('limite', String(params.limite));
  }
  if (params.item_id) {
    query.append('item_id', params.item_id);
  }

  const queryString = query.toString();
  const endpoint = queryString ? `/inventario/movimientos?${queryString}` : '/inventario/movimientos';
  return await apiFetch(endpoint);
}

/**
 * Registra una entrada, salida o ajuste en el Kardex de inventario.
 * Endpoint: POST /api/v1/inventario/movimientos
 * 
 * @param {object} movementData - Datos del movimiento físico.
 * @param {string} movementData.item_id - UUID del insumo afectado.
 * @param {string} [movementData.lote_inventario_id] - UUID del lote si aplica.
 * @param {'entrada_compra' | 'salida_consumo' | 'ajuste_merma' | 'devolucion'} movementData.tipo_movimiento - Tipo de operación.
 * @param {number} movementData.cantidad - Cantidad involucrada (positiva).
 * @param {number} [movementData.costo_unitario] - Costo unitario si difiere.
 * @param {string} movementData.motivo - Justificación u orden asociada.
 * @returns {Promise<object>} Registro del movimiento creado.
 */
export async function registerMovement(movementData) {
  return await apiFetch('/inventario/movimientos', {
    method: 'POST',
    body: movementData,
  });
}

const inventoryService = {
  getCategories,
  getItems,
  getItemById,
  createItem,
  getMovements,
  registerMovement,
};

export default inventoryService;
