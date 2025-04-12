import { supabase } from "@/utils/supabaseClient";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useSignOut() {
  const navigate = useNavigate();

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  }, [navigate]);

  return { signOut };
}
