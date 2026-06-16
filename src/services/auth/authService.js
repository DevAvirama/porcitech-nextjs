const USER_KEY = "sigep_user";
const TOKEN_KEY = "sigep_token";

const MOCK_USERS = [
  { email: "admin@sigep.com", password: "admin123", role: "administrador", name: "Administrador" },
  { email: "vet@sigep.com", password: "vet123", role: "veterinario", name: "Veterinario" },
  { email: "operario@sigep.com", password: "ope123", role: "operativo", name: "Operario" },
];

const mapRole = (role) => {
  if (role === "administrador") return "admin";
  if (role === "operativo") return "operario";
  return role;
};

const authService = {
  login: async (email, password) => {
    // Check against standard mock users from React project
    const matchedUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (matchedUser) {
      const userInfo = {
        email: matchedUser.email,
        role: mapRole(matchedUser.role),
        name: matchedUser.name,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, "mock-jwt-token");
        localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
      }
      return true;
    }

    // Support test logins for dev using sena.edu.co or general emails
    if (email && password && (email.includes("@sena.edu.co") || email.includes("@gmail.com") || email.includes("demo"))) {
      const isTeacherOrAdmin = email.includes("admin") || email.includes("instructor");
      const isOperator = email.includes("operario") || email.includes("operativo");
      
      const role = isTeacherOrAdmin ? "admin" : isOperator ? "operario" : "veterinario";
      const userInfo = {
        email,
        role,
        name: email.split("@")[0].replace(/[._-]/g, " "),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, "mock-jwt-token");
        localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
      }
      return true;
    }

    return false;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  getCurrentUser: () => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(USER_KEY);
      if (data) {
        try {
          return JSON.parse(data);
        } catch (_) {
          return null;
        }
      }
      return null;
    }
    // Fallback during Server-Side Rendering (SSR) in Next.js
    return null;
  },
};

// Named exports for compatibility with React codebase patterns
export async function signIn(credentials) {
  const success = await authService.login(credentials.email, credentials.password);
  if (success) {
    return { ok: true, user: authService.getCurrentUser() };
  }
  return { ok: false, error: "Credenciales inválidas" };
}

export function getCurrentUser() {
  return authService.getCurrentUser();
}

export function logout() {
  authService.logout();
}

export default authService;
