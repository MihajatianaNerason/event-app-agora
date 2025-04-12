import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, X } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  RegisterFormData,
} from "../types";

// Schéma de validation pour le formulaire de profil
const profileSchema = z.object({
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
  role: z.enum(["participant", "organizer"] as const, {
    required_error: "Veuillez sélectionner un rôle",
  }),
});

interface ProfileFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading: boolean;
  error?: Error | null;
}

/**
 * Composant de formulaire pour l'enregistrement du profil utilisateur
 */
export function ProfileForm({ onSubmit, isLoading, error }: ProfileFormProps) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      role: "participant",
    },
  });

  // Gestion de la sélection de fichier pour afficher le nom et la prévisualisation
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name);

      // Créer une prévisualisation de l'image sélectionnée
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

  // Effacer l'image sélectionnée
  const clearImage = () => {
    setValue("profileImage", undefined);
    setSelectedFileName(null);
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1">
          Nom complet
        </label>
        <Input
          id="fullName"
          type="text"
          placeholder="Prénom et nom"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium mb-1">
          Rôle
        </label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select defaultValue={field.value} onValueChange={field.onChange}>
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
          <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Photo de profil
        </label>
        {imagePreview ? (
          <div className="relative w-32 h-32 mb-2">
            <img
              src={imagePreview}
              alt="Prévisualisation"
              className="w-full h-full object-cover rounded-md"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label htmlFor="profileImage" className="block w-full cursor-pointer">
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

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error.message}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        {isLoading ? <Loader size="sm" /> : null}
        Enregistrer mon profil
      </Button>
    </form>
  );
}
