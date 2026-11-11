<script setup lang="ts">
import { placeName, t } from "../i18n";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";

import VideoPlayer from "../components/VideoPlayer.vue";
import {
  statusLabel,
  formatStreamDate,
  getStream,
  type Stream,
} from "../services/streams";

const route = useRoute();
const stream = ref<Stream | null>(null);
const loading = ref(true);
const error = ref("");
const now = ref(Date.now());

const slug = computed(() => String(route.params.slug));

let pollTimer: ReturnType<typeof setInterval> | undefined;
let clockTimer: ReturnType<typeof setInterval> | undefined;

const countdown = computed(() => {
  if (!stream.value || stream.value.status !== "scheduled") {
    return "";
  }

  const diff = new Date(stream.value.scheduled_at).getTime() - now.value;

  if (diff <= 0) {
    return t('streams.detail.startsSoon');
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [
    days > 0 ? t("streams.detail.days", days) : "",
    t("streams.detail.hours", hours),
    t("streams.detail.minutes", minutes),
    days === 0 ? t("streams.detail.seconds", seconds) : "",
  ].filter(Boolean);

  return t("streams.detail.startsIn", { time: parts.join(" ") });
});

async function loadStream(silent = false) {
  if (!silent) {
    loading.value = true;
  }

  try {
    stream.value = await getStream(slug.value);
    error.value = "";
  } catch {
    if (!silent) {
      error.value = t('streams.detail.loadFailed');
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStream();

  // Status regelmäßig aktualisieren, damit "geplant" -> "live" -> "beendet"
  // ohne manuelles Neuladen sichtbar wird.
  pollTimer = setInterval(() => {
    if (stream.value && stream.value.status !== "ended") {
      loadStream(true);
    }
  }, 15000);

  clockTimer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  clearInterval(pollTimer);
  clearInterval(clockTimer);
});
</script>

<template>
  <main class="stream-page">
    <div v-if="loading" class="page-state">{{ t('streams.detail.loading') }}</div>
    <div v-else-if="error || !stream" class="page-state error">
      {{ error || t('streams.detail.notFound') }}
    </div>

    <div v-else class="stream-layout">
      <VideoPlayer
        v-if="stream.status === 'live' && stream.playback_url"
        :key="stream.playback_url"
        :src="stream.playback_url"
        :title="stream.title"
      />

      <div v-else class="player-placeholder">
        <template v-if="stream.status === 'scheduled'">
          <span class="placeholder-title">{{ countdown }}</span>
          <span>{{ formatStreamDate(stream.scheduled_at) }}</span>
        </template>

        <template v-else-if="stream.status === 'live'">
          <span class="placeholder-title">{{ t('streams.detail.preparing') }}</span>
        </template>

        <template v-else-if="stream.status === 'ended'">
          <span class="placeholder-title">{{ t('streams.detail.endedTitle') }}</span>
          <RouterLink
            v-if="stream.recording_slug"
            :to="`/videos/${stream.recording_slug}`"
            class="recording-link"
          >
            {{ t('streams.detail.watchRecording') }}
          </RouterLink>
          <span v-else>{{ t('streams.detail.noRecording') }}</span>
        </template>

        <template v-else>
          <span class="placeholder-title">{{ t('streams.detail.cancelledTitle') }}</span>
        </template>
      </div>

      <div class="stream-info">
        <span class="status-badge" :class="stream.status">
          <span v-if="stream.status === 'live'" class="dot" />
          {{ statusLabel(stream.status) }}
        </span>

        <h1>{{ stream.title }}</h1>

        <div class="meta">
          <span v-if="stream.performance">{{ stream.performance.name }}</span>
          <RouterLink :to="`/events/${stream.event_slug}`">
            {{ stream.event_title }}
          </RouterLink>
          <span>
            {{ stream.venue_name
            }}<template v-if="stream.venue_city">
              · {{ placeName(stream.venue_city) }}</template
            >
          </span>
        </div>

        <p v-if="stream.description" class="description">
          {{ stream.description }}
        </p>

        <RouterLink to="/streams" class="back-link">{{ t('streams.detail.allStreams') }}</RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.stream-page {
  min-height: 100%;
  padding: 36px 24px 80px;
  color: var(--color-text);
  background: var(--color-bg);
}
.stream-layout,
.page-state {
  max-width: 960px;
  margin: 0 auto;
}
.page-state {
  color: var(--color-muted);
}
.page-state.error {
  color: var(--color-error);
}
.player-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  aspect-ratio: 16 / 9;
  padding: 24px;
  color: var(--color-muted);
  text-align: center;
  background: var(--color-surface-2);
  border-radius: 12px;
}
.placeholder-title {
  color: var(--color-text);
  font-size: clamp(1.1rem, 3vw, 1.6rem);
  font-weight: 800;
}
.recording-link {
  padding: 10px 18px;
  color: var(--color-on-primary);
  background: var(--color-primary);
  border-radius: 8px;
  font-weight: 700;
  text-decoration: none;
}
.stream-info {
  padding: 24px 0;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  color: var(--color-on-primary);
  background: var(--color-primary);
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.status-badge.live {
  background: var(--color-live);
  color: var(--color-on-live);
}
.dot {
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  50% {
    opacity: 0.3;
  }
}
h1 {
  margin: 14px 0 10px;
  font-size: clamp(1.6rem, 4vw, 2.3rem);
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: var(--color-muted);
  font-size: 0.9rem;
}
.meta a {
  color: var(--color-accent);
}
.description {
  margin: 18px 0;
  line-height: 1.7;
}
.back-link {
  display: inline-block;
  margin-top: 12px;
  padding: 10px 18px;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-weight: 700;
  text-decoration: none;
}
</style>
