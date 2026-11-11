
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { getEvents } from "../services/events";
import type { Event } from "../services/events";

const events = ref<Event[]>([]);
const search = ref("");
const eventType = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

let searchTimeout: ReturnType<typeof setTimeout> | undefined;

const filteredEvents = computed(() => events.value);

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

async function loadEvents(): Promise<void> {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    events.value = await getEvents({
      search: search.value.trim() || undefined,
      event_type: eventType.value
        ? (eventType.value as "concert" | "festival")
        : undefined,
      ordering: "start_at",
    });
  } catch {
    errorMessage.value =
      "Die Veranstaltungen konnten nicht geladen werden. Bitte versuche es später erneut.";
  } finally {
    isLoading.value = false;
  }
}

function handleSearch(): void {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    loadEvents();
  }, 350);
}

watch(eventType, () => {
  loadEvents();
});

onMounted(() => {
  loadEvents();
});
</script>

<template>
  <main class="events-page">
    <section class="events-hero">
      <div class="hero-content">
        <span class="eyebrow">DISCOVER LIVE MUSIC</span>
        <h1>Find your next <span>live moment.</span></h1>
        <p>
          Entdecke Konzerte, Festivals und unvergessliche Live-Auftritte.
        </p>
      </div>
    </section>

    <section class="events-content">
      <div class="section-heading">
        <div>
          <span class="eyebrow">EXPLORE</span>
          <h2>Veranstaltungen</h2>
        </div>

        <span class="event-count">
          {{ filteredEvents.length }}
          {{ filteredEvents.length === 1 ? "Event" : "Events" }}
        </span>
      </div>

      <div class="event-filters">
        <div class="search-field">
          <span class="search-icon">⌕</span>
          <input
            v-model="search"
            type="search"
            placeholder="Nach Veranstaltungen suchen ..."
            aria-label="Veranstaltungen suchen"
            @input="handleSearch"
          />
        </div>

        <select
          v-model="eventType"
          aria-label="Veranstaltungstyp auswählen"
        >
          <option value="">Alle Veranstaltungen</option>
          <option value="concert">Konzerte</option>
          <option value="festival">Festivals</option>
        </select>
      </div>

      <div v-if="isLoading" class="state-message">
        Veranstaltungen werden geladen ...
      </div>

      <div v-else-if="errorMessage" class="state-message error">
        {{ errorMessage }}
        <button class="retry-button" @click="loadEvents">
          Erneut versuchen
        </button>
      </div>

      <div v-else-if="events.length === 0" class="state-message empty">
        <h3>Keine Veranstaltungen gefunden</h3>
        <p>Versuche einen anderen Suchbegriff oder Filter.</p>
      </div>

      <div v-else class="events-grid">
        <article
          v-for="event in filteredEvents"
          :key="event.id"
          class="event-card"
        >
          <RouterLink
            :to="`/events/${event.slug}`"
            class="event-image"
            :class="{ 'has-image': event.image }"
          >
            <img
              v-if="event.image"
              :src="event.image"
              :alt="event.title"
            />

            <div v-else class="image-placeholder">
              <span>INMOSHPIT</span>
            </div>

            <span class="event-type">
              {{ event.event_type === "festival" ? "Festival" : "Konzert" }}
            </span>
          </RouterLink>

          <div class="event-card-content">
            <span class="event-date">
              {{ formatDate(event.start_at) }}
            </span>

            <RouterLink
              :to="`/events/${event.slug}`"
              class="event-title"
            >
              {{ event.title }}
            </RouterLink>

            <p class="event-location">
              <span aria-hidden="true">⌖</span>
              {{ event.venue.name }}, {{ event.venue.city }}
            </p>

            <div class="event-card-footer">
              <span>
                {{ event.lineup_count ?? event.lineup?.length ?? 0 }}
                {{
                  (event.lineup_count ?? event.lineup?.length ?? 0) === 1
                    ? "Act"
                    : "Acts"
                }}
              </span>

              <RouterLink
                :to="`/events/${event.slug}`"
                class="details-link"
              >
                Details ansehen <span aria-hidden="true">→</span>
              </RouterLink>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.events-page {
  min-height: 100%;
  color: var(--color-text);
}

