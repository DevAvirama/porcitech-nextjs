import { Suspense } from "react";
import ResetPasswordView from "@/features/auth/forgotPassword/ResetPasswordView";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ResetPasswordView />
    </Suspense>
  );
}
