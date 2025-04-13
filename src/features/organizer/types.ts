// Define the EventStatus enum to match public.event_status in database
export enum EventStatus {
  DRAFT = "draft",
  OFFICIALL = "official",
}

export interface Event {
  id?: number;
  title: string;
  description: string;
  contact: string;
  status: EventStatus;
  date: Date | string | null;
  created_by: number;
  image_url?: string | null;
  location?: string | null;
  created_at?: Date | string;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  location: string;
  contact: string;
  eventImage?: FileList;
}

// Constants for event validation
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 1000;
