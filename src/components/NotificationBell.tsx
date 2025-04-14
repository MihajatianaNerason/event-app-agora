import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, Trash2, X } from "lucide-react";
import React from "react";
import { useNotifications } from "../hooks/useNotifications";

export const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const getNotificationStyles = (isRead: boolean, status: string) => {
    return cn(
      "flex flex-col items-start gap-1 cursor-pointer p-2 rounded-md transition-colors group relative",
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
            <div className="flex items-center justify-between px-2 py-1">
              <DropdownMenuItem
                onClick={() => markAllAsRead()}
                className="text-primary cursor-pointer hover:bg-accent/50 font-medium"
              >
                Marquer tout comme lu
              </DropdownMenuItem>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive/90"
                onClick={() => deleteAllNotifications()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={getNotificationStyles(
                    notification.is_read,
                    notification.event_status || "pending"
                  )}
                >
                  <div className="w-full">
                    <div
                      className="flex justify-between items-start"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {notification.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {notification.message}
                        </div>
                        <div className="text-xs text-muted-foreground/75">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            {
                              addSuffix: true,
                              locale: fr,
                            }
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
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
