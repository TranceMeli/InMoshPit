
<script setup lang="ts">
import { placeName, t } from "../i18n";
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import {
  getVideos,
  formatDuration,
  type Video,
} from "../services/video";

const videos = ref<Video[]>([]);
const search = ref("");
const loading = ref(false);
const error = ref("");

async function loadVideos() {
  loading.value = true;
  error.value = "";

  try {
    videos.value = await getVideos({
      search: search.value.trim() || undefined,
      ordering: "-published_at",
    });
  } catch {
    error.value = t('videos.loadFailed');
  } finally {
    loading.value = false;
  }
}

onMounted(loadVideos);
</script>

<template>
  <main class="videos-page">
    <section class="videos-hero">
      <div class="hero-content">
        <span class="eyebrow">THE SOUND OF LIVE MUSIC</span>

        <h1>{{ t('videos.heroTitle') }}</h1>

        <p>
          {{ t('videos.heroText') }}
        </p>
      </div>
    </section>

    <section class="videos-content">
      <div class="section-heading">
        <div>
          <span class="eyebrow">DISCOVER</span>
          <h2>{{ t('videos.archive') }}</h2>
        </div>

        <span class="video-count">
          {{ t('videos.count', videos.length) }}
        </span>
      </div>

      <form class="search-form" @submit.prevent="loadVideos">
        <input
          v-model="search"
          type="search"
          :placeholder="t('videos.searchPlaceholder')"
          :aria-label="t('videos.searchLabel')"
        />

        <button type="submit" :disabled="loading">
          {{ t('common.search') }}
        </button>
      </form>

      <p v-if="loading" class="state-message">
        {{ t('videos.loading') }}
      </p>

      <p v-else-if="error" class="state-message error">
        {{ error }}
      </p>

      <p v-else-if="videos.length === 0" class="state-message">
        {{ t('videos.empty') }}
      </p>

      <div v-else class="video-grid">
        <RouterLink
          v-for="video in videos"
          :key="video.id"
          :to="`/videos/${video.slug}`"
          class="video-card"
        >
          <div class="thumbnail-wrapper">
            <img
              v-if="video.thumbnail"
              :src="video.thumbnail"
              :alt="t('videos.thumbnailAlt', { title: video.title })"
              class="thumbnail"
              loading="lazy"
            />

            <div v-else class="thumbnail-placeholder">
              <span>IN MOSH PIT</span>
            </div>

            <span class="duration">
              {{ formatDuration(video.duration_seconds) }}
            </span>
          </div>

          <div class="video-card-content">
            <h3>{{ video.title }}</h3>

            <p v-if="video.performance" class="performance">
              {{ video.performance.name }}
            </p>

            <p class="event-info">
              {{ video.event_title }}
            </p>

            <p class="venue-info">
              {{ video.venue_name }}
              <span v-if="video.venue_city">
                · {{ placeName(video.venue_city) }}
              </span>
            </p>
          </div>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.videos-page {
  min-height: 100%;
  background: var(--color-bg);
  color: var(--color-text);
}

.videos-hero {
  min-height: 300px;
  display: flex;
  align-items: center;
  padding: 64px max(6%, calc((100% - 1120px) / 2));
  background:
    radial-gradient(ellipse at 80% 20%, #ff3f7f33, transparent 45%),
    linear-gradient(120deg, var(--color-hero-from), var(--color-hero-to));
  color: var(--color-on-media);
}

.hero-content {
  max-width: 700px;
}

.eyebrow {
  color: var(--color-on-media-accent);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.videos-hero h1 {
  margin: 16px 0;
  font-size: clamp(2.3rem, 5vw, 4rem);
  line-height: 1.05;
}

.videos-hero p {
  max-width: 560px;
  color: var(--color-on-media-muted);
  font-size: 1.05rem;
  line-height: 1.7;
}

.videos-content {
  max-width: 1120px;
  margin: 0 auto;
  padding: 56px 24px 80px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
  margin-bottom: 28px;
}

.section-heading h2 {
  margin: 8px 0 0;
  font-size: 2rem;
}

.video-count {
  color: var(--color-muted);
  font-size: 0.9rem;
}

.search-form {
  display: flex;
  gap: 12px;
  margin-bottom: 36px;
}

.search-form input {
  flex: 1;
  min-width: 0;
  padding: 14px 16px;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font: inherit;
}

.search-form button {
  padding: 0 24px;
  color: var(--color-on-primary);
  background: var(--color-primary);
  border: 0;
  border-radius: 8px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.search-form button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px 22px;
}

.video-card {
  min-width: 0;
  color: inherit;
  text-decoration: none;
  transition: transform 180ms ease;
}

.video-card:hover {
  transform: translateY(-4px);
}

.thumbnail-wrapper {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: var(--color-surface-2);
  border-radius: 10px;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--color-accent);
  font-weight: 900;
  letter-spacing: 0.2em;
  background:
    radial-gradient(circle at 50% 50%, #8c00ff33, transparent 60%),
    var(--color-surface-2);
}

.duration {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 4px 7px;
  color: var(--color-on-primary);
  background: #100b18dd;
  border-radius: 4px;
  font-size: 0.75rem;
}

.video-card-content {
  padding: 14px 2px;
}

.video-card h3 {
  margin: 0 0 8px;
  font-size: 1.05rem;
  line-height: 1.4;
}

.performance {
  margin: 0 0 6px;
  color: var(--color-accent);
  font-weight: 700;
}

.event-info,
.venue-info {
  margin: 4px 0;
  color: var(--color-muted);
  font-size: 0.85rem;
}

.state-message {
  padding: 40px 0;
  color: var(--color-muted);
  text-align: center;
}

.error {
  color: var(--color-error);
}

@media (max-width: 850px) {
  .video-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .videos-hero {
    min-height: 260px;
    padding: 48px 24px;
  }

  .videos-content {
    padding: 40px 18px 60px;
  }

  .video-grid {
    grid-template-columns: 1fr;
  }

  .search-form {
    flex-direction: column;
  }

  .search-form button {
    min-height: 46px;
  }
}
</style>
