"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/services/auth/authService";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function ProtectedRoute({ children, allowedRoles, requiredRole }) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);

  useEffect(() => {
    // 1. Validar autenticación estricta: debe existir token y usuario en sesión
    if (!isAuthenticated() || !getCurrentUser()) {
      setIsUnauthenticated(true);
      router.replace("/login");
      return;
    }

    const user = getCurrentUser();

    // 2. Normalizar roles requeridos / permitidos
    const targetRoles = [];
    if (requiredRole) {
      targetRoles.push(String(requiredRole).toLowerCase());
    }
    if (allowedRoles) {
      if (Array.isArray(allowedRoles)) {
        targetRoles.push(...allowedRoles.map((r) => String(r).toLowerCase()));
      } else {
        targetRoles.push(String(allowedRoles).toLowerCase());
      }
    }

    // 3. Validar permisos de rol si se definieron
    if (targetRoles.length > 0) {
      const userRole = (user?.rol || user?.role || "").toLowerCase();
      const isAllowed =
        targetRoles.includes(userRole) ||
        (userRole === "operario" && targetRoles.includes("operativo")) ||
        (userRole === "operativo" && targetRoles.includes("operario")) ||
        (userRole === "administrador" && targetRoles.includes("admin")) ||
        (userRole === "admin" && targetRoles.includes("administrador"));

      if (!isAllowed) {
        router.replace("/dashboard");
        return;
      }
    }

    // 4. Sesión 100% verificada y autorizada
    setIsAuthorized(true);
    setIsVerifying(false);
  }, [router, allowedRoles, requiredRole]);

  // Si no está autenticado, retornar estrictamente null
  if (isUnauthenticated) {
    return null;
  }

  // Durante la verificación, mostrar pantalla de carga limpia y NUNCA renderizar children
  if (isVerifying || !isAuthorized) {
    return <LoadingScreen message="Verificando permisos y sesión activa..." />;
  }

  // Solo cuando la sesión esté 100% verificada, renderizar children
  return children;
}
