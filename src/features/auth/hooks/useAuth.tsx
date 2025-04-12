import { supabase } from "@/utils/supabaseClient";
import { Session, AuthError as SupabaseAuthError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { AuthError, UserStatus } from "../types";

/**
 * Hook qui fournit le statut d'authentification de l'utilisateur
 * @returns L'état d'authentification et les erreurs éventuelles
 */
export function useAuth() {
  const [userStatus, setUserStatus] = useState<UserStatus>("loading");
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Fonction qui gère les changements d'état d'authentification
    const handleAuthChange = async (event: string, session: Session | null) => {
      try {
        switch (event) {
          case "INITIAL_SESSION":
            setUserStatus(session ? "signed-in" : "signed-out");
            break;
          case "SIGNED_IN":
            setUserStatus("signed-in");
            setError(null);
            break;
          case "SIGNED_OUT":
            setUserStatus("signed-out");
            setError(null);
            break;
          case "PASSWORD_RECOVERY":
            console.log("Password recovery flow initiated");
            break;
          case "TOKEN_REFRESHED":
            console.log("Token refreshed successfully");
            break;
          case "USER_UPDATED":
            console.log("User information updated");
            break;
          default:
            console.log(`Unhandled auth event: ${event}`);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        const authError = err as SupabaseAuthError;
        setError({ message: authError.message });
        setUserStatus("signed-out");
      }
    };

    // S'abonner aux changements d'état d'authentification
    const { data: authListener } =
      supabase.auth.onAuthStateChange(handleAuthChange);

    // Nettoyer l'abonnement lors du démontage du composant
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { userStatus, error };
}
