const MOCK_USERS = [
  { email: 'admin@sigep.com', password: 'admin123', role: 'administrador', name: 'Administrador' },
  { email: 'vet@sigep.com', password: 'vet123', role: 'veterinario', name: 'Veterinario' },
  { email: 'operario@sigep.com', password: 'ope123', role: 'operativo', name: 'Operario' },
];

export async function signIn(credentials) {
  const user = MOCK_USERS.find(u => u.email === credentials.email && u.password === credentials.password);
  
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
