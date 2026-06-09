import HealthView from "@/features/health/HealthView";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function HealthPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "veterinario"]}>
      <HealthView />
    </ProtectedRoute>
  );
}
