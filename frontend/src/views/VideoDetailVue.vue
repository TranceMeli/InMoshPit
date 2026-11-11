
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";

import VideoPlayer from "../components/VideoPlayer.vue";

import {
  getVideo,
  type Video,
} from "../services/video";

import {
  createComment,
  getComments,
  getLikeStatus,
  likeVideo,
  unlikeVideo,
  registerVideoView,
  type VideoComment,
} from "../services/community";

const route = useRoute();

const video = ref<Video | null>(null);
const comments = ref<VideoComment[]>([]);
const commentText = ref("");

const loading = ref(true);
const submitting = ref(false);
const error = ref("");
const commentError = ref("");

const liked = ref(false);
const likeCount = ref(0);
const likeLoading = ref(false);

const isAuthenticated = computed(
  () => Boolean(sessionStorage.getItem("access")),
);

const videoSlug = computed(() => String(route.params.slug));

const playbackSeconds = ref(0);
const viewRegistered = ref(false);

const playbackUrl = computed(() => {
  return video.value?.hls_playlist || "";
});

async function loadVideo() {
  loading.value = true;
  error.value = "";

  try {
    video.value = await getVideo(videoSlug.value);

    await loadComments();

    if (isAuthenticated.value) {
      try {
        const status = await getLikeStatus(videoSlug.value);
        liked.value = status.liked;
        likeCount.value = status.like_count;
      } catch {
        // Die Videoseite bleibt auch bei einem Fehler
        // beim Laden des Like-Status verfügbar.
      }
    }
  } catch {
    error.value = "Das Konzertvideo konnte nicht geladen werden.";
  } finally {
    loading.value = false;
  }
}

async function loadComments() {
  comments.value = await getComments(videoSlug.value);
}

async function toggleLike() {
  if (!isAuthenticated.value || likeLoading.value) {
    return;
  }

  likeLoading.value = true;

  try {
    if (liked.value) {
      await unlikeVideo(videoSlug.value);
      liked.value = false;
      likeCount.value = Math.max(0, likeCount.value - 1);
    } else {
      await likeVideo(videoSlug.value);
      liked.value = true;
      likeCount.value += 1;
    }
  } catch {
    error.value = "Deine Like-Aktion konnte nicht gespeichert werden.";
  } finally {
    likeLoading.value = false;
  }
}

async function submitComment() {
  const content = commentText.value.trim();

  if (!content || submitting.value) {
    return;
  }

  submitting.value = true;
  commentError.value = "";

  try {
    const comment = await createComment(
      videoSlug.value,
      content,
    );

    comments.value.push(comment);
    commentText.value = "";
  } catch {
    commentError.value =
      "Dein Kommentar konnte nicht veröffentlicht werden.";
  } finally {
    submitting.value = false;
  }
}

function updatePlaybackProgress(seconds: number) {
  playbackSeconds.value = seconds;
}

async function handlePlaybackEnded() {
  if (viewRegistered.value) {
    return;
  }

  viewRegistered.value = true;

  try {
    await registerVideoView(videoSlug.value, {
      watch_duration_seconds: playbackSeconds.value,
      completed: true,
    });
  } catch {
    viewRegistered.value = false;
  }
}

