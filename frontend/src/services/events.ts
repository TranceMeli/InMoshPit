import { api } from "./api";

export interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  capacity: number | null;
  website: string;
}

export interface Stage {
  id: number;
  name: string;
  description: string;
}

export interface EventArtist {
  id: number;
  artist: number | null;
  artist_name: string | null;
  artist_slug: string | null;
  band: number | null;
  band_name: string | null;
  band_slug: string | null;
  stage: number | null;
  stage_name: string | null;
  performance_start: string | null;
  performance_end: string | null;
  position: number;
}

export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  event_type: "concert" | "festival";
  venue: Venue;
  start_at: string;
  end_at: string | null;
  image: string | null;
  status: "draft" | "published" | "cancelled";
  lineup_count?: number;
  stages?: Stage[];
  lineup?: EventArtist[];
  created_at?: string;
  updated_at?: string;
}

export interface EventListParams {
  search?: string;
  event_type?: "concert" | "festival";
  ordering?: string;
}

export async function getEvents(
  params?: EventListParams,
): Promise<Event[]> {
  const response = await api.get<Event[]>("/events/", { params });
  return response.data;
}

export async function getEvent(slug: string): Promise<Event> {
  const response = await api.get<Event>(`/events/${slug}/`);
  return response.data;
}
