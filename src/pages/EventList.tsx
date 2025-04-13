import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvents } from "@/features/organizer/hooks/useEvents";
import { Event, EventStatus } from "@/features/organizer/types";
import { useDebounce } from "@/hooks/useDebounce";
import { InfiniteData } from "@tanstack/react-query";
import { CalendarRange, Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function EventList() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEvents();

  const [filterStatus, setFilterStatus] = useState<EventStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer pour l'infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Filtrer les événements de toutes les pages
  const filteredEvents = useMemo(() => {
    if (!data) return [];

    // Traiter chaque page séparément pour préserver l'ordre de chargement
    const paginatedData = data as unknown as InfiniteData<Event[]>;
    const allEvents = paginatedData.pages.flatMap((page: Event[]) => {
      // Trier les événements au sein de chaque page
      return page.sort((a: Event, b: Event) => {
        const dateA = new Date(a.start_date || 0);
        const dateB = new Date(b.start_date || 0);
        return dateB.getTime() - dateA.getTime();
      });
    });

    return allEvents.filter((event: Event) => {
      const matchesStatus =
        filterStatus === "all" || event.status === filterStatus;
      const matchesSearch =
        debouncedSearch === "" ||
        event.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        event.description.toLowerCase().includes(debouncedSearch.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [data, filterStatus, debouncedSearch]);

  if (error) {
    return <div className="text-red-500">Erreur: {error.message}</div>;
  }

  return (
    <>
      {/* Header with title and filter buttons */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 pb-3 z-10 border-b mb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Liste des événements
              </h1>
              <p className="text-muted-foreground">
                Découvrez tous les événements disponibles
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:min-w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un événement..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              size="sm"
              className="flex items-center gap-2"
            >
              <CalendarRange className="h-4 w-4" />
              Tous
            </Button>
            <Button
              variant={
                filterStatus === EventStatus.OFFICIALL ? "default" : "outline"
              }
              onClick={() => setFilterStatus(EventStatus.OFFICIALL)}
              size="sm"
              className="flex items-center gap-2"
            >
              Officiels
            </Button>
            <Button
              variant={
                filterStatus === EventStatus.DRAFT ? "default" : "outline"
              }
              onClick={() => setFilterStatus(EventStatus.DRAFT)}
              size="sm"
              className="flex items-center gap-2"
            >
              Non Officiels
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4">
        {/* Event list */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            [...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-md" />
            ))
          ) : !filteredEvents || filteredEvents.length === 0 ? (
            // Empty state
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-medium">Aucun événement trouvé</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery
                  ? "Aucun événement ne correspond à votre recherche"
                  : "Aucun événement ne correspond à vos critères de filtrage"}
              </p>
            </div>
          ) : (
            // Event cards
            <>
              {filteredEvents.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
              {/* Loading indicator and intersection observer target */}
              <div ref={loadMoreRef} className="py-4 text-center">
                {isFetchingNextPage ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Chargement...</span>
                  </div>
                ) : hasNextPage ? (
                  <span className="text-muted-foreground">
                    Faites défiler pour charger plus
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Plus aucun événement à charger
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default EventList;
