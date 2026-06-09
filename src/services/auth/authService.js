const USER_KEY = "sip_user_session";

const authService = {
  login: async (email, password) => {
    // Simulated authentication logic for development
    if (email && password) {
      const mockUser = {
        email,
        role: email.includes("admin") ? "admin" : "veterinario",
        name: "Usuario Demo",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      }
      return true;
    }
    return false;
  },

  logout: () => {
    if (typeof window !== "undefined") {
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
    }
    // Fallback during Server-Side Rendering (SSR) in Next.js
    return { name: "Usuario SSR", role: "admin" };
  },
};

export default authService;
