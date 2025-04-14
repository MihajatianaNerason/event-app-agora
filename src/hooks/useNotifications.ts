import { supabase } from "@/utils/supabaseClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Notification,
  notificationService,
} from "../services/notificationService";
import { useUserProfile } from "./useUserProfile";

export const useNotifications = () => {
  const { userId } = useUserProfile();
  const queryClient = useQueryClient();

  // Requête pour obtenir les notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => notificationService.getUserNotifications(userId || 0),
    enabled: !!userId,
  });

  // Calcul du nombre de notifications non lues
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Écoute des changements en temps réel
  useEffect(() => {
    if (!userId) return;

    // S'abonner aux changements de la table notifications
    const subscription = supabase
      .channel("notifications_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Realtime notification update:", payload);
          // Rafraîchir les données
          queryClient.invalidateQueries({
            queryKey: ["notifications", userId],
          });
        }
      )
      .subscribe();

    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);

  // Mutation pour marquer une notification comme lue
  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: (_, notificationId) => {
      // Mise à jour optimiste du cache
      queryClient.setQueryData<Notification[]>(
        ["notifications", userId],
        (old = []) =>
          old.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
      );
    },
  });

  // Mutation pour marquer toutes les notifications comme lues
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(userId || 0),
    onSuccess: () => {
      // Mise à jour optimiste du cache
      queryClient.setQueryData<Notification[]>(
        ["notifications", userId],
        (old = []) => old.map((n) => ({ ...n, is_read: true }))
      );
    },
  });

  // Mutation pour supprimer une notification
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: (_, notificationId) => {
      // Mise à jour optimiste du cache
      queryClient.setQueryData<Notification[]>(
        ["notifications", userId],
        (old = []) => old.filter((n) => n.id !== notificationId)
      );
    },
  });

  // Mutation pour supprimer toutes les notifications
  const deleteAllNotificationsMutation = useMutation({
    mutationFn: () => notificationService.deleteAllNotifications(userId || 0),
    onSuccess: () => {
      // Mise à jour optimiste du cache
      queryClient.setQueryData<Notification[]>(
        ["notifications", userId],
        () => []
      );
    },
  });

  return {
    notifications,
    unreadCount,
    loading: isLoading,
    markAsRead: (notificationId: number) =>
      markAsReadMutation.mutate(notificationId),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    deleteNotification: (notificationId: number) =>
      deleteNotificationMutation.mutate(notificationId),
    deleteAllNotifications: () => deleteAllNotificationsMutation.mutate(),
    refetch: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
  };
};
