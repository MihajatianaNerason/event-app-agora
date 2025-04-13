import { supabase } from "@/utils/supabaseClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getEvents, getEventsByUser } from "../services/eventService";
import { Event, EventFormData } from "../types";

/**
 * Hook to fetch all events
 * Uses Tanstack Query for data fetching, caching, and automatic refetching
 */
export function useEvents() {
  return useQuery<Event[], Error>({
    queryKey: ["events"],
    queryFn: async () => {
      return getEvents();
    },
  });
}

/**
 * Hook to fetch events created by a specific user
 * @param userId The ID of the user who created the events
 * Uses Tanstack Query for data fetching, caching, and automatic refetching
 */
export function useEventsByUser(userId: number) {
  return useQuery<Event[], Error>({
    queryKey: ["events", "user", userId],
    queryFn: async () => {
      if (!userId) return [];
      return getEventsByUser(userId);
    },
    enabled: !!userId,
  });
}

export const useEvent = (eventId: number) => {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Événement non trouvé");
      return data as Event;
    },
    enabled: !!eventId,
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      eventData,
    }: {
      eventId: number;
      eventData: EventFormData;
    }) => {
      let imageUrl = null;

      // Si une nouvelle image est fournie, la télécharger d'abord
      if (eventData.eventImage?.length) {
        const file = eventData.eventImage[0];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `event-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("events")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("events").getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from("events")
        .update({
          title: eventData.title,
          description: eventData.description,
          start_date: eventData.start_date,
          end_date: eventData.end_date,
          location: eventData.location,
          contact: eventData.contact,
          status: eventData.status,
          ...(imageUrl && { image_url: imageUrl }),
        })
        .eq("id", eventId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event"] });
    },
  });
};
