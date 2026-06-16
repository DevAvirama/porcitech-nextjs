"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/auth/authService";

export default function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      alert(
        "Acceso Denegado: Tu rol no tiene permisos para acceder a esta área.",
      );
      router.push("/dashboard");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthorized(true);
  }, [router, allowedRoles]);

  if (!authorized) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <article className="h-8 w-8 animate-spin rounded-full border-2 border-sena-green border-t-transparent"></article>
      </section>
    );
  }

  return children;
}
