import SettingsView from "@/features/auth/SettingsView";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["administrador"]}>
      <SettingsView />
    </ProtectedRoute>
  );
}