.events-hero {
  position: relative;
  overflow: hidden;
  padding: 5rem max(2rem, calc((100% - 1120px) / 2));
  background:
    radial-gradient(circle at 80% 20%, #8c00ff55, transparent 32%),
    linear-gradient(120deg, #24103c, #450693 65%, #7100c9);
  color: #ffffff;
}

.events-hero::after {
  position: absolute;
  right: -5rem;
  bottom: -12rem;
  width: 28rem;
  height: 28rem;
  border: 1px solid #ffffff25;
  border-radius: 50%;
  content: "";
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 700px;
}

.eyebrow {
  color: var(--color-on-media-accent);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.events-hero h1 {
  margin: 1rem 0;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1.05;
  letter-spacing: -0.045em;
}

.events-hero h1 span {
  color: var(--color-on-media-accent);
}

.events-hero p {
  max-width: 520px;
  color: var(--color-on-media-muted);
  font-size: 1.05rem;
  line-height: 1.7;
}

.events-content {
  width: min(1120px, calc(100% - 3rem));
  margin: 0 auto;
  padding: 3.5rem 0 5rem;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-heading h2 {
  margin: 0.4rem 0 0;
  font-size: 2rem;
  letter-spacing: -0.04em;
}

.event-count {
  color: var(--color-muted);
  font-size: 0.9rem;
}

.event-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-field {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  padding: 0 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-surface);
}

.search-icon {
  color: var(--color-muted);
  font-size: 1.5rem;
}

.search-field input {
  width: 100%;
  min-height: 3.25rem;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text);
  font: inherit;
}

.event-filters select {
  min-width: 210px;
  padding: 0 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
}

.event-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-surface);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px #24164012;
}

.event-image {
  position: relative;
  display: block;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: #251b36;
  text-decoration: none;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 250ms ease;
}

.event-card:hover .event-image img {
  transform: scale(1.04);
}

.image-placeholder {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  background:
    radial-gradient(circle at 70% 30%, #8c00ff88, transparent 35%),
    linear-gradient(135deg, #24103c, #450693);
}

.image-placeholder span {
  color: #ffffffaa;
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: 0.2em;
}

.event-type {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.4rem 0.7rem;
  border-radius: 0.4rem;
  background: var(--color-surface);
  color: var(--color-brand-text);
  font-size: 0.75rem;
  font-weight: 800;
}

.event-card-content {
  padding: 1.25rem;
}

.event-date {
  color: var(--color-accent);
  font-size: 0.8rem;
  font-weight: 700;
}

.event-title {
  display: block;
  margin: 0.5rem 0;
  color: var(--color-text);
  font-size: 1.2rem;
  font-weight: 800;
  text-decoration: none;
}

.event-title:hover,
.details-link:hover {
  color: var(--color-accent);
}

.event-location {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.event-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-divider);
  color: var(--color-muted);
  font-size: 0.8rem;
}

.details-link {
  color: var(--color-brand-text);
  font-weight: 700;
  text-decoration: none;
}

.state-message {
  padding: 3rem 1rem;
  border: 1px dashed var(--color-border);
  border-radius: 1rem;
  color: var(--color-muted);
  text-align: center;
}

.state-message h3 {
  margin: 0 0 0.5rem;
  color: var(--color-text);
}

.state-message p {
  margin: 0;
}

.error {
  color: var(--color-error);
}

.retry-button {
  display: block;
  margin: 1rem auto 0;
  padding: 0.6rem 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--color-primary);
  color: #ffffff;
  cursor: pointer;
  font: inherit;
}

@media (max-width: 900px) {
  .events-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .events-hero {
    padding: 3.5rem 1.5rem;
  }

  .events-content {
    width: min(100% - 2rem, 1120px);
    padding-top: 2.5rem;
  }

  .event-filters {
    flex-direction: column;
  }

  .event-filters select {
    min-height: 3.25rem;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }
}
</style>
