<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import MediaCard, { type CardBadge } from "../components/MediaCard.vue";
import { t } from "../i18n";
import { getStreams, type Stream } from "../services/streams";
import { formatDuration, getVideos, type Video } from "../services/video";
import type { CoverInput } from "../utils/cover";
import { formatShortDateTime, joinVenue } from "../utils/format";

type Filter = "all" | "live" | "upcoming" | "recordings";

interface FeedItem {
  id: string;
  group: Exclude<Filter, "all">;
  to: string;
  title: string;
  cover: CoverInput;
  image: string | null;
  badge: CardBadge;
  meta: string[];
}

const FILTERS: Filter[] = ["all", "live", "upcoming", "recordings"];

const streams = ref<Stream[]>([]);
const videos = ref<Video[]>([]);
const filter = ref<Filter>("all");
const loading = ref(true);
const error = ref("");

function streamItem(stream: Stream): FeedItem {
  const live = stream.status === "live";

  return {
    id: `stream-${stream.id}`,
    group: live ? "live" : "upcoming",
    to: `/streams/${stream.slug}`,
    title: stream.title,
    cover: { kind: "stream", seed: stream.slug, status: stream.status },
    image: stream.thumbnail,
    badge: live
      ? { type: "live", text: t("streams.status.live") }
      : { type: "upcoming", text: formatShortDateTime(stream.scheduled_at) },
    meta: [stream.event_title, joinVenue(stream.venue_name, stream.venue_city)],
  };
}

function videoItem(video: Video): FeedItem {
  return {
    id: `video-${video.id}`,
    group: "recordings",
    to: `/videos/${video.slug}`,
    title: video.title,
    cover: { kind: "video", seed: video.slug },
    image: video.thumbnail ?? null,
    badge: { type: "duration", text: formatDuration(video.duration_seconds) },
    meta: [video.event_title, joinVenue(video.venue_name, video.venue_city)],
  };
}

/** Reihenfolge: erst live, dann kommende Streams (nach Termin), dann Aufzeichnungen. */
const feed = computed<FeedItem[]>(() => {
  const live = streams.value.filter((s) => s.status === "live");
  const upcoming = streams.value
    .filter((s) => s.status === "scheduled")
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));

  return [...live, ...upcoming].map(streamItem).concat(videos.value.map(videoItem));
});

const visible = computed(() =>
  filter.value === "all" ? feed.value : feed.value.filter((item) => item.group === filter.value),
);

async function load() {
  loading.value = true;
  error.value = "";

  try {
    [streams.value, videos.value] = await Promise.all([getStreams(), getVideos()]);
  } catch {
    error.value = t("home.loadFailed");
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <main class="home">
    <div class="chips" role="group" :aria-label="t('home.filters')">
      <button
        v-for="item in FILTERS"
        :key="item"
        type="button"
        class="chip"
        :class="{ active: filter === item }"
        :aria-pressed="filter === item"
        @click="filter = item"
      >
        {{ t(`home.filter.${item}`) }}
      </button>
    </div>

    <p v-if="loading" class="state" role="status">{{ t('home.loading') }}</p>

    <div v-else-if="error" class="state error" role="alert">
      {{ error }}
      <button type="button" class="retry" @click="load">{{ t('common.retry') }}</button>
    </div>

    <p v-else-if="visible.length === 0" class="state">{{ t('home.empty') }}</p>

    <div v-else class="grid">
      <MediaCard
        v-for="item in visible"
        :key="item.id"
        :to="item.to"
        :title="item.title"
        :cover="item.cover"
        :image="item.image"
        :badge="item.badge"
        :meta="item.meta"
      />
    </div>
  </main>
</template>

<style scoped>
.home {
  padding: 1.25rem 1.5rem 3rem;
  color: var(--color-text);
}

.chips {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  /* Die Chips lassen sich wischen bzw. scrollen, der Balken stört nur. */
  scrollbar-width: none;
}

.chips::-webkit-scrollbar {
  display: none;
}

.chip {
  flex: none;
  padding: 0.4rem 0.9rem;
  color: var(--color-text);
  background: var(--color-surface-2);
  border: 0;
  border-radius: 0.6rem;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.chip:hover {
  background: var(--color-border);
}

.chip.active {
  color: var(--color-bg);
  background: var(--color-text);
  font-weight: 700;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
  gap: 1.75rem 1rem;
}

.state {
  color: var(--color-muted);
}

.state.error {
  color: var(--color-error);
}

.retry {
  margin-left: 0.75rem;
  padding: 0.35rem 0.9rem;
  color: var(--color-on-primary);
  background: var(--color-primary);
  border: 0;
  border-radius: 0.5rem;
  font: inherit;
  cursor: pointer;
}
</style>
