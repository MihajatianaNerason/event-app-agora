import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell } from "lucide-react";
import React from "react";
import { useNotifications } from "../hooks/useNotifications";

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const handleNotificationClick = (notificationId: number) => {
    markAsRead(notificationId);
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
      <DropdownMenuContent align="end" className="w-[350px] p-2">
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled className="text-muted-foreground">
            Aucune notification
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => markAllAsRead()}
              className="text-primary cursor-pointer border-b "
            >
              Marquer tout comme lu
            </DropdownMenuItem>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                className={`flex flex-col items-start gap-1 cursor-pointer ${
                  !notification.is_read ? "bg-accent" : ""
                }`}
              >
                <div className="font-medium text-violet-500">
                  {notification.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  {notification.message}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
