import { t } from "../i18n";

import { api } from "./api";

export interface VideoPerformance {
  type: "artist" | "band";
  name: string;
  slug: string;
}

export interface Video {
  id: number;
  title: string;
  slug: string;
  description: string;
  event: number;
  event_title: string;
  event_slug: string;
  venue_name: string;
  venue_city: string;
  source_file?: string | null;
  hls_playlist?: string | null;
  thumbnail?: string | null;
  duration_seconds?: number | null;
  status?: "draft" | "processing" | "published" | "archived";
  published_at?: string | null;
  performance?: VideoPerformance | null;
  created_at?: string;
  updated_at?: string;
}

export interface VideoListParams {
  search?: string;
  event?: string;
  ordering?: string;
}

interface PaginatedResponse<T> {
  results: T[];
}

function extractResults<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export async function getVideos(
  params: VideoListParams = {},
): Promise<Video[]> {
  const response = await api.get<Video[] | PaginatedResponse<Video>>(
    "/videos/",
    { params },
  );

  return extractResults(response.data);
}

export async function getVideo(slug: string): Promise<Video> {
  const response = await api.get<Video>(`/videos/${slug}/`);

  return response.data;
}

export function formatDuration(seconds?: number | null): string {
  if (seconds == null || seconds < 0) {
    return t("videos.unknownDuration");
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return [
      hours,
      String(minutes).padStart(2, "0"),
      String(remainingSeconds).padStart(2, "0"),
    ].join(":");
  }

  return [
    minutes,
    String(remainingSeconds).padStart(2, "0"),
  ].join(":");
}
