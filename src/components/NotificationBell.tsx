import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell } from "lucide-react";
import React from "react";
import { useNotifications } from "../hooks/useNotifications";

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const getNotificationStyles = (isRead: boolean, status: string) => {
    return cn(
      "flex flex-col items-start gap-1 cursor-pointer p-2 rounded-md transition-colors",
      {
        "bg-accent/50": !isRead,
        "hover:bg-accent/30": true,
        "border-l-4": !isRead,
        "border-l-green-500": !isRead && status === "official",
        "border-l-violet-500": !isRead && status !== "official",
      }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px] p-2 space-y-1">
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled className="text-muted-foreground">
            Aucune notification
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => markAllAsRead()}
              className="text-primary cursor-pointer border-b hover:bg-accent/50 font-medium"
            >
              Marquer tout comme lu
            </DropdownMenuItem>
            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={getNotificationStyles(
                    notification.is_read,
                    notification.event_status || "pending"
                  )}
                >
                  <div className="font-medium text-sm">
                    {notification.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {notification.message}
                  </div>
                  <div className="text-xs text-muted-foreground/75">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
