import { supabase } from "@/utils/supabaseClient";
import { Event } from "../types";

/**
 * Fetches all events from the database
 * @returns Promise containing the list of events
 */
export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetches events created by a specific user
 * @param userId The ID of the user who created the events
 * @returns Promise containing the list of events created by the user
 */
export async function getEventsByUser(userId: number): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching events by user:", error);
    throw error;
  }

  return data || [];
}
