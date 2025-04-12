import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/useSession";
import { useUsers } from "@/hooks/useUser";
import { supabase } from "@/utils/supabaseClient";
import { LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();
  // Récupération des infos utilisateur pour l'avatar
  const { data: currentSession } = useSession();
  const { data: users } = useUsers(currentSession?.session?.user.id);

  // Récupération de l'image de profil et du nom
  const userProfile = users?.[0];
  const userInitials = userProfile?.full_name
    ? userProfile.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  // Fonction de déconnexion
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto justify-between">
        {/* Logo Agora à gauche */}
        <Link to="/" className="font-bold text-xl">
          Agora
        </Link>

        {/* Avatar utilisateur à droite avec menu déroulant */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar>
                {userProfile?.image_url && (
                  <AvatarImage
                    src={userProfile.image_url}
                    alt={userProfile.full_name}
                  />
                )}
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {userProfile?.full_name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentSession?.session?.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
