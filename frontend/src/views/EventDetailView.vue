
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { getEvent } from "../services/events";
import type { Event } from "../services/events";

const route = useRoute();

const event = ref<Event | null>(null);
const isLoading = ref(true);
const errorMessage = ref("");

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string | null): string {
  if (!value) return "Noch nicht bekannt";

  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function loadEvent(): Promise<void> {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    event.value = await getEvent(String(route.params.slug));
  } catch {
    errorMessage.value =
      "Die Veranstaltung konnte nicht geladen werden.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadEvent);
</script>

<template>
  <main class="event-detail-page">
    <div v-if="isLoading" class="state-message">
      Veranstaltung wird geladen ...
    </div>

    <div v-else-if="errorMessage" class="state-message error">
      {{ errorMessage }}
      <button class="back-button" @click="loadEvent">
        Erneut versuchen
      </button>
      <RouterLink to="/events" class="back-link">
        Zurück zu den Veranstaltungen
      </RouterLink>
    </div>

    <template v-else-if="event">
      <section class="event-hero">
        <img
          v-if="event.image"
          class="hero-image"
          :src="event.image"
          :alt="event.title"
        />

        <div v-else class="hero-placeholder">
          <span>INMOSHPIT</span>
        </div>

        <div class="hero-overlay"></div>

        <div class="hero-content">
          <RouterLink to="/events" class="back-link">
            ← Alle Veranstaltungen
          </RouterLink>

          <span class="event-type">
            {{ event.event_type === "festival" ? "Festival" : "Konzert" }}
          </span>

          <h1>{{ event.title }}</h1>

          <p class="hero-location">
            {{ event.venue.name }} · {{ event.venue.city }}
          </p>
        </div>
      </section>

      <div class="event-detail-content">
        <section class="event-main">
          <div class="event-section">
            <span class="eyebrow">ABOUT THE EVENT</span>
            <h2>Über die Veranstaltung</h2>

            <p v-if="event.description" class="description">
              {{ event.description }}
            </p>
            <p v-else class="muted">
              Für diese Veranstaltung wurde noch keine Beschreibung hinterlegt.
            </p>
          </div>

          <div class="event-section">
            <span class="eyebrow">LINE-UP</span>
            <h2>Acts & Künstler</h2>

            <div v-if="event.lineup?.length" class="lineup-list">
              <article
                v-for="entry in event.lineup"
                :key="entry.id"
                class="lineup-item"
              >
                <div class="lineup-position">
                  {{ String(entry.position + 1).padStart(2, "0") }}
                </div>

                <div class="lineup-info">
                  <RouterLink
                    v-if="entry.artist_slug"
                    :to="`/artists/${entry.artist_slug}`"
                    class="performer-name"
                  >
                    {{ entry.artist_name }}
                  </RouterLink>

                  <RouterLink
                    v-else-if="entry.band_slug"
                    :to="`/bands/${entry.band_slug}`"
                    class="performer-name"
                  >
                    {{ entry.band_name }}
                  </RouterLink>

                  <span v-else class="performer-name">
                    {{ entry.artist_name || entry.band_name || "Unbekannter Act" }}
                  </span>

                  <span v-if="entry.stage_name" class="performer-stage">
                    {{ entry.stage_name }}
                  </span>
                </div>

                <div class="performance-time">
                  <span>{{ formatTime(entry.performance_start) }}</span>
                </div>
              </article>
            </div>

            <p v-else class="muted">
              Das Line-up wurde noch nicht veröffentlicht.
            </p>
          </div>

          <div
            v-if="event.stages?.length"
            class="event-section"
          >
            <span class="eyebrow">VENUES & STAGES</span>
            <h2>Bühnen</h2>

            <div class="stages-grid">
              <article
                v-for="stage in event.stages"
                :key="stage.id"
                class="stage-card"
              >
                <h3>{{ stage.name }}</h3>
                <p v-if="stage.description">
                  {{ stage.description }}
                </p>
              </article>
            </div>
          </div>
        </section>

        <aside class="event-sidebar">
          <section class="info-card">
            <span class="eyebrow">EVENT INFORMATION</span>

            <div class="info-item">
              <span class="info-label">Datum</span>
              <strong>{{ formatDate(event.start_at) }}</strong>
            </div>

            <div class="info-item">
              <span class="info-label">Beginn</span>
              <strong>{{ formatTime(event.start_at) }} Uhr</strong>
            </div>

            <div v-if="event.end_at" class="info-item">
              <span class="info-label">Ende</span>
              <strong>{{ formatTime(event.end_at) }} Uhr</strong>
            </div>

            <div class="info-item">
              <span class="info-label">Veranstaltungsort</span>
              <strong>{{ event.venue.name }}</strong>
              <span>{{ event.venue.address }}</span>
              <span>
                {{ event.venue.postal_code }}
                {{ event.venue.city }}
              </span>
              <span>{{ event.venue.country }}</span>
            </div>

            <a
              v-if="event.venue.website"
              :href="event.venue.website"
              target="_blank"
              rel="noopener noreferrer"
              class="venue-link"
            >
              Website des Veranstaltungsorts →
            </a>
          </section>
        </aside>
      </div>
    </template>
  </main>
</template>

<style scoped>
.event-detail-page {
  min-height: 100%;
  color: var(--color-text);
}

.event-hero {
  position: relative;
  display: flex;
  min-height: 390px;
  align-items: end;
  overflow: hidden;
  padding: 3rem max(2rem, calc((100% - 1120px) / 2));
  background: #251b36;
  color: #ffffff;
}

.hero-image,
.hero-placeholder,
.hero-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-image {
  object-fit: cover;
}

.hero-placeholder {
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 75% 25%, #8c00ff88, transparent 35%),
    linear-gradient(135deg, #24103c, #450693);
}

.hero-placeholder span {
  color: #ffffff55;
  font-size: clamp(2rem, 7vw, 5rem);
  font-weight: 900;
  letter-spacing: 0.2em;
}

.hero-overlay {
  background: linear-gradient(
    0deg,
    #16101f 0%,
    #16101fbb 35%,
    #16101f20 100%
  );
}

.hero-content {
  position: relative;
  z-index: 1;
  width: min(1120px, 100%);
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 2rem;
  color: var(--color-on-media-accent);
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover {
  color: #ffffff;
}

.event-type {
  display: table;
  margin-bottom: 1rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.4rem;
  background: var(--color-surface);
  color: var(--color-brand-text);
  font-size: 0.8rem;
  font-weight: 800;
}

.event-hero h1 {
  margin: 0;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1.05;
  letter-spacing: -0.045em;
}

.hero-location {
  margin: 1rem 0 0;
  color: var(--color-on-media-muted);
  font-size: 1.1rem;
}

.event-detail-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 3rem;
  width: min(1120px, calc(100% - 3rem));
  margin: 0 auto;
  padding: 3.5rem 0 5rem;
}

.event-main {
  min-width: 0;
}

.event-section {
  margin-bottom: 3rem;
}

.eyebrow {
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.event-section h2 {
  margin: 0.5rem 0 1.5rem;
  font-size: 1.8rem;
  letter-spacing: -0.04em;
}

.description {
  color: var(--color-muted);
  line-height: 1.8;
  white-space: pre-line;
}

.muted {
  color: var(--color-faint);
  line-height: 1.7;
}

.lineup-list {
  border-top: 1px solid var(--color-divider);
}

.lineup-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--color-divider);
}

.lineup-position {
  color: var(--color-faint);
  font-size: 0.85rem;
  font-weight: 800;
}

.lineup-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.3rem;
}

.performer-name {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
  text-decoration: none;
}

a.performer-name:hover {
  color: var(--color-accent);
}

.performer-stage {
  color: var(--color-faint);
  font-size: 0.8rem;
}

.performance-time {
  color: var(--color-muted);
  font-size: 0.85rem;
  white-space: nowrap;
}

.stages-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.stage-card {
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-surface);
}

