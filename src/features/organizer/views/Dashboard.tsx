import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "@/hooks/useSession";
import { useUsers } from "@/hooks/useUser";
import { supabase } from "@/utils/supabaseClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { useEventsByUser } from "../hooks/useEvents";
import { EventStatus } from "../types";

function Dashboard() {
  const { data: sessionData } = useSession();
  const userId = sessionData?.session?.user.id;
  const { data: user } = useUsers(userId);
  const {
    data: events,
    isLoading,
    error,
  } = useEventsByUser(Number(user?.[0]?.id));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // État pour gérer le modal de confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  // Mutation pour supprimer un événement
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      // Supprimer d'abord les entrées dans user_interests
      const { error: interestsError } = await supabase
        .from("user_interests")
        .delete()
        .eq("event_id", eventId);

      if (interestsError) throw interestsError;

      // Ensuite supprimer l'événement
      const { error: eventError } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (eventError) throw eventError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("L'événement a été supprimé avec succès");
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(
        `Une erreur est survenue lors de la suppression: ${error.message}`
      );
    },
  });

  const handleDeleteClick = (eventId: number) => {
    setEventToDelete(eventId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      deleteEventMutation.mutate(eventToDelete);
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Non définie";
    try {
      return format(new Date(dateString), "PPP", { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  const renderStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return (
          <Badge
            variant="outline"
            className="border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white"
          >
            Non Officiel
          </Badge>
        );
      case EventStatus.OFFICIALL:
        return (
          <Badge
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
          >
            Officiel
          </Badge>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (error) {
    return <div className="text-red-500">Erreur: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col items-start gap-4 md:flex-row  md:items-center justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center ">
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            (Gérez vos événements et suivez leur statut)
          </p>
        </div>
        <Button onClick={() => navigate("/organizer/events/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Créer un événement
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date de début</TableHead>
              <TableHead>Date de fin</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!events || events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Aucun événement trouvé. Commencez par en créer un !
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium max-w-[100px]">
                    <div className="truncate" title={event.title}>
                      {event.title}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="truncate" title={event.description}>
                      {event.description}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(event.start_date)}</TableCell>
                  <TableCell>{formatDate(event.end_date)}</TableCell>
                  <TableCell>{event.location || "Non défini"}</TableCell>
                  <TableCell>{renderStatusBadge(event.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        navigate(`/organizer/events/edit/${event.id}`)
                      }
                      className="hover:border-2 hover:border-black hover:text-black mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-red-200"
                      onClick={() => event.id && handleDeleteClick(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet événement ? Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Dashboard;
