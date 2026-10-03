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
      localStorage.setItem('porcitech_token', response.access_token);
    }
    if (response?.usuario) {
      localStorage.setItem('porcitech_user', JSON.stringify(response.usuario));
    }
  }

  return response;
}

// Alias de conveniencia y compatibilidad con código existente
export const signIn = login;

/**
 * Cierra la sesión activa del usuario, limpia el almacenamiento local y redirecciona al login.
 */
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('porcitech_token');
    localStorage.removeItem('porcitech_user');
    // Limpieza de claves previas por retrocompatibilidad
    localStorage.removeItem('sigep_token');
    localStorage.removeItem('sigep_user');
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/login';
  }
}

/**
 * Obtiene y parsea el usuario actualmente autenticado desde localStorage.
 * Solo se ejecuta en el entorno del cliente.
 * 
 * @returns {object | null}
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;

  const userStr =
    localStorage.getItem('porcitech_user') || localStorage.getItem('sigep_user');
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    if (!user) return null;

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
 * Comprueba si el usuario tiene una sesión activa mediante el token JWT en localStorage.
 * 
 * @returns {boolean}
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('porcitech_token');
  return Boolean(token && token.trim() !== '');
}

/**
 * Helper para actualizar la información del perfil del usuario localmente.
 */
export function updateCurrentUser(newData) {
  if (typeof window === 'undefined') return null;
  const currentUser = getCurrentUser() || {};
  const updatedUser = { ...currentUser, ...newData };

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
 * Funciones de gestión de usuarios locales (utilizadas en SettingsView).
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
