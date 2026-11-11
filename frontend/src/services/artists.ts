
import { api } from "./api";

// Genres

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

// Artists

export interface ArtistSummary {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}

export interface Artist {
  id: number;
  name: string;
  slug: string;
  bio: string;
  image: string | null;
  genres: Genre[];
  website: string;
  created_at: string;
}

// Bands

export interface BandMember {
  id: number;
  artist: ArtistSummary;
  role: string;
  joined_on: string | null;
  left_on: string | null;
}

export interface Band {
  id: number;
  name: string;
  slug: string;
  bio: string;
  image: string | null;
  genres: Genre[];
  website: string;
  members: BandMember[];
  created_at: string;
}

// API functions

export async function getArtists(search?: string): Promise<Artist[]> {
  const response = await api.get<Artist[]>("/artists/", {
    params: search ? { search } : {},
  });

  return response.data;
}

export async function getArtist(slug: string): Promise<Artist> {
  const response = await api.get<Artist>(`/artists/${slug}/`);

  return response.data;
}

export async function getBands(search?: string): Promise<Band[]> {
  const response = await api.get<Band[]>("/bands/", {
    params: search ? { search } : {},
  });

  return response.data;
}

export async function getBand(slug: string): Promise<Band> {
  const response = await api.get<Band>(`/bands/${slug}/`);

  return response.data;
}

export async function getGenres(search?: string): Promise<Genre[]> {
  const response = await api.get<Genre[]>("/genres/", {
    params: search ? { search } : {},
  });

  return response.data;
}
