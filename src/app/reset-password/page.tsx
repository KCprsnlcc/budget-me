import { AuthPanel } from "@/components/auth/auth-panel";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Reset Password - BudgetMe",
  description: "Set a new password for your BudgetMe account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthPanel page="reset-password">
      <ResetPasswordForm />
    </AuthPanel>
  );
}
