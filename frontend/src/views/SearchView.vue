<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import AppIcon from "../components/AppIcon.vue";
import MediaCard, { type CardBadge } from "../components/MediaCard.vue";
import { t } from "../i18n";
import { getArtists, getBands, type Artist, type Band } from "../services/artists";
import { getEvents, type Event } from "../services/events";
import { getStreams, type Stream } from "../services/streams";
import { formatDuration, getVideos, type Video } from "../services/video";
import type { CoverInput } from "../utils/cover";
import { formatShortDateTime, joinVenue } from "../utils/format";

interface ResultCard {
  id: string;
  to: string;
  title: string;
  cover: CoverInput;
  image: string | null;
  badge: CardBadge | null;
  meta: string[];
}

interface Section {
  key: string;
  titleKey: string;
  items: ResultCard[];
}

const route = useRoute();

const term = computed(() => (typeof route.query.q === "string" ? route.query.q.trim() : ""));

const loading = ref(false);
const error = ref("");
const sections = ref<Section[]>([]);

let request = 0;

function streamCard(s: Stream): ResultCard {
  const live = s.status === "live";

  return {
    id: `stream-${s.id}`,
    to: `/streams/${s.slug}`,
    title: s.title,
    cover: { kind: "stream", seed: s.slug, status: s.status },
    image: s.thumbnail,
    badge: live
      ? { type: "live", text: t("streams.status.live") }
      : s.status === "scheduled"
        ? { type: "upcoming", text: formatShortDateTime(s.scheduled_at) }
        : { type: "info", text: t(`streams.status.${s.status}`) },
    meta: [s.event_title, joinVenue(s.venue_name, s.venue_city)],
  };
}

function videoCard(v: Video): ResultCard {
  return {
    id: `video-${v.id}`,
    to: `/videos/${v.slug}`,
    title: v.title,
    cover: { kind: "video", seed: v.slug },
    image: v.thumbnail ?? null,
    badge: { type: "duration", text: formatDuration(v.duration_seconds) },
    meta: [v.event_title, joinVenue(v.venue_name, v.venue_city)],
  };
}

function eventCard(e: Event): ResultCard {
  return {
    id: `event-${e.id}`,
    to: `/events/${e.slug}`,
    title: e.title,
    cover: { kind: "event", seed: e.slug, eventType: e.event_type },
    image: e.image,
    badge: {
      type: "info",
      text: e.event_type === "festival" ? t("common.festival") : t("common.concert"),
    },
    meta: [joinVenue(e.venue.name, e.venue.city), formatShortDateTime(e.start_at)],
  };
}

function artistCard(a: Artist): ResultCard {
  return {
    id: `artist-${a.id}`,
    to: `/artists/${a.slug}`,
    title: a.name,
    cover: { kind: "artist", seed: a.slug, genre: a.genres[0]?.name ?? null },
    image: a.image,
    badge: null,
    meta: a.genres.map((g) => g.name).slice(0, 2),
  };
}

function bandCard(b: Band): ResultCard {
  return {
    id: `band-${b.id}`,
    to: `/bands/${b.slug}`,
    title: b.name,
    cover: { kind: "band", seed: b.slug, genre: b.genres[0]?.name ?? null },
    image: b.image,
    badge: null,
    meta: b.genres.map((g) => g.name).slice(0, 2),
  };
}

async function search(q: string) {
  const current = ++request;

  if (!q) {
    sections.value = [];
    loading.value = false;
    error.value = "";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const [streams, videos, events, artists, bands] = await Promise.all([
      getStreams({ search: q }),
      getVideos({ search: q }),
      getEvents({ search: q }),
      getArtists(q),
      getBands(q),
    ]);

    // Eine neuere Suche hat Vorrang vor einer langsameren älteren Antwort.
    if (current !== request) {
      return;
    }

    sections.value = [
      { key: "streams", titleKey: "search.section.streams", items: streams.map(streamCard) },
      { key: "videos", titleKey: "search.section.videos", items: videos.map(videoCard) },
      { key: "events", titleKey: "search.section.events", items: events.map(eventCard) },
      { key: "artists", titleKey: "search.section.artists", items: artists.map(artistCard) },
      { key: "bands", titleKey: "search.section.bands", items: bands.map(bandCard) },
    ].filter((section) => section.items.length > 0);
  } catch {
    if (current === request) {
      error.value = t("search.loadFailed");
    }
  } finally {
    if (current === request) {
      loading.value = false;
    }
  }
}

watch(term, (q) => search(q), { immediate: true });
</script>

<template>
  <main class="search-page">
    <p v-if="!term" class="state">{{ t('search.prompt') }}</p>

    <template v-else>
      <h1>{{ t('search.title', { q: term }) }}</h1>

      <p v-if="loading" class="state" role="status">{{ t('search.loading') }}</p>

      <p v-else-if="error" class="state error" role="alert">{{ error }}</p>

      <div v-else-if="sections.length === 0" class="empty">
        <AppIcon name="search_off" size="3rem" />
        <h2>{{ t('search.empty', { q: term }) }}</h2>
        <p>{{ t('common.emptyHint') }}</p>
      </div>

      <template v-else>
        <section v-for="section in sections" :key="section.key" class="section">
          <h2>{{ t(section.titleKey) }}</h2>

          <div class="grid">
            <MediaCard
              v-for="item in section.items"
              :key="item.id"
              :to="item.to"
              :title="item.title"
              :cover="item.cover"
              :image="item.image"
              :badge="item.badge"
              :meta="item.meta"
            />
          </div>
        </section>
      </template>
    </template>
  </main>
</template>

<style scoped>
.search-page {
  padding: 1.25rem 1.5rem 3rem;
  color: var(--color-text);
}

h1 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
}

.section {
  margin-bottom: 2.25rem;
}

.section h2 {
  margin: 0 0 1rem;
  font-size: 1.15rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
  gap: 1.5rem 1rem;
}

.state {
  color: var(--color-muted);
}

.state.error {
  color: var(--color-error);
}

.empty {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  color: var(--color-muted);
  text-align: center;
}

.empty h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.15rem;
}

.empty p {
  margin: 0;
}
</style>
