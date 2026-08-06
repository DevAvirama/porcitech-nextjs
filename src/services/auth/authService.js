const MOCK_USERS = [
  { email: 'admin@sigep.com', password: 'admin123', role: 'administrador', name: 'Administrador' },
  { email: 'vet@sigep.com', password: 'vet123', role: 'veterinario', name: 'Veterinario' },
  { email: 'operario@sigep.com', password: 'ope123', role: 'operativo', name: 'Operario' },
];

export function getUsers() {
  if (typeof window === 'undefined') return [];
  const usersStr = localStorage.getItem('sip_users_list');
  if (!usersStr) {
    const initialUsers = MOCK_USERS.map((u, index) => ({
      id: String(index + 1),
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      estado: 'activo'
    }));
    localStorage.setItem('sip_users_list', JSON.stringify(initialUsers));
    return initialUsers;
  }
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
    ...userData
  };
  users.push(newUser);
  if (typeof window !== 'undefined') {
    localStorage.setItem('sip_users_list', JSON.stringify(users));
  }
  return newUser;
}

export function updateUser(id, userData) {
  const users = getUsers();
  const updatedUsers = users.map(u => u.id === id ? { ...u, ...userData } : u);
  if (typeof window !== 'undefined') {
    localStorage.setItem('sip_users_list', JSON.stringify(updatedUsers));
  }
  return updatedUsers.find(u => u.id === id);
}

export function deleteUser(id) {
  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem('sip_users_list', JSON.stringify(filteredUsers));
  }
  return true;
}

export async function signIn(credentials) {
  const users = getUsers();
  const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
  
  if (user) {
    const userInfo = { email: user.email, role: user.role, name: user.name };
    if (typeof window !== 'undefined') {
      localStorage.setItem('sigep_token', 'mock-jwt-token');
      localStorage.setItem('sigep_user', JSON.stringify(userInfo));
    }
    
    return Promise.resolve({
      ok: true,
      user: userInfo,
    });
  } else {
    return Promise.resolve({
      ok: false,
      error: 'Credenciales inválidas'
    });
  }
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('sigep_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sigep_token');
    localStorage.removeItem('sigep_user');
  }
}

export function updateCurrentUser(newData) {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('sigep_user');
  let currentUser = {};
  if (userStr) {
    try {
      currentUser = JSON.parse(userStr);
    } catch {
      currentUser = {};
    }
  }
  const updatedUser = { ...currentUser, ...newData };
  localStorage.setItem('sigep_user', JSON.stringify(updatedUser));
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === currentUser.email);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...newData };
    localStorage.setItem('sip_users_list', JSON.stringify(users));
  }
  
  return updatedUser;
}
