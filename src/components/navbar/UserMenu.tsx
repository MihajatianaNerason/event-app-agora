import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfileData } from "@/hooks/useUserProfile";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserAvatar } from "./UserAvatar";

interface UserMenuProps {
  userProfile: UserProfileData;
  onSignOut: () => void;
}

/**
 * Menu dropdown utilisateur avec options de navigation et déconnexion
 */
export function UserMenu({ userProfile, onSignOut }: UserMenuProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <UserAvatar userProfile={userProfile} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userProfile.fullName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userProfile.role === "organizer" && (
          <DropdownMenuItem onClick={() => navigate("/organizer/dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate("/organizer/profiles")}>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
