import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileData } from "@/hooks/useUserProfile";

interface UserAvatarProps {
  userProfile: UserProfileData;
}

/**
 * Composant d'avatar utilisateur
 * Affiche l'image de profil ou les initiales du nom de l'utilisateur
 */
export function UserAvatar({ userProfile }: UserAvatarProps) {
  return (
    <Avatar>
      {userProfile.imageUrl && (
        <AvatarImage src={userProfile.imageUrl} alt={userProfile.fullName} />
      )}
      <AvatarFallback>{userProfile.initials}</AvatarFallback>
    </Avatar>
  );
}
