import { AuthPanel } from "@/components/auth/auth-panel";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Reset Password - BudgetMe",
  description: "Reset your BudgetMe account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPanel page="forgot">
      <ForgotPasswordForm />
    </AuthPanel>
  );
}
