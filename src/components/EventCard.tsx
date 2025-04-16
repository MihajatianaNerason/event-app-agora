import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Event, EventStatus } from "@/features/organizer/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, MapPin, Phone } from "lucide-react";
import { EventVoting } from "./EventVoting";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
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
            className="bg-white/80 text-black border-gray-300 font-medium shadow-sm"
          >
            Non Officiel
          </Badge>
        );
      case EventStatus.OFFICIALL:
        return (
          <Badge
            variant="default"
            className="bg-primary/90 font-medium shadow-sm"
          >
            Officiel
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-secondary/90 font-medium shadow-sm"
          >
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="flex flex-col p-4 hover:bg-accent/10 transition-colors">
      {/* Content section */}
      <div className="flex-1 flex flex-col">
        {/* Header with title, badge */}
        <div className="flex items-start mb-2">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{event.title}</CardTitle>
            </div>
            {renderStatusBadge(event.status)}
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-4">
          {/* Image */}
          {event.image_url && (
            <div className="rounded-md overflow-hidden max-h-96">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <CardDescription className="text-sm text-foreground/90">
            {event.description}
          </CardDescription>

          {/* Event details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 opacity-70" />
              <div>
                <div>Début: {formatDate(event.start_date)}</div>
                <div>Fin: {formatDate(event.end_date)}</div>
              </div>
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
        </div>
      </div>

      {/* Vote footer */}
      <CardFooter className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center border-t">
        {/* Creator info */}
        <div className="flex items-center gap-2  self-start">
          <Avatar className="h-8 w-8 border-2">
            <AvatarImage src={event.users?.image_url || ""} />
            <AvatarFallback className="bg-blue-500 text-white">
              <span>{event.users?.full_name.charAt(0).toUpperCase()}</span>
            </AvatarFallback>
          </Avatar>
          <span className="text-sm  underline">
            {event.users?.full_name || "Utilisateur inconnu"}
          </span>
        </div>
        <EventVoting eventId={event.id} className="" />
      </CardFooter>
    </Card>
  );
}

export default EventCard;