function commentName(comment: VideoComment) {
  return comment.user_display_name || comment.username || "?";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

onMounted(loadVideo);
</script>

<template>
  <main class="video-detail-page">
    <div v-if="loading" class="page-state">
      Konzertvideo wird geladen ...
    </div>

    <div v-else-if="error && !video" class="page-state error">
      {{ error }}
    </div>

    <template v-else-if="video">
      <div class="video-layout">
        <section class="main-column">
          <VideoPlayer
            v-if="playbackUrl"
            :src="playbackUrl"
            :title="video.title"
            @progress="updatePlaybackProgress"
            @ended="handlePlaybackEnded"
          />

          <div v-else class="player-placeholder">
            <span>VIDEO NOCH NICHT VERFÜGBAR</span>
          </div>

          <div class="video-information">
            <span class="eyebrow">CONCERT ARCHIVE</span>

            <h1>{{ video.title }}</h1>

            <div class="video-meta">
              <span v-if="video.performance">
                {{ video.performance.name }}
              </span>

              <span>{{ video.event_title }}</span>
            </div>

            <div class="video-actions">
              <button
                class="like-button"
                :class="{ active: liked }"
                :disabled="!isAuthenticated || likeLoading"
                @click="toggleLike"
              >
                <span>{{ liked ? "♥" : "♡" }}</span>
                {{ likeCount }}
                {{ liked ? "Gefällt dir" : "Gefällt mir" }}
              </button>

              <span v-if="!isAuthenticated" class="login-hint">
                <RouterLink to="/login">
                  Anmelden
                </RouterLink>
                zum Liken
              </span>
            </div>

            <div class="description-card">
              <h2>Über dieses Konzert</h2>

              <p v-if="video.description">
                {{ video.description }}
              </p>

              <p v-else class="muted">
                Für dieses Konzert gibt es noch keine Beschreibung.
              </p>

              <div class="event-details">
                <div>
                  <span>Event</span>
                  <RouterLink :to="`/events/${video.event_slug}`">
                    {{ video.event_title }}
                  </RouterLink>
                </div>

                <div>
                  <span>Veranstaltungsort</span>
                  <strong>
                    {{ video.venue_name }}
                    <template v-if="video.venue_city">
                      · {{ video.venue_city }}
                    </template>
                  </strong>
                </div>

                <div v-if="video.published_at">
                  <span>Veröffentlicht</span>
                  <strong>{{ formatDate(video.published_at) }}</strong>
                </div>
              </div>
            </div>
          </div>

          <section class="comments-section">
            <div class="comments-heading">
              <h2>Kommentare</h2>
              <span>{{ comments.length }}</span>
            </div>

            <form
              v-if="isAuthenticated"
              class="comment-form"
              @submit.prevent="submitComment"
            >
              <textarea
                v-model="commentText"
                placeholder="Was denkst du über diesen Auftritt?"
                maxlength="5000"
                rows="3"
              />

              <div class="comment-form-footer">
                <span>{{ commentText.length }}/5000</span>

                <button
                  type="submit"
                  :disabled="!commentText.trim() || submitting"
                >
                  {{ submitting ? "Wird veröffentlicht ..." : "Kommentieren" }}
                </button>
              </div>

              <p v-if="commentError" class="error">
                {{ commentError }}
              </p>
            </form>

            <div v-else class="login-prompt">
              <RouterLink to="/login">Melde dich an</RouterLink>,
              um einen Kommentar zu schreiben.
            </div>

            <div v-if="comments.length" class="comment-list">
              <article
                v-for="comment in comments"
                :key="comment.id"
                class="comment"
              >
                <div class="comment-avatar">
                  {{ commentName(comment).charAt(0).toUpperCase() }}
                </div>

                <div class="comment-content">
                  <div class="comment-header">
                    <strong>{{ commentName(comment) }}</strong>
                    <time>{{ formatDate(comment.created_at) }}</time>
                  </div>

                  <p>{{ comment.content }}</p>
                </div>
              </article>
            </div>

            <p v-else class="empty-comments">
              Noch keine Kommentare. Sei die erste Person, die etwas schreibt!
            </p>
          </section>
        </section>

        <aside class="sidebar">
          <div class="sidebar-card">
            <span class="eyebrow">KEEP DISCOVERING</span>
            <h2>Mehr Live-Musik entdecken</h2>
            <p>
              Finde weitere Auftritte und entdecke neue Künstler.
            </p>

            <RouterLink to="/videos" class="back-link">
              Alle Videos ansehen
            </RouterLink>

            <RouterLink to="/artists" class="back-link secondary">
              Künstler entdecken
            </RouterLink>
          </div>
        </aside>
      </div>
    </template>
  </main>
</template>

<style scoped>
.video-detail-page {
  min-height: 100%;
  padding: 36px 24px 80px;
  color: var(--color-text);
  background: var(--color-bg);
}

.video-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 32px;
  max-width: 1120px;
  margin: 0 auto;
}

.main-column {
  min-width: 0;
}

