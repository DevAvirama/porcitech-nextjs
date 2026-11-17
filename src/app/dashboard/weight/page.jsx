import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WeightView from "@/features/weight/WeightView";

const ALLOWED_ROLES = ["administrador", "operario"];

export default function WeightPage() {
  return (
    <ProtectedRoute allowedRoles={ALLOWED_ROLES}>
      <WeightView />
    </ProtectedRoute>
  );
}
