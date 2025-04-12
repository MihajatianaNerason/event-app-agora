import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: "organizer" | "participant" | undefined;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const isOrganizer = role === "organizer";

  return (
    <Badge variant={isOrganizer ? "secondary" : "outline"}>
      {isOrganizer ? "Organisateur" : "Participant"}
    </Badge>
  );
}
