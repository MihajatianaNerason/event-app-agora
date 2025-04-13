import { useQuery } from "@tanstack/react-query";
import { getEvents, getEventsByUser } from "../services/eventService";
import { Event } from "../types";

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
