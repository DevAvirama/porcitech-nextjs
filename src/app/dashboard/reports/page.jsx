import ReportsView from "@/features/reports/ReportsView";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ReportsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <ReportsView />
    </ProtectedRoute>
  );
}
