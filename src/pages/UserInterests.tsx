import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Event } from "@/features/organizer/types";
import { useSession } from "@/hooks/useSession";
import { useUsers } from "@/hooks/useUser";
import { supabase } from "@/utils/supabaseClient";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, MapPin, Phone, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface UserEvent extends Event {
  users: {
    id: number;
    full_name: string;
    image_url: string | null;
  };
}

function UserInterests() {
  const { data: session } = useSession();
  const userId = session?.session?.user?.id;
  const { data: users } = useUsers(userId);
  const [interestedEvents, setInterestedEvents] = useState<UserEvent[]>([]);
  const [notInterestedEvents, setNotInterestedEvents] = useState<UserEvent[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"interested" | "not-interested">(
    "interested"
  );

  useEffect(() => {
    const fetchInterests = async () => {
      if (!userId || !users?.[0]?.id) return;
      setIsLoading(true);

      try {
        // Récupérer les événements intéressés
        const { data: interestedData, error: interestedError } = await supabase
          .from("user_interests")
          .select(
            `
              event_id,
              events:events(
                *,
                users:accounts(id, full_name, image_url)
              )
            `
          )
          .eq("user_id", users[0].id);

        if (interestedError) throw interestedError;

        // Récupérer les événements non intéressés
        const { data: notInterestedData, error: notInterestedError } =
          await supabase
            .from("user_no_interests")
            .select(
              `
              event_id,
              events:events(
                *,
                users:accounts(id, full_name, image_url)
              )
            `
            )
            .eq("user_id", users[0].id);

        if (notInterestedError) throw notInterestedError;

        // Transformer les données pour récupérer tous les UserEvent
        const interested = interestedData
          ? interestedData.flatMap((item) => item.events)
          : [];
        const notInterested = notInterestedData
          ? notInterestedData.flatMap((item) => item.events)
          : [];

        setInterestedEvents(interested);
        setNotInterestedEvents(notInterested);
      } catch (error) {
        console.error("Error fetching user interests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterests();
  }, [userId, users]);

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Non définie";
    try {
      return format(new Date(dateString), "PPP", { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-xl text-center">
                Vous devez être connecté pour voir vos intérêts
              </p>
              <Button asChild>
                <Link to="/login">Se connecter</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-6" />
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderEventList = (events: UserEvent[]) => {
    if (events.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          Aucun événement trouvé dans cette catégorie
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {event.image_url && (
                <div className="md:w-1/4 h-48 md:h-auto overflow-hidden">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge
                    variant={
                      event.status === "official" ? "default" : "outline"
                    }
                    className={
                      event.status === "official"
                        ? "bg-primary/90"
                        : "bg-white/80 text-black border-gray-300"
                    }
                  >
                    {event.status === "official" ? "Officiel" : "Non Officiel"}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 mb-3">
                  {event.description}
                </CardDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 opacity-70" />
                    <span>{formatDate(event.start_date)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 opacity-70" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 opacity-70" />
                    <span className="line-clamp-1">{event.contact}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border-2">
                      <AvatarImage src={event.users?.image_url || ""} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {event.users?.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      to={`/organizer/${event.users.id}`}
                      className="text-sm underline hover:text-primary"
                    >
                      {event.users?.full_name || "Utilisateur inconnu"}
                    </Link>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/events?id=${event.id}`}>Voir les détails</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Mes Intérêts</CardTitle>
          <CardDescription>
            Gestion de vos intérêts sur les événements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="grid w-full grid-cols-2 mb-4 border rounded-md overflow-hidden">
              <button
                className={`flex items-center justify-center gap-2 py-2 px-4 transition-colors ${
                  activeTab === "interested"
                    ? "bg-primary text-white"
                    : "bg-transparent hover:bg-muted"
                }`}
                onClick={() => setActiveTab("interested")}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Événements Intéressés ({interestedEvents.length})</span>
              </button>
              <button
                className={`flex items-center justify-center gap-2 py-2 px-4 transition-colors ${
                  activeTab === "not-interested"
                    ? "bg-primary text-white"
                    : "bg-transparent hover:bg-muted"
                }`}
                onClick={() => setActiveTab("not-interested")}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>
                  Événements Non Intéressés ({notInterestedEvents.length})
                </span>
              </button>
            </div>
            <div className="mt-4">
              {activeTab === "interested" && renderEventList(interestedEvents)}
              {activeTab === "not-interested" &&
                renderEventList(notInterestedEvents)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserInterests;
