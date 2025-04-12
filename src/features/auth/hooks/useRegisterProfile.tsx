import { supabase } from "@/utils/supabaseClient";
import { uploadImage } from "@/utils/uploadImage";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { RegisterFormData } from "../types";

/**
 * Hook pour gérer l'enregistrement et la mise à jour du profil utilisateur
 * @returns Mutation et état pour l'enregistrement du profil
 */
export function useRegisterProfile() {
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationKey: ["register-profile"],
    mutationFn: async (data: RegisterFormData) => {
      // Récupérer l'utilisateur actuellement connecté
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        throw new Error("Erreur d'authentification: " + userError.message);
      }

      if (!userData.user) {
        throw new Error("Utilisateur non authentifié");
      }

      // Gérer l'upload de l'image de profil
      let imageUrl = "";
      if (data.profileImage && data.profileImage.length > 0) {
        try {
          imageUrl = await uploadImage(data.profileImage[0], "account-picture");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error("Erreur lors de l'upload de l'image:", errorMessage);

          // Catégoriser l'erreur
          if (errorMessage.includes("permission")) {
            throw new Error(
              "Erreur d'autorisation: Vous n'avez pas les permissions nécessaires pour télécharger des images."
            );
          } else if (errorMessage.includes("row-level security policy")) {
            throw new Error(
              "Erreur de sécurité: La politique de sécurité empêche le téléchargement. Veuillez contacter l'administrateur."
            );
          } else {
            throw new Error(
              `Échec du téléchargement de l'image de profil: ${errorMessage}`
            );
          }
        }
      }

      // Créer ou mettre à jour le profil utilisateur dans la base de données
      const { error: profileError } = await supabase.from("accounts").insert([
        {
          user_id: userData.user.id,
          full_name: data.fullName,
          image_url: imageUrl || null,
          role: data.role,
        },
      ]);

      if (profileError) {
        console.error("Erreur lors de l'ajout du profil:", profileError);
        throw new Error(
          `Échec de la création du profil: ${profileError.message}`
        );
      }

      // Retourner les informations pour la redirection
      return {
        success: true,
        role: data.role,
      };
    },
    onSuccess: (data) => {
      // Rediriger en fonction du rôle
      const redirectPath =
        data.role === "organizer" ? "/organizer/profiles" : "/user/profiles";

      navigate(redirectPath);
    },
  });

  return {
    registerProfile: (data: RegisterFormData) => registerMutation.mutate(data),
    isLoading: registerMutation.isPending,
    isError: registerMutation.isError,
    error: registerMutation.error,
  };
}
