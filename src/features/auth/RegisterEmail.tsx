import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/utils/supabaseClient";
import { uploadImage } from "@/utils/uploadImage";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ImageIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const schema = z.object({
  fullName: z.string().min(1, { message: "Le nom complet est requis" }),
  profileImage: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files.length === 1,
      "Une seule image est autorisée"
    )
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      "L'image doit faire moins de 5MB"
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      "Format accepté: .jpg, .jpeg, .png et .webp"
    ),
  role: z.enum(["participant", "organizer"], {
    required_error: "Veuillez sélectionner un rôle",
  }),
});

type FormData = z.infer<typeof schema>;

export default function RegisterEmail() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "participant",
    },
  });

  // Vérifier que l'utilisateur est authentifié avant de permettre
  // l'accès à ce formulaire
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setAuthError("Vous devez vous connecter pour accéder à cette page");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    };

    checkAuthStatus();
  }, [navigate]);

  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: ["register-email"],
    mutationFn: async (data: FormData) => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }

      if (!user) throw new Error("Utilisateur non authentifié");

      let imageUrl = "";

      // Upload profile image if one is selected
      if (data.profileImage && data.profileImage.length > 0) {
        try {
          imageUrl = await uploadImage(data.profileImage[0], "account-picture");
        } catch (error: unknown) {
          console.error("Error uploading profile image:", error);

          // Determine if this is a permissions error or something else
          const errorMessage =
            error instanceof Error ? error.message : String(error);

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

      // Continue with account creation even if image upload failed
      const { error: updateError } = await supabase.from("accounts").insert([
        {
          user_id: user.id,
          full_name: data.fullName,
          image_url: imageUrl || null,
          role: data.role,
        },
      ]);

      if (updateError) {
        console.error("Error inserting account:", updateError);
        throw new Error(`Failed to create account: ${updateError.message}`);
      }

      if (data.role === "organizer") {
        navigate("/organizer/profiles");
      } else {
        navigate("/user/profiles");
      }
    },
  });

  const onSubmit = (data: FormData) => {
    mutate(data);
  };

  // Handle file selection to display the selected filename and preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name);

      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setSelectedFileName(null);
      setImagePreview(null);
    }
  };

  // Clear the selected image
  const clearImage = () => {
    setValue("profileImage", undefined);
    setSelectedFileName(null);
    setImagePreview(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader size="lg" />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4 text-center">
            Finaliser l'inscription
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input placeholder="Nom complet" {...register("fullName")} />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>
            <div>
              {imagePreview ? (
                <div className="relative w-full">
                  <div className="flex justify-center mb-2">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="h-40 w-40 object-cover rounded-full"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="profileImage"
                  className="block w-full cursor-pointer"
                >
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50">
                    <ImageIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">
                      {selectedFileName || "Choisir une photo de profil"}
                    </span>
                  </div>
                  <Input
                    id="profileImage"
                    type="file"
                    className="hidden"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    {...register("profileImage", {
                      onChange: handleFileChange,
                    })}
                  />
                </label>
              )}
              {errors.profileImage && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.profileImage.message as string}
                </p>
              )}
            </div>
            <div>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="participant">Participant</SelectItem>
                      <SelectItem value="organizer">Organisateur</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>
            {isError && (
              <p className="text-red-500 text-sm mt-1">{error.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader size="sm" /> : "Terminer l'inscription"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
