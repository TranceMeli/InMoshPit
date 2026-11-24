<script setup lang="ts">
import { RouterLink } from "vue-router";

import type { CoverInput } from "../utils/cover";
import CoverTile from "./CoverTile.vue";

export interface CardBadge {
  type: "live" | "upcoming" | "info" | "duration";
  text: string;
}

/**
 * Karte im Stil einer Videoübersicht: 16:9-Vorschau (Bild oder Icon-Kachel),
 * Badge (LIVE, Termin, Dauer), Titel und bis zu drei Zeilen Details.
 */
defineProps<{
  to: string;
  title: string;
  cover: CoverInput;
  /** Hochgeladenes Bild; ohne Bild erscheint die Icon-Kachel. */
  image?: string | null;
  badge?: CardBadge | null;
  meta?: string[];
}>();
</script>

<template>
  <RouterLink :to="to" class="media-card">
    <div class="thumb">
      <img v-if="image" :src="image" alt="" loading="lazy" />
      <CoverTile v-else v-bind="cover" />

      <span
        v-if="badge"
        class="badge"
        :class="`badge--${badge.type}`"
        :data-testid="`badge-${badge.type}`"
      >
        <span v-if="badge.type === 'live'" class="dot" aria-hidden="true" />
        {{ badge.text }}
      </span>
    </div>

    <div class="body">
      <h3>{{ title }}</h3>
      <p v-for="line in meta ?? []" :key="line">{{ line }}</p>
    </div>
  </RouterLink>
</template>

<style scoped>
.media-card {
  display: block;
  min-width: 0;
  color: var(--color-text);
  text-decoration: none;
}

.media-card:hover {
  color: var(--color-text);
}

.thumb {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: var(--color-surface-2);
  border-radius: 0.75rem;
  transition: border-radius var(--transition);
}

.media-card:hover .thumb {
  border-radius: 0.25rem;
}

.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.15rem 0.55rem;
  color: #fff;
  background: #100b18cc;
  /* Dunkler Rand, damit Badges auf jeder Kachelfarbe erkennbar bleiben. */
  box-shadow: 0 0 0 2px #100b18;
  border-radius: 0.4rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.badge--live,
.badge--upcoming,
.badge--info {
  top: 0.55rem;
  left: 0.55rem;
}

.badge--duration {
  right: 0.55rem;
  bottom: 0.55rem;
  font-weight: 700;
  letter-spacing: 0;
}

.badge--live {
  color: var(--color-on-live);
  background: var(--color-live);
}

.badge--upcoming {
  color: var(--color-on-primary);
  background: var(--color-primary);
}

.dot {
  width: 0.45rem;
  height: 0.45rem;
  background: currentColor;
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.3;
  }
}

.body {
  padding-top: 0.65rem;
}

.body h3 {
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 0.25rem;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.body p {
  margin: 0.1rem 0 0;
  color: var(--color-muted);
  font-size: 0.8rem;
  line-height: 1.4;
}
</style>