.stage-card h3 {
  margin: 0;
  font-size: 1rem;
}

.stage-card p {
  margin-bottom: 0;
  color: var(--color-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.event-sidebar {
  min-width: 0;
}

.info-card {
  position: sticky;
  top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-surface);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 1.5rem;
  color: var(--color-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.info-item strong {
  color: var(--color-text);
  font-size: 0.95rem;
}

.info-label {
  color: var(--color-faint);
  font-size: 0.8rem;
  font-weight: 700;
}

.venue-link {
  display: inline-block;
  margin-top: 1.5rem;
  color: var(--color-brand-text);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
}

.venue-link:hover {
  color: var(--color-accent);
}

.state-message {
  padding: 4rem 1rem;
  color: var(--color-muted);
  text-align: center;
}

.error {
  color: var(--color-error);
}

.back-button {
  display: block;
  margin: 1rem auto;
  padding: 0.6rem 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--color-primary);
  color: #ffffff;
  cursor: pointer;
}

@media (max-width: 800px) {
  .event-detail-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .info-card {
    position: static;
  }
}

@media (max-width: 550px) {
  .event-hero {
    min-height: 330px;
    padding: 2rem 1.25rem;
  }

  .event-detail-content {
    width: calc(100% - 2rem);
    padding-top: 2.5rem;
  }

  .stages-grid {
    grid-template-columns: 1fr;
  }
}
</style>
