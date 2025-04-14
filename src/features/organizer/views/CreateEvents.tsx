import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  EventStatus,
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
} from "../types";

// Schéma de validation pour le formulaire d'ajout d'événement
const eventFormSchema = z
  .object({
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
    start_date: z
      .string()
      .min(1, { message: "La date de début est requise" })
      .refine(
        (date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return new Date(date) >= today;
        },
        {
          message: "La date de début ne peut pas être dans le passé",
        }
      ),
    end_date: z
      .string()
      .min(1, { message: "La date de fin est requise" })
      .refine(
        (date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return new Date(date) >= today;
        },
        {
          message: "La date de fin ne peut pas être dans le passé",
        }
      ),
    location: z.string().min(1, { message: "Le lieu est requis" }),
    contact: z.string().min(1, { message: "Le contact est requis" }),
    status: z.nativeEnum(EventStatus, {
      message: "Le statut de l'événement est requis",
    }),
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
  })
  .refine(
    (data) => {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      return endDate >= startDate;
    },
    {
      message: "La date de fin ne peut pas être antérieure à la date de début",
      path: ["end_date"],
    }
  );

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
      start_date: "",
      end_date: "",
      location: "",
      contact: "",
      status: EventStatus.DRAFT,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
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
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
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
          <label className="block text-sm font-medium" htmlFor="start_date">
            Date de début de l'événement*
          </label>
          <Input id="start_date" type="date" {...register("start_date")} />
          {errors.start_date && (
            <p className="text-red-500 text-sm">{errors.start_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="end_date">
            Date de fin de l'événement*
          </label>
          <Input id="end_date" type="date" {...register("end_date")} />
          {errors.end_date && (
            <p className="text-red-500 text-sm">{errors.end_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="status">
            Statut de l'événement*
          </label>
          <Select
            defaultValue={EventStatus.DRAFT}
            onValueChange={(value) => setValue("status", value as EventStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EventStatus.DRAFT}>Non Officiel</SelectItem>
              <SelectItem value={EventStatus.OFFICIALL}>Officiel</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-red-500 text-sm">{errors.status.message}</p>
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
