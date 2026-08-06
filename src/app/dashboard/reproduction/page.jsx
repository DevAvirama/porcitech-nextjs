import ReproductionView from "@/features/reproduction/ReproductionView";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ReproductionPage() {
  return (
    <ProtectedRoute allowedRoles={["administrador", "veterinario"]}>
      <ReproductionView />
    </ProtectedRoute>
  );
}
