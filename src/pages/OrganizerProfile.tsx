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
import { supabase } from "@/utils/supabaseClient";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Info, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

interface OrganizerUser {
  id: number;
  full_name: string;
  image_url: string | null;
  role: string;
  email: string;
}

function OrganizerProfile() {
  const { id } = useParams<{ id: string }>();
  const [organizer, setOrganizer] = useState<OrganizerUser | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizerProfile = async () => {
      setIsLoading(true);
      try {
        // Récupérer les informations du profil de l'organisateur
        const { data: userData, error: userError } = await supabase
          .from("accounts")
          .select("*")
          .eq("id", id)
          .eq("role", "organizer")
          .single();

        if (userError) throw userError;

        if (userData) {
          setOrganizer(userData);

          // Récupérer les événements créés par cet organisateur
          const { data: eventsData, error: eventsError } = await supabase
            .from("events")
            .select(
              `
              *,
              users:accounts(id, full_name, image_url)
            `
            )
            .eq("created_by", id)
            .order("created_at", { ascending: false });

          if (eventsError) throw eventsError;
          setEvents(eventsData || []);
        }
      } catch (error) {
        console.error("Error fetching organizer profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrganizerProfile();
    }
  }, [id]);

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Non définie";
    try {
      return format(new Date(dateString), "PPP", { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="pb-4">
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="mt-8">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Info className="h-12 w-12 text-muted-foreground" />
              <p className="text-xl text-center">
                Organisateur non trouvé ou inaccessible
              </p>
              <Button asChild>
                <Link to="/events">Retour aux événements</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profil Organisateur</CardTitle>
          <CardDescription>
            Informations sur l'organisateur et ses événements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={organizer.image_url || ""} />
              <AvatarFallback className="bg-primary text-white text-xl">
                {organizer.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{organizer.full_name}</h2>
            <Badge variant="outline" className="bg-primary/10">
              Organisateur
            </Badge>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Événements organisés</h3>
            {events.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Cet organisateur n'a pas encore créé d'événements.
              </p>
            ) : (
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
                        <CardTitle className="text-lg mb-2">
                          {event.title}
                        </CardTitle>
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
                              <span className="line-clamp-1">
                                {event.location}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 opacity-70" />
                            <span className="line-clamp-1">
                              {event.contact}
                            </span>
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/events?id=${event.id}`}>
                            Voir les détails
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrganizerProfile;
