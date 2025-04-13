import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent } from "../services/eventService";
import { Event, EventFormData } from "../types";

interface CreateEventParams {
  eventData: EventFormData;
  userId: number;
}

/**
 * Hook for creating a new event using TanStack Query's useMutation
 * Automatically invalidates relevant queries after successful mutation
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation<Event, Error, CreateEventParams>({
    mutationFn: ({ eventData, userId }) => createEvent(eventData, userId),
    onSuccess: () => {
      // Invalidate events queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
