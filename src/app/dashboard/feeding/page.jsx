import ProtectedRoute from "@/components/auth/ProtectedRoute";
import FeedingView from "@/features/feeding/FeedingView";

const ALLOWED_ROLES = ["administrador", "operario"];

export default function FeedingPage() {
  return (
    <ProtectedRoute allowedRoles={ALLOWED_ROLES}>
      <FeedingView />
    </ProtectedRoute>
  );
}
