import AuthSplitLayout from "@/components/layout/AuthSplitLayout";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import ForgotPasswordShowcase from "./components/ForgotPasswordShowcase";

export default function ForgotPasswordView() {
  return (
    <AuthSplitLayout showcase={<ForgotPasswordShowcase />}>
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}
