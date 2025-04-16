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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  CalendarRange,
  Filter,
  Loader2,
  Pencil,
  Plus,
  SortAsc,
  SortDesc,
  Trash2,
} from "lucide-react";
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

  // États pour les filtres et le tri
  const [statusFilter, setStatusFilter] = useState<EventStatus | "ALL">("ALL");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // État pour gérer le modal de confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  // Calculer les compteurs d'événements par statut
  const eventCounts = events?.reduce(
    (acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      acc.total += 1;
      return acc;
    },
    { [EventStatus.DRAFT]: 0, [EventStatus.OFFICIALL]: 0, total: 0 } as Record<
      string,
      number
    >
  ) || { [EventStatus.DRAFT]: 0, [EventStatus.OFFICIALL]: 0, total: 0 };

  // Filtrer et trier les événements
  const filteredAndSortedEvents = events
    ?.filter((event) =>
      statusFilter === "ALL" ? true : event.status === statusFilter
    )
    ?.sort((a, b) => {
      const dateA = new Date(a.start_date || 0);
      const dateB = new Date(b.start_date || 0);
      return sortDirection === "asc"
        ? dateA > dateB
          ? 1
          : -1
        : dateA < dateB
        ? 1
        : -1;
    });

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
    <div className="space-y-6 mb-10">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-muted-foreground">
              Gérez vos événements et suivez leur statut
            </p>
          </div>
          <Button onClick={() => navigate("/organizer/events/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Créer un événement
          </Button>
        </div>

        {/* Stats des événements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total des événements</span>
            </div>
            <p className="text-2xl font-bold mt-2">{eventCounts.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-violet-600 text-violet-600"
              >
                Non Officiel
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">
              {eventCounts[EventStatus.DRAFT]}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-green-600 text-green-600"
              >
                Officiel
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">
              {eventCounts[EventStatus.OFFICIALL]}
            </p>
          </div>
        </div>

        {/* Filtres et tri */}
        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as EventStatus | "ALL")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                <SelectItem value={EventStatus.DRAFT}>Non Officiel</SelectItem>
                <SelectItem value={EventStatus.OFFICIALL}>Officiel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            className="flex items-center gap-2"
          >
            {sortDirection === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
            Trier par date
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
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
              {!filteredAndSortedEvents ||
              filteredAndSortedEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {events?.length === 0
                      ? "Aucun événement trouvé. Commencez par en créer un !"
                      : "Aucun événement ne correspond au filtre sélectionné."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedEvents.map((event) => (
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
                    <TableCell className="max-w-[200px]">
                      <div className="truncate">
                        {event.location || "Non défini"}
                      </div>
                    </TableCell>
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
        </div>
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
