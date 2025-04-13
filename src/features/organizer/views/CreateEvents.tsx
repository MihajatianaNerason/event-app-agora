import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/useSession";
import { useUsers } from "@/hooks/useUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCreateEvent } from "../hooks/useCreateEvent";
import {
  EventFormData,
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
} from "../types";

// Schéma de validation pour le formulaire d'ajout d'événement
const eventFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Le titre est requis" })
    .max(MAX_TITLE_LENGTH, {
      message: `Le titre ne doit pas dépasser ${MAX_TITLE_LENGTH} caractères`,
    }),
  description: z
    .string()
    .min(1, { message: "La description est requise" })
    .max(MAX_DESCRIPTION_LENGTH, {
      message: `La description ne doit pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères`,
    }),
  date: z.string().min(1, { message: "La date est requise" }),
  location: z.string().min(1, { message: "Le lieu est requis" }),
  contact: z.string().min(1, { message: "Le contact est requis" }),
  eventImage: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) =>
        !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024,
      {
        message: "L'image ne doit pas dépasser 5 Mo",
      }
    ),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

function CreateEvents() {
  const { data: sessionData } = useSession();
  const userId = sessionData?.session?.user.id;
  const { data: user } = useUsers(userId);
  const { mutate, isPending, isError, error, isSuccess } = useCreateEvent();
  const navigate = useNavigate();

  // Définir le formulaire avec React Hook Form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      contact: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  // Gérer la soumission du formulaire
  const onSubmit = (data: EventFormValues) => {
    if (!user) {
      alert("Vous devez être connecté pour créer un événement");
      return;
    }

    console.log("hereee", user[0].id);

    // Convertir en EventFormData
    const eventFormData: EventFormData = {
      ...data,
      date: data.date,
    };

    mutate(
      { eventData: eventFormData, userId: Number(user[0].id) },
      {
        onSuccess: () => {
          alert("L'événement a été créé avec succès");
        },
      }
    );
  };

  // Rediriger vers le dashboard après création réussie
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        navigate("/organizer/dashboard");
      }, 1500);
    }
  }, [isSuccess, navigate]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Créer un nouvel événement</h1>
        <p className="text-muted-foreground">
          Remplissez le formulaire pour créer un nouvel événement
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="title">
            Titre de l'événement*
          </label>
          <Input
            id="title"
            placeholder="Saisir le titre..."
            {...register("title")}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Maximum {MAX_TITLE_LENGTH} caractères
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="description">
            Description*
          </label>
          <textarea
            id="description"
            placeholder="Saisir la description..."
            className="min-h-32 w-full resize-none rounded-md border border-input p-2"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Maximum {MAX_DESCRIPTION_LENGTH} caractères
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="date">
            Date de l'événement*
          </label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="location">
            Lieu*
          </label>
          <Input
            id="location"
            placeholder="Saisir le lieu..."
            {...register("location")}
          />
          {errors.location && (
            <p className="text-red-500 text-sm">{errors.location.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="contact">
            Contact*
          </label>
          <Input
            id="contact"
            placeholder="Email ou téléphone de contact..."
            {...register("contact")}
          />
          {errors.contact && (
            <p className="text-red-500 text-sm">{errors.contact.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="eventImage">
            Image (optionnelle)
          </label>
          <Input
            id="eventImage"
            type="file"
            accept="image/*"
            {...register("eventImage")}
          />
          {errors.eventImage && (
            <p className="text-red-500 text-sm">{errors.eventImage.message}</p>
          )}
          <p className="text-sm text-muted-foreground">Maximum 5 Mo</p>
        </div>

        {isError && (
          <div className="text-red-500 text-sm">
            Erreur: {error?.message || "Une erreur est survenue"}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/organizer/dashboard")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Créer l'événement"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvents;
