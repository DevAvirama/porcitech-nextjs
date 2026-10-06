import { apiFetch } from './apiClient.js';

/**
 * Servicio para la gestión administrativa de usuarios y personal de granja en PorciTech.
 */

/**
 * Obtiene la lista completa de usuarios registrados.
 * Endpoint: GET /api/v1/usuarios
 * 
 * @returns {Promise<Array<{
 *   id: string,
 *   nombre: string,
 *   apellido: string,
 *   email: string,
 *   rol: 'administrador' | 'veterinario' | 'operario',
 *   telefono?: string,
 *   activo: boolean,
 *   created_at: string
 * }>>}
 */
export async function getUsuarios() {
  return await apiFetch('/usuarios');
}

/**
 * Registra un nuevo usuario con credenciales en la base de datos.
 * Endpoint: POST /api/v1/usuarios
 * 
 * @param {object} userData
 * @param {string} userData.nombre
 * @param {string} userData.apellido
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {'administrador' | 'veterinario' | 'operario'} userData.rol
 * @param {string} [userData.telefono]
 * @returns {Promise<object>}
 */
export async function createUsuario(userData) {
  return await apiFetch('/usuarios', {
    method: 'POST',
    body: userData,
  });
}

/**
 * Actualiza los datos o credenciales de un usuario existente.
 * Endpoint: PUT /api/v1/usuarios/{id}
 * 
 * @param {string} id - UUID del usuario.
 * @param {object} userData - Campos a actualizar.
 * @returns {Promise<object>}
 */
export async function updateUsuario(id, userData) {
  if (!id) throw new Error('Se requiere el ID del usuario para actualizar');
  return await apiFetch(`/usuarios/${id}`, {
    method: 'PUT',
    body: userData,
  });
}

/**
 * Inactiva / aplica soft-delete a un usuario.
 * Endpoint: DELETE /api/v1/usuarios/{id}
 * 
 * @param {string} id - UUID del usuario.
 * @returns {Promise<{ message: string }>}
 */
export async function deleteUsuario(id) {
  if (!id) throw new Error('Se requiere el ID del usuario para inactivar');
  return await apiFetch(`/usuarios/${id}`, {
    method: 'DELETE',
  });
}

const userService = {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};

export default userService;
