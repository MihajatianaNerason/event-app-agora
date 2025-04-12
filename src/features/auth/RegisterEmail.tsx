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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
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
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "participant",
    },
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: ["register-email"],
    mutationFn: async (data: FormData) => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        // throw error;
        console.log("error getuser");
      }

      if (!user) throw new Error("Utilisateur non authentifié");

      // let image_url = "";
      // if (data.profileImage && data.profileImage.length > 0) {
      //   image_url = await UploadImage(data.profileImage[0]);
      // }

      const { error: updateError } = await supabase.from("accounts").insert([
        {
          user_id: user.id,
          full_name: data.fullName,
          image_url: "image_url",
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
              <label
                htmlFor="profileImage"
                className="block w-full cursor-pointer"
              >
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50">
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">
                    Choisir une photo de profil
                  </span>
                </div>
                <Input
                  id="profileImage"
                  type="file"
                  className="hidden"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  {...register("profileImage")}
                />
              </label>
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
