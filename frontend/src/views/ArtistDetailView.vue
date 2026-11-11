
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getArtist, type Artist } from "../services/artists";

const route = useRoute();

const artist = ref<Artist | null>(null);
const loading = ref(true);
const errorMessage = ref("");

async function loadArtist() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const slug = String(route.params.slug);
    artist.value = await getArtist(slug);
  } catch {
    errorMessage.value =
      "Der Artist konnte nicht gefunden werden.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadArtist);
</script>

<template>
  <main class="detail-page">
    <div v-if="loading" class="state-message">
      Artist wird geladen ...
    </div>

    <div v-else-if="errorMessage" class="state-message error">
      <h1>Artist nicht gefunden</h1>
      <p>{{ errorMessage }}</p>
      <RouterLink to="/artists" class="back-link">
        Zurück zur Artist-Übersicht
      </RouterLink>
    </div>

    <template v-else-if="artist">
      <RouterLink to="/artists" class="back-link">
        <span aria-hidden="true">←</span>
        Alle Artists
      </RouterLink>

      <section class="profile-header">
        <div class="profile-image">
          <img
            v-if="artist.image"
            :src="artist.image"
            :alt="artist.name"
          />
          <span v-else class="image-placeholder">
            {{ artist.name.charAt(0).toUpperCase() }}
          </span>
        </div>

        <div class="profile-heading">
          <p class="eyebrow">ARTIST PROFILE</p>
          <h1>{{ artist.name }}</h1>

          <div v-if="artist.genres.length" class="genre-list">
            <span
              v-for="genre in artist.genres"
              :key="genre.id"
              class="genre-tag"
            >
              {{ genre.name }}
            </span>
          </div>

          <a
            v-if="artist.website"
            :href="artist.website"
            target="_blank"
            rel="noopener noreferrer"
            class="website-link"
          >
            Offizielle Website ↗
          </a>
        </div>
      </section>

      <section class="profile-section">
        <h2>Über {{ artist.name }}</h2>

        <p v-if="artist.bio" class="biography">
          {{ artist.bio }}
        </p>
        <p v-else class="muted">
          Für diesen Artist wurde noch keine Biografie hinterlegt.
        </p>
      </section>

      <section class="profile-section">
        <h2>Informationen</h2>

        <div class="info-card">
          <span class="info-label">Genres</span>
          <span v-if="artist.genres.length">
            {{ artist.genres.map((genre) => genre.name).join(", ") }}
          </span>
          <span v-else class="muted">Keine Genres hinterlegt</span>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.detail-page {
  min-height: 70vh;
  max-width: 1120px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
  color: var(--color-text);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  color: var(--color-muted);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover,
.website-link:hover {
  color: var(--color-accent);
}

.profile-header {
  display: grid;
  grid-template-columns: minmax(220px, 340px) 1fr;
  align-items: center;
  gap: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid var(--color-divider);
}

.profile-image {
  display: grid;
  aspect-ratio: 1;
  overflow: hidden;
  place-items: center;
  border-radius: 1rem;
  background: var(--color-surface-2);
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  color: var(--color-accent);
  font-family: var(--font-display, sans-serif);
  font-size: 8rem;
  font-weight: 800;
}

.eyebrow {
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

h1,
h2 {
  font-family: var(--font-display, "Cabinet Grotesk", sans-serif);
}

h1 {
  margin: 0 0 1.25rem;
  font-size: clamp(2.5rem, 6vw, 4rem);
}

h2 {
  margin: 0 0 1rem;
  font-size: 1.6rem;
}

.genre-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.genre-tag {
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  background: var(--color-surface-2);
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 700;
}

.website-link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.profile-section {
  max-width: 800px;
  padding: 2.5rem 0;
  border-bottom: 1px solid var(--color-divider);
}

.biography {
  color: var(--color-muted);
  line-height: 1.8;
  white-space: pre-line;
}

.muted {
  color: var(--color-muted);
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-surface);
}

.info-label {
  color: var(--color-muted);
  font-size: 0.8rem;
}

.state-message {
  padding: 5rem 1rem;
  color: var(--color-muted);
  text-align: center;
}

.state-message h1 {
  color: var(--color-text);
}

.error {
  color: var(--color-error);
}

@media (max-width: 700px) {
  .profile-header {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .profile-image {
    max-width: 280px;
  }
}
</style>
