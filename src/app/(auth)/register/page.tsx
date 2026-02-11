import { AuthPanel } from "@/components/auth/auth-panel";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Sign Up - BudgetMe",
  description: "Create your BudgetMe account and start your financial journey.",
};

export default function RegisterPage() {
  return (
    <AuthPanel page="register">
      <RegisterForm />
    </AuthPanel>
  );
}
