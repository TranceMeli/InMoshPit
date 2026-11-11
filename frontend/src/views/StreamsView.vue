<script setup lang="ts">
import { placeName, t } from "../i18n";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import {
  statusLabel,
  formatStreamDate,
  getStreams,
  type Stream,
} from "../services/streams";

const streams = ref<Stream[]>([]);
const loading = ref(true);
const error = ref("");

let refreshTimer: ReturnType<typeof setInterval> | undefined;

const groups = computed(() => [
  {
    key: "live",
    title: t("streams.groupLive"),
    items: streams.value.filter((s) => s.status === "live"),
  },
  {
    key: "scheduled",
    title: t("streams.groupUpcoming"),
    items: streams.value.filter((s) => s.status === "scheduled"),
  },
  {
    key: "ended",
    title: t("streams.groupPast"),
    items: streams.value
      .filter((s) => s.status === "ended")
      .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at)),
  },
]);

async function loadStreams(silent = false) {
  if (!silent) {
    loading.value = true;
  }
  error.value = "";

  try {
    streams.value = await getStreams();
  } catch {
    if (!silent) {
      error.value = t('streams.loadFailed');
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStreams();
  refreshTimer = setInterval(() => loadStreams(true), 30000);
});

onBeforeUnmount(() => clearInterval(refreshTimer));
</script>

<template>
  <main class="streams-page">
    <section class="streams-hero">
      <span class="eyebrow">LIVE FROM THE PIT</span>
      <h1>{{ t('streams.heroTitle') }}</h1>
      <p>{{ t('streams.heroText') }}</p>
    </section>

    <div class="streams-content">
      <p v-if="loading" class="state-message">{{ t('streams.loading') }}</p>
      <p v-else-if="error" class="state-message error">{{ error }}</p>
      <p v-else-if="streams.length === 0" class="state-message">
        {{ t('streams.empty') }}
      </p>

      <template v-else>
        <section
          v-for="group in groups"
          v-show="group.items.length"
          :key="group.key"
          class="stream-group"
        >
          <h2>{{ group.title }}</h2>

          <div class="stream-grid">
            <RouterLink
              v-for="stream in group.items"
              :key="stream.id"
              :to="`/streams/${stream.slug}`"
              class="stream-card"
            >
              <div class="stream-thumb">
                <img
                  v-if="stream.thumbnail"
                  :src="stream.thumbnail"
                  :alt="t('streams.thumbnailAlt', { title: stream.title })"
                  loading="lazy"
                />
                <span v-else class="thumb-placeholder">IN MOSH PIT</span>
                <span class="status-badge" :class="stream.status">
                  <span v-if="stream.status === 'live'" class="dot" />
                  {{ statusLabel(stream.status) }}
                </span>
              </div>

              <div class="stream-body">
                <h3>{{ stream.title }}</h3>
                <p class="meta">{{ stream.event_title }}</p>
                <p class="meta">
                  {{ stream.venue_name
                  }}<template v-if="stream.venue_city">
                    · {{ placeName(stream.venue_city) }}</template
                  >
                </p>
                <p class="meta when">
                  {{ formatStreamDate(stream.scheduled_at) }}
                </p>
              </div>
            </RouterLink>
          </div>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped>
.streams-page {
  min-height: 100%;
  color: var(--color-text);
  background: var(--color-bg);
}
.streams-hero {
  padding: 56px max(6%, calc((100% - 1120px) / 2));
  background:
    radial-gradient(ellipse at 80% 20%, #ff3f7f33, transparent 45%),
    linear-gradient(120deg, var(--color-hero-from), var(--color-hero-to));
  color: var(--color-on-media);
}
.eyebrow {
  color: var(--color-on-media-accent);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}
.streams-hero h1 {
  margin: 14px 0;
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: 1.1;
}
.streams-hero p {
  margin: 0;
  color: var(--color-on-media-muted);
}
.streams-content {
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}
.state-message {
  color: var(--color-muted);
}
.state-message.error {
  color: var(--color-error);
}
.stream-group {
  margin-bottom: 48px;
}
.stream-group h2 {
  margin: 0 0 20px;
  font-size: 1.6rem;
}
.stream-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 28px 22px;
}
.stream-card {
  color: inherit;
  text-decoration: none;
  transition: transform 180ms ease;
}
.stream-card:hover {
  transform: translateY(-4px);
}
.stream-thumb {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: var(--color-surface-2);
  border-radius: 12px;
}
.stream-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--color-muted);
  font-weight: 800;
  letter-spacing: 0.14em;
}
.status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  color: var(--color-on-primary);
  background: #100b18cc;
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
.stream-body h3 {
  margin: 12px 0 6px;
  font-size: 1.05rem;
}
.meta {
  margin: 2px 0;
  color: var(--color-muted);
  font-size: 0.85rem;
}
.when {
  color: var(--color-accent);
}
</style>
