import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Calendar, Mail, Pencil, Star, Ticket, User } from "lucide-react";
import { Link } from "react-router-dom";

function ProfilesUser() {
  const { fullName, email, imageUrl, initials, role } = useUserProfile();

  // Ces valeurs seront à connecter avec de vrais données plus tard
  const stats = {
    eventsParticipated: 0,
    upcomingEvents: 0,
    favoriteEvents: 0,
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profil Participant</span>
            <Badge variant="outline" className="capitalize">
              {role}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={imageUrl} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="space-y-4 w-full max-w-md">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Nom complet</span>
                </div>
                <div className="font-medium">{fullName}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <div className="font-medium">{email}</div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                <div className="text-center">
                  <div className="flex flex-col items-center">
                    <Ticket className="h-4 w-4 text-muted-foreground mb-1" />
                    <div className="text-2xl font-bold">
                      {stats.eventsParticipated}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Participations
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex flex-col items-center">
                    <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
                    <div className="text-2xl font-bold">
                      {stats.upcomingEvents}
                    </div>
                    <div className="text-xs text-muted-foreground">À venir</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex flex-col items-center">
                    <Star className="h-4 w-4 text-muted-foreground mb-1" />
                    <div className="text-2xl font-bold">
                      {stats.favoriteEvents}
                    </div>
                    <div className="text-xs text-muted-foreground">Favoris</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full max-w-md space-y-2">
              <Button variant="outline" asChild>
                <Link to="/profile/edit">
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier le profil
                </Link>
              </Button>
              <Button variant="default" asChild>
                <Link to="/events">
                  <Calendar className="h-4 w-4 mr-2" />
                  Parcourir les événements
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilesUser;
