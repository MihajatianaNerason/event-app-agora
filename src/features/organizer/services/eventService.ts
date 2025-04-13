import { supabase } from "@/utils/supabaseClient";
import { Event, EventFormData } from "../types";

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

/**
 * Creates a new event in the database
 * @param eventData The event data to create
 * @param userId The ID of the user creating the event
 * @returns Promise containing the created event
 */
export async function createEvent(
  eventData: EventFormData,
  userId: number
): Promise<Event> {
  // Upload image if provided
  let imageUrl = null;
  if (eventData.eventImage && eventData.eventImage.length > 0) {
    const file = eventData.eventImage[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExt}`;
    const filePath = `event-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("events")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading event image:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from("events").getPublicUrl(filePath);

    imageUrl = data.publicUrl;
  }

  // Create event in database
  const { data, error } = await supabase
    .from("events")
    .insert([
      {
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.start_date,
        end_date: eventData.end_date,
        location: eventData.location,
        contact: eventData.contact,
        status: eventData.status,
        created_by: userId,
        image_url: imageUrl,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating event:", error);
    throw error;
  }

  return data;
}