.player-placeholder {
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  color: var(--color-muted);
  background: var(--color-surface-2);
  border-radius: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.video-information {
  padding: 28px 0;
}

.eyebrow {
  color: var(--color-accent);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.15em;
}

h1 {
  margin: 10px 0;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  line-height: 1.15;
}

.video-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.video-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 22px;
}

.like-button {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 16px;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font: inherit;
  cursor: pointer;
}

.like-button span {
  font-size: 1.2rem;
}

.like-button.active {
  color: var(--color-error);
  border-color: var(--color-error);
}

.like-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-hint,
.login-prompt {
  color: var(--color-muted);
  font-size: 0.85rem;
}

.login-hint a,
.login-prompt a {
  color: var(--color-accent);
}

.description-card,
.sidebar-card {
  padding: 22px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.description-card {
  margin-top: 26px;
}

.description-card h2,
.comments-heading h2 {
  margin: 0 0 12px;
  font-size: 1.2rem;
}

.description-card p {
  color: var(--color-muted);
  line-height: 1.7;
  white-space: pre-line;
}

.muted {
  color: var(--color-faint) !important;
}

.event-details {
  display: grid;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-divider);
}

.event-details div {
  display: grid;
  gap: 5px;
}

.event-details span {
  color: var(--color-muted);
  font-size: 0.8rem;
}

.event-details strong,
.event-details a {
  color: var(--color-text);
  font-size: 0.9rem;
}

.event-details a {
  text-decoration: none;
}

.comments-section {
  margin-top: 36px;
}

.comments-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.comments-heading span {
  padding: 3px 9px;
  color: var(--color-muted);
  background: var(--color-surface-2);
  border-radius: 20px;
  font-size: 0.8rem;
}

.comment-form {
  padding: 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.comment-form textarea {
  width: 100%;
  resize: vertical;
  color: var(--color-text);
  background: transparent;
  border: 0;
  outline: none;
  font: inherit;
}

.comment-form textarea::placeholder {
  color: var(--color-faint);
}

.comment-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-divider);
}

.comment-form-footer span {
  color: var(--color-muted);
  font-size: 0.8rem;
}

.comment-form-footer button {
  padding: 9px 16px;
  color: var(--color-on-primary);
  background: var(--color-primary);
  border: 0;
  border-radius: 7px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.comment-form-footer button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-list {
  display: grid;
  gap: 20px;
  margin-top: 26px;
}

.comment {
  display: flex;
  gap: 14px;
}

.comment-avatar {
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: var(--color-on-primary);
  background: var(--color-primary);
  border-radius: 50%;
  font-weight: 800;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.comment-header time {
  color: var(--color-faint);
  font-size: 0.78rem;
}

.comment-content p {
  margin: 8px 0 0;
  color: var(--color-muted);
  line-height: 1.6;
  white-space: pre-line;
}

.empty-comments {
  margin-top: 24px;
  color: var(--color-muted);
}

.login-prompt {
  padding: 16px;
  background: var(--color-surface);
  border-radius: 8px;
}

.sidebar {
  padding-top: 40px;
}

.sidebar-card {
  position: sticky;
  top: 24px;
}

.sidebar-card h2 {
  margin: 14px 0 8px;
  font-size: 1.3rem;
}

.sidebar-card p {
  color: var(--color-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.back-link {
  display: block;
  margin-top: 20px;
  padding: 11px 14px;
  color: var(--color-on-primary);
  background: var(--color-primary);
  border-radius: 7px;
  text-align: center;
  text-decoration: none;
  font-weight: 700;
}

.back-link.secondary {
  margin-top: 10px;
  color: var(--color-text);
  background: var(--color-surface-2);
}

.page-state {
  max-width: 1120px;
  margin: 100px auto;
  color: var(--color-muted);
  text-align: center;
}

.error {
  color: var(--color-error);
}

@media (max-width: 850px) {
  .video-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    padding-top: 0;
  }

  .sidebar-card {
    position: static;
  }
}

@media (max-width: 560px) {
  .video-detail-page {
    padding: 20px 14px 60px;
  }

  .description-card {
    padding: 18px;
  }
}
</style>
