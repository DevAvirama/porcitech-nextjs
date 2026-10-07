import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardSplitLayout from "@/components/layout/DashboardSplitLayout";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardSplitLayout>
        {children}
      </DashboardSplitLayout>
    </ProtectedRoute>
  );
}
