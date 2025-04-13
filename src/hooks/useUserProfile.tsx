import { useSession } from "@/hooks/useSession";
import { useUsers } from "@/hooks/useUser";
import { useMemo } from "react";

export interface UserProfileData {
  fullName: string;
  email: string | undefined;
  imageUrl: string | undefined;
  role: "organizer" | "participant" | undefined;
  initials: string;
  userId: number | undefined;
}

export function useUserProfile(): UserProfileData {
  const { data: currentSession } = useSession();
  const { data: users } = useUsers(currentSession?.session?.user.id);

  const userProfile = users?.[0];
  const email = currentSession?.session?.user.email;

  // Calcul des initiales basées sur le nom complet
  const userInitials = useMemo(() => {
    if (!userProfile?.full_name) return "U";

    return userProfile.full_name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [userProfile?.full_name]);

  return {
    fullName: userProfile?.full_name || "",
    email,
    imageUrl: userProfile?.image_url,
    role: userProfile?.role as "organizer" | "participant" | undefined,
    initials: userInitials,
    userId: userProfile?.id ? Number(userProfile.id) : undefined,
  };
}
