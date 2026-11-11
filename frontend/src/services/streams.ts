import { api } from "./api";
import { intlLocale, t } from "../i18n";

export type StreamStatus = "scheduled" | "live" | "ended" | "cancelled";

export interface StreamPerformance {
  type: "artist" | "band";
  name: string;
  slug: string;
}

export interface Stream {
  id: number;
  title: string;
  slug: string;
  description: string;
  event: number;
  event_title: string;
  event_slug: string;
  venue_name: string;
  venue_city: string;
  status: StreamStatus;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  playback_url: string;
  thumbnail: string | null;
  is_public: boolean;
  performance?: StreamPerformance | null;
  recording?: number | null;
  recording_slug?: string | null;
}

export interface StreamListParams {
  status?: StreamStatus;
  event?: string;
  search?: string;
}

interface PaginatedResponse<T> {
  results: T[];
}

export async function getStreams(
  params: StreamListParams = {},
): Promise<Stream[]> {
  const response = await api.get<Stream[] | PaginatedResponse<Stream>>(
    "/streams/",
    { params },
  );
  const data = response.data;
  return Array.isArray(data) ? data : data.results;
}

export async function getStream(slug: string): Promise<Stream> {
  const response = await api.get<Stream>(`/streams/${slug}/`);
  return response.data;
}

export function statusLabel(status: StreamStatus): string {
  return t(`streams.status.${status}`);
}

export function formatStreamDate(value: string): string {
  return new Intl.DateTimeFormat(intlLocale(), {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
