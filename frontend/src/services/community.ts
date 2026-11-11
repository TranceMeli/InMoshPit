
import { api } from "./api";

export interface VideoComment {
  id: number;
  username: string;
  user_display_name: string | null;
  video: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface VideoLikeResponse {
  liked: boolean;
  created?: boolean;
  deleted?: boolean;
}

export interface VideoViewPayload {
  watch_duration_seconds?: number;
  completed?: boolean;
}

export async function getComments(
  videoSlug: string,
): Promise<VideoComment[]> {
  const response = await api.get<VideoComment[]>(
    `/videos/${videoSlug}/comments/`,
  );

  return response.data;
}

export async function createComment(
  videoSlug: string,
  content: string,
): Promise<VideoComment> {
  const response = await api.post<VideoComment>(
    `/videos/${videoSlug}/comments/`,
    { content },
  );

  return response.data;
}

export async function deleteComment(
  commentId: number,
): Promise<void> {
  await api.delete(`/community/comments/${commentId}/`);
}

export async function likeVideo(
  videoSlug: string,
): Promise<VideoLikeResponse> {
  const response = await api.post(
    `/videos/${videoSlug}/like/`,
  );

  return response.data;
}

export async function unlikeVideo(
  videoSlug: string,
): Promise<VideoLikeResponse> {
  const response = await api.delete(
    `/videos/${videoSlug}/like/`,
  );

  return response.data;
}

export async function registerVideoView(
  videoSlug: string,
  payload: VideoViewPayload = {},
): Promise<void> {
  await api.post(
    `/videos/${videoSlug}/views/`,
    payload,
  );
}



export interface VideoLikeStatus {
  liked: boolean;
  like_count: number;
}

export async function getLikeStatus(
  videoSlug: string,
): Promise<VideoLikeStatus> {
  const response = await api.get<VideoLikeStatus>(
    `/videos/${videoSlug}/like/`,
  );

  return response.data;
}

