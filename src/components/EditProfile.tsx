import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/hooks/useUserProfile";
import { updateUserProfile } from "@/services/userService";
import { supabase } from "@/utils/supabaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ImagePlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Alert, AlertDescription } from "./ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Schéma de validation du formulaire
const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  profile_image: z
    .instanceof(FileList)
    .optional()
    .refine((files) => {
      if (!files || files.length === 0) return true;
      const file = files[0];
      return file && file.size <= MAX_FILE_SIZE;
    }, "L'image ne doit pas dépasser 5MB")
    .refine((files) => {
      if (!files || files.length === 0) return true;
      const file = files[0];
      return file && ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, "Format d'image accepté : .jpg, .jpeg, .png et .webp"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfile() {
  const { fullName, imageUrl, initials, role, userId } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    imageUrl || null
  );
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: fullName,
    },
  });

  const handleImageChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}-${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("account-picture")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("account-picture").getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!userId) {
      setError(
        "Impossible de mettre à jour le profil : utilisateur non connecté"
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let newImageUrl = imageUrl;
      if (data.profile_image?.length) {
        newImageUrl = await uploadImage(data.profile_image[0]);
      }

      await updateUserProfile(userId, {
        full_name: data.full_name,
        image_url: newImageUrl,
      });

      // Invalider le cache pour forcer un rafraîchissement des données
      queryClient.invalidateQueries({ queryKey: ["user"] });

      // Rediriger vers la page de profil appropriée
      const redirectPath =
        role === "organizer" ? "/organizer/profile" : "/profile";
      navigate(redirectPath);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError("Une erreur est survenue lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Modifier le profil</CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles
              </CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewImage || ""} alt={fullName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <label
                htmlFor="profile_image"
                className="absolute bottom-0 right-0 p-1 rounded-full bg-primary hover:bg-primary/90 cursor-pointer text-white"
              >
                <ImagePlus className="h-4 w-4" />
              </label>
            </div>

            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom complet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profile_image"
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="profile_image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files;
                            handleImageChange(files);
                            onChange(files);
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const backPath =
                        role === "organizer"
                          ? "/organizer/profile"
                          : "/profile";
                      navigate(backPath);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Enregistrer les modifications
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
