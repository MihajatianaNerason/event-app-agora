import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEventsByUser } from "../hooks/useEvents";
import { EventStatus } from "../types";

function Dashboard() {
  const { data: sessionData } = useSession();
  const userId = sessionData?.session?.user.id;
  const { data: events, isLoading, error } = useEventsByUser(Number(userId));

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
        return <Badge variant="outline">Brouillon</Badge>;
      case EventStatus.OFFICIALL:
        return <Badge variant="default">Officiel</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (error) {
    return <div className="text-red-500">Erreur: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          (Gérez vos événements et suivez leur statut)
        </p>
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
              <TableHead>Date</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!events || events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Aucun événement trouvé. Commencez par en créer un !
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {event.description}
                  </TableCell>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>{event.location || "Non défini"}</TableCell>
                  <TableCell>{renderStatusBadge(event.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default Dashboard;
