import { supabase } from "@/utils/supabaseClient";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LoginFormData, UserRole } from "../types";

interface LoginResult {
  success: boolean;
  redirectTo: string;
}

/**
 * Hook pour gérer le processus de connexion utilisateur
 * @returns Un objet contenant les fonctions et données pour la connexion
 */
export function useLogin() {
  const navigate = useNavigate();

  const loginMutation = useMutation<LoginResult, Error, LoginFormData>({
    mutationFn: async ({ email, password }: LoginFormData) => {
      // Authentification avec Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      try {
        // Récupérer le rôle de l'utilisateur pour la redirection
        const { data: accountData, error: accountError } = await supabase
          .from("accounts")
          .select("role")
          .eq("user_id", data.user.id)
          .single();

        if (accountError) {
          console.error(
            "Erreur lors de la récupération du rôle:",
            accountError
          );

          // L'utilisateur est authentifié mais n'a pas de profil
          return {
            success: true,
            redirectTo: "/auth/register-email",
          };
        }

        // Redirection basée sur le rôle
        const role = accountData.role as UserRole;
        const redirectPath =
          role === "organizer" ? "/organizer/profiles" : "/user/profiles";

        return {
          success: true,
          redirectTo: redirectPath,
        };
      } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        throw new Error("Échec lors de la connexion. Veuillez réessayer.");
      }
    },
    onSuccess: (data) => {
      navigate(data.redirectTo);
    },
  });

  return {
    login: (data: LoginFormData) => loginMutation.mutate(data),
    isLoading: loginMutation.isPending,
    isError: loginMutation.isError,
    error: loginMutation.error,
  };
}
