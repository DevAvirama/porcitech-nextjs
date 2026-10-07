import { apiFetch } from '../apiClient.js';

/**
 * Inicia sesión autenticando al usuario contra la API backend de FastAPI.
 * Endpoint: POST /api/v1/auth/login
 * 
 * @param {string | { email: string, password: string }} emailOrCredentials - Correo o payload de credenciales.
 * @param {string} [maybePassword] - Contraseña si el primer argumento es un string.
 * @returns {Promise<{ access_token: string, token_type: string, usuario: object }>}
 */
export async function login(emailOrCredentials, maybePassword) {
  let email;
  let password;

  if (typeof emailOrCredentials === 'object' && emailOrCredentials !== null) {
    email = emailOrCredentials.email;
    password = emailOrCredentials.password;
  } else {
    email = emailOrCredentials;
    password = maybePassword;
  }

  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (typeof window !== 'undefined') {
    if (response?.access_token) {
      // Guardar token en localStorage (estándar y porcitech para retrocompatibilidad)
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('porcitech_token', response.access_token);

      // Establecer cookies de sesión accesibles por el servidor Next.js
      document.cookie = `token=${response.access_token}; path=/; SameSite=Lax; max-age=86400`;
      document.cookie = `porcitech_token=${response.access_token}; path=/; SameSite=Lax; max-age=86400`;
    }
    if (response?.usuario) {
      localStorage.setItem('user', JSON.stringify(response.usuario));
      localStorage.setItem('porcitech_user', JSON.stringify(response.usuario));
    }
  }

  return response;
}

// Alias de conveniencia y compatibilidad con código existente
export const signIn = login;

/**
 * Cierra la sesión activa del usuario, limpia el almacenamiento local,
 * expira las cookies de sesión y redirecciona a /login.
 */
export function logout() {
  if (typeof window !== 'undefined') {
    // Eliminar tokens y usuarios de localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('porcitech_token');
    localStorage.removeItem('porcitech_user');
    localStorage.removeItem('sigep_token');
    localStorage.removeItem('sigep_user');

    // Limpiar cookies de sesión para middleware de Next.js
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.cookie = 'porcitech_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

    // Redirigir inmediatamente a /login
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/login';
  }
}

/**
 * Retorna el token JWT almacenado o null si no existe.
 * 
 * @returns {string | null}
 */
export function getToken() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token') || localStorage.getItem('porcitech_token');
  if (!token || token.trim() === '') return null;
  return token;
}

/**
 * Retorna estrictamente si el usuario está autenticado en base a la presencia del token.
 * Si no hay token válido, retorna false.
 * 
 * @returns {boolean}
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  const token = getToken();
  return Boolean(token && token.trim() !== '');
}

/**
 * Obtiene el usuario actualmente autenticado desde localStorage.
 * Si no hay token válido o no hay usuario guardado, retorna estrictamente null.
 * Elimina cualquier mock o fallback arbitrario.
 * 
 * @returns {object | null}
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;

  // Validación estricta: debe existir token
  const token = getToken();
  if (!token) return null;

  const userStr = localStorage.getItem('user') || localStorage.getItem('porcitech_user');
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    if (!user || typeof user !== 'object') return null;

    // Normalización de propiedades para asegurar compatibilidad total en toda la UI
    const fullName = [user.nombre, user.apellido].filter(Boolean).join(' ').trim();

    return {
      ...user,
      name: user.name || fullName || user.email,
      role: user.role || user.rol,
      rol: user.rol || user.role,
    };
  } catch {
    return null;
  }
}

/**
 * Helper para actualizar la información del perfil del usuario localmente.
 */
export function updateCurrentUser(newData) {
  if (typeof window === 'undefined') return null;
  const currentUser = getCurrentUser() || {};
  const updatedUser = { ...currentUser, ...newData };

  localStorage.setItem('user', JSON.stringify(updatedUser));
  localStorage.setItem('porcitech_user', JSON.stringify(updatedUser));

  const users = getUsers();
  const userIndex = users.findIndex((u) => u.email === currentUser.email);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...newData };
    localStorage.setItem('sip_users_list', JSON.stringify(users));
  }

  return updatedUser;
}

/**
 * Funciones de gestión de usuarios locales (utilizadas como respaldo).
 */
export function getUsers() {
  if (typeof window === 'undefined') return [];
  const usersStr = localStorage.getItem('sip_users_list');
  if (!usersStr) return [];
  try {
    return JSON.parse(usersStr);
  } catch {
    return [];
  }
}

export function createUser(userData) {
  const users = getUsers();
  const newUser = {
    id: String(Date.now()),
    estado: 'activo',
    ...userData,
  };
  users.push(newUser);
  if (typeof window !== 'undefined') {
    localStorage.setItem('sip_users_list', JSON.stringify(users));
  }
  return newUser;
}

export function updateUser(id, userData) {
  const users = getUsers();
  const updatedUsers = users.map((u) => (u.id === id ? { ...u, ...userData } : u));
  if (typeof window !== 'undefined') {
    localStorage.setItem('sip_users_list', JSON.stringify(updatedUsers));
  }
  return updatedUsers.find((u) => u.id === id);
}

export function deleteUser(id) {
  const users = getUsers();
  const filteredUsers = users.filter((u) => u.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem('sip_users_list', JSON.stringify(filteredUsers));
  }
  return true;
}
