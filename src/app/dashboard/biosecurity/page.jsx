import BiosecurityView from "@/features/health/BiosecurityView";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function BiosecurityPage() {
  return (
    <ProtectedRoute allowedRoles={["administrador", "veterinario", "operario", "operativo"]}>
      <BiosecurityView />
    </ProtectedRoute>
  );
}
