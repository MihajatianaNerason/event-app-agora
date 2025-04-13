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
import { Calendar, MapPin, Phone, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  const handleVote = (direction: "up" | "down") => {
    if (userVote === direction) {
      // Annulation du vote
      setUserVote(null);
      setVotes(direction === "up" ? votes - 1 : votes + 1);
    } else {
      // Changement ou ajout de vote
      setUserVote(direction);
      if (userVote) {
        // Changement de direction (2 points de différence)
        setVotes(direction === "up" ? votes + 2 : votes - 2);
      } else {
        // Nouveau vote
        setVotes(direction === "up" ? votes + 1 : votes - 1);
      }
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
          <div className="flex-1">
            {renderStatusBadge(event.status)}
            <CardTitle className="mt-1.5 text-xl">{event.title}</CardTitle>
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
      <CardFooter className="flex justify-between items-center mt-4 pt-4 border-t">
        <div className="flex items-center gap-1">
          <span
            className={`text-sm font-semibold ${
              userVote === "up"
                ? "text-primary"
                : userVote === "down"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {votes}
          </span>
          <span className="text-xs text-muted-foreground ml-1">votes</span>
        </div>
        <div className="flex gap-4">
          <button
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-primary/10 transition-colors ${
              userVote === "up"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground"
            }`}
            onClick={() => handleVote("up")}
          >
            <ThumbsUp size={16} />
            <span>Intéressant</span>
          </button>
          <button
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-destructive/10 transition-colors ${
              userVote === "down"
                ? "text-destructive bg-destructive/10"
                : "text-muted-foreground"
            }`}
            onClick={() => handleVote("down")}
          >
            <ThumbsDown size={16} />
            <span>Non intéressant</span>
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default EventCard;
