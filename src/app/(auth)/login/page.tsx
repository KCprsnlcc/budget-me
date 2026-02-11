import { AuthPanel } from "@/components/auth/auth-panel";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In - BudgetMe",
  description: "Sign in to your BudgetMe account for professional financial clarity.",
};

export default function LoginPage() {
  return (
    <AuthPanel>
      <LoginForm />
    </AuthPanel>
  );
}
