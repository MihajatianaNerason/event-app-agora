import { useSignOut } from "@/hooks/useSignOut";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Logo } from "./navbar/Logo";
import { RoleBadge } from "./navbar/RoleBadge";
import { UserMenu } from "./navbar/UserMenu";

/**
 * Composant Navbar - Barre de navigation principale de l'application
 * Visible uniquement lorsque l'utilisateur est connecté
 */
export function Navbar() {
  const userProfile = useUserProfile();
  const { signOut } = useSignOut();

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto justify-between">
        {/* Logo Agora à gauche */}
        <Logo />

        {/* Section utilisateur à droite */}
        <div className="flex items-center gap-2">
          {/* Badge du rôle */}
          <RoleBadge role={userProfile.role} />

          {/* Menu utilisateur */}
          <UserMenu userProfile={userProfile} onSignOut={signOut} />
        </div>
      </div>
    </header>
  );
}
