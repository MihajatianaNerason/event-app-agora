import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { LoginFormData } from "@/features/auth/types";
import { supabase } from "@/utils/supabaseClient";
import { Link } from "react-router-dom";

/**
 * Page de connexion utilisateur
 */
export default function Login() {
  const { login, isLoading, isError, error } = useLogin();

  // Add Google OAuth login handler
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/events" },
    });
    if (error) console.error("Google login error:", error);
  };

  const handleSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <AuthLayout title="Connexion">
      {/* Formulaire de connexion */}
      <LoginForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={isError ? error : null}
      />

      {/* Séparateur */}
      <div className="my-4 text-center text-sm text-gray-500">ou</div>

      {/* Bouton de connexion via Google */}
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={handleGoogleSignIn}
      >
        Se connecter avec Google
      </Button>
      <div className="mt-4 text-center">
        <Link
          to="/auth/forgot-password"
          className="text-sm text-muted-foreground underline"
        >
          Mot de passe oublié ?
        </Link>
      </div>
    </AuthLayout>
  );
}
