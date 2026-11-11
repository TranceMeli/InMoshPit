
<script setup lang="ts">
import { t } from "../i18n";
import { onMounted, ref } from "vue";
import { getArtists, type Artist } from "../services/artists";

const artists = ref<Artist[]>([]);
const searchTerm = ref("");
const loading = ref(false);
const errorMessage = ref("");

async function loadArtists(search = "") {
  loading.value = true;
  errorMessage.value = "";

  try {
    artists.value = await getArtists(search);
  } catch {
    errorMessage.value = t('artists.loadFailed');
  } finally {
    loading.value = false;
  }
}

function searchArtists() {
  loadArtists(searchTerm.value.trim());
}

onMounted(() => {
  loadArtists();
});
</script>

<template>
  <main class="artists-page">
    <section class="artists-header">
      <div>
        <p class="eyebrow">DISCOVER YOUR NEXT SHOW</p>
        <h1>{{ t('artists.title') }}</h1>
        <p class="intro">
          {{ t('artists.intro') }}
        </p>
      </div>

      <form class="search-form" @submit.prevent="searchArtists">
        <input
          v-model="searchTerm"
          type="search"
          :placeholder="t('artists.searchPlaceholder')"
          :aria-label="t('artists.searchLabel')"
        />
        <button type="submit">{{ t('common.search') }}</button>
      </form>
    </section>

    <section class="artists-section">
      <div class="section-heading">
        <h2>{{ t('artists.all') }}</h2>
        <span v-if="!loading" class="result-count">
          {{ t('common.results', artists.length) }}
        </span>
      </div>

      <div v-if="loading" class="message">
        {{ t('artists.loading') }}
      </div>

      <div v-else-if="errorMessage" class="message error">
        {{ errorMessage }}
        <button class="retry-button" @click="searchArtists">
          {{ t('common.retry') }}
        </button>
      </div>

      <div v-else-if="artists.length === 0" class="message">
        <h3>{{ t('artists.emptyTitle') }}</h3>
        <p>{{ t('common.emptyHint') }}</p>
      </div>

      <div v-else class="artists-grid">
        <article
          v-for="artist in artists"
          :key="artist.id"
          class="artist-card"
        >
          <div class="artist-image">
            <img
              v-if="artist.image"
              :src="artist.image"
              :alt="artist.name || t('artists.fallbackAlt')"
            />
            <span v-else class="image-placeholder">
              {{ artist.name?.charAt(0).toUpperCase() || "?" }}
            </span>
          </div>

          <div class="artist-info">
            <h3>
              <RouterLink
                :to="`/artists/${artist.slug}`"
                class="profile-link"
              >
                {{ artist.name || t('artists.unknown') }}
              </RouterLink>
            </h3>

            <p v-if="artist.bio" class="artist-bio">
              {{ artist.bio }}
            </p>
            <p v-else class="artist-bio muted">
              {{ t('common.noBio') }}
            </p>

            <div v-if="artist.genres.length" class="genre-list">
              <span
                v-for="genre in artist.genres"
                :key="genre.id"
                class="genre-tag"
              >
                {{ genre.name }}
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.artists-page {
  min-height: 100vh;
  padding: 3rem max(1.5rem, calc((100% - 1120px) / 2));
  background: var(--color-bg);
  color: var(--color-text);
}

.artists-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 2rem;
  margin-bottom: 3rem;
}

.eyebrow {
  margin-bottom: 0.75rem;
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

h1,
h2,
h3 {
  font-family: var(--font-display, "Cabinet Grotesk", sans-serif);
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.5rem);
}

.intro {
  max-width: 560px;
  color: var(--color-muted);
  line-height: 1.6;
}

.search-form {
  display: flex;
  width: min(100%, 390px);
  gap: 0.5rem;
}

.search-form input {
  min-width: 0;
  flex: 1;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: inherit;
  font: inherit;
}

.search-form button,
.retry-button {
  padding: 0.85rem 1.2rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.search-form button:hover,
.retry-button:hover {
  background: var(--color-primary-hover);
}

.artists-section {
  border-top: 1px solid var(--color-divider);
  padding-top: 1.5rem;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-heading h2 {
  margin: 0;
  font-size: 1.6rem;
}

.result-count {
  color: var(--color-muted);
  font-size: 0.9rem;
}

.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1.25rem;
}

.artist-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-surface);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.artist-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgb(36 22 64 / 8%);
}

.artist-image {
  display: grid;
  aspect-ratio: 16 / 10;
  place-items: center;
  overflow: hidden;
  background: var(--color-surface-2);
}

.artist-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  color: var(--color-accent);
  font-family: var(--font-display, sans-serif);
  font-size: 4rem;
  font-weight: 800;
}

.artist-info {
  padding: 1.1rem;
}

.artist-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.artist-bio {
  display: -webkit-box;
  overflow: hidden;
  min-height: 3rem;
  margin: 0 0 1rem;
  color: var(--color-muted);
  line-height: 1.5;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.muted {
  opacity: 0.75;
}

.genre-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.genre-tag {
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: var(--color-surface-2);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
}

.message {
  padding: 3rem 1rem;
  border-radius: 0.75rem;
  background: var(--color-surface);
  color: var(--color-muted);
  text-align: center;
}

.message h3 {
  color: var(--color-text);
}

.error {
  color: var(--color-error);
}

.retry-button {
  display: block;
  margin: 1rem auto 0;
}

@media (max-width: 760px) {
  .artists-header {
    align-items: stretch;
    flex-direction: column;
  }

  .search-form {
    width: 100%;
  }
}

.profile-link {
  color: inherit;
  text-decoration: none;
}

.profile-link:hover {
  color: var(--color-accent);
}

@media (prefers-reduced-motion: reduce) {
  .artist-card {
    transition: none;
  }
}
</style>
