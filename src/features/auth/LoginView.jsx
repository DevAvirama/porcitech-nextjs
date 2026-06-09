import AuthSplitLayout from "@/components/layout/AuthSplitLayout";
import LoginForm from "./components/LoginForm";
import LoginShowcase from "./components/LoginShowcase";

export default function LoginView() {
  return (
    <AuthSplitLayout showcase={<LoginShowcase />}>
      <LoginForm />
    </AuthSplitLayout>
  );
}
