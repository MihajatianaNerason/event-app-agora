import { supabase } from "@/utils/supabaseClient";

export interface Notification {
  id: number;
  created_at: string;
  user_id: number;
  event_id: number;
  title: string;
  message: string;
  is_read: boolean;
  event_status: string;
}

export const notificationService = {
  async getUserNotifications(userId: number): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
        *,
        events!notifications_event_fk (
          status
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Transformer les données pour inclure le statut de l'événement
    return (data || []).map((notification) => ({
      ...notification,
      event_status: notification.events?.status || "pending",
    }));
  },

  async markAsRead(notificationId: number): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      throw error;
    }
  },

  async markAllAsRead(userId: number): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
  },

  async deleteNotification(notificationId: number): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      throw error;
    }
  },

  async deleteAllNotifications(userId: number): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
  },
};
