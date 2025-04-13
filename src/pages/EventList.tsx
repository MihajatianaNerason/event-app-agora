import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvents } from "@/features/organizer/hooks/useEvents";
import { EventStatus } from "@/features/organizer/types";
import { useState } from "react";

function EventList() {
  const { data: events, isLoading, error } = useEvents();
  const [filterStatus, setFilterStatus] = useState<EventStatus | "all">("all");

  const filteredEvents =
    filterStatus === "all"
      ? events
      : events?.filter((event) => event.status === filterStatus);

  if (error) {
    return <div className="text-red-500">Erreur: {error.message}</div>;
  }

  return (
    <>
      {/* Header with title and filter buttons */}
      <div className="sticky top-0 bg-background pt-4 pb-3 z-10 border-b mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Liste des événements
            </h1>
            <p className="text-muted-foreground">
              Découvrez tous les événements disponibles
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              size="sm"
            >
              Tous
            </Button>
            <Button
              variant={
                filterStatus === EventStatus.OFFICIALL ? "default" : "outline"
              }
              onClick={() => setFilterStatus(EventStatus.OFFICIALL)}
              size="sm"
            >
              Officiels
            </Button>
            <Button
              variant={
                filterStatus === EventStatus.DRAFT ? "default" : "outline"
              }
              onClick={() => setFilterStatus(EventStatus.DRAFT)}
              size="sm"
            >
              Non Officiels
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4">
        {/* Event list */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            [...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-md" />
            ))
          ) : !filteredEvents || filteredEvents.length === 0 ? (
            // Empty state
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-medium">Aucun événement trouvé</h3>
              <p className="text-muted-foreground mt-2">
                Aucun événement ne correspond à vos critères de recherche
              </p>
            </div>
          ) : (
            // Event cards
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default EventList;
