import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/utils/supabaseClient";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";
import { ProfileForm } from "./components/ProfileForm";
import { useRegisterProfile } from "./hooks/useRegisterProfile";
import { RegisterFormData } from "./types";

/**
 * Page d'enregistrement des informations de profil utilisateur
 * Accessible uniquement pour les utilisateurs authentifiés
 */
export default function RegisterEmail() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    registerProfile,
    isLoading: isSubmitting,
    isError,
    error,
  } = useRegisterProfile();

  // Vérifier que l'utilisateur est authentifié avant de permettre
  // l'accès à ce formulaire
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          setAuthError("Vous devez vous connecter pour accéder à cette page");
        }
      } catch (err) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          err
        );
        setAuthError(
          "Une erreur est survenue lors de la vérification de votre compte"
        );
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const handleSubmit = (data: RegisterFormData) => {
    registerProfile(data);
  };

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader size="lg" />
      </div>
    );
  }

  // Afficher une erreur si l'utilisateur n'est pas authentifié
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md p-6 shadow-lg">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4 text-center">
              Erreur d'authentification
            </h2>
            <p className="text-red-500 text-center mb-4">{authError}</p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Afficher le formulaire d'enregistrement du profil
  return (
    <AuthLayout title="Complétez votre profil">
      <ProfileForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        error={isError ? error : null}
      />
    </AuthLayout>
  );
}
