
<script setup lang="ts">
import { t } from "../i18n";
import { onMounted, ref } from "vue";
import { getBands, type Band } from "../services/artists";

const bands = ref<Band[]>([]);
const searchTerm = ref("");
const loading = ref(false);
const errorMessage = ref("");

async function loadBands(search = "") {
  loading.value = true;
  errorMessage.value = "";

  try {
    bands.value = await getBands(search);
  } catch {
    errorMessage.value =
      t('bands.loadFailed');
  } finally {
    loading.value = false;
  }
}

function searchBands() {
  loadBands(searchTerm.value.trim());
}

onMounted(() => {
  loadBands();
});
</script>

<template>
  <main class="bands-page">
    <section class="bands-header">
      <div>
        <p class="eyebrow">FIND YOUR SOUND</p>
        <h1>{{ t('bands.title') }}</h1>
        <p class="intro">
          {{ t('bands.intro') }}
        </p>
      </div>

      <form class="search-form" @submit.prevent="searchBands">
        <input
          v-model="searchTerm"
          type="search"
          :placeholder="t('bands.searchPlaceholder')"
          :aria-label="t('bands.searchLabel')"
        />
        <button type="submit">{{ t('common.search') }}</button>
      </form>
    </section>

    <section class="bands-section">
      <div class="section-heading">
        <h2>{{ t('bands.all') }}</h2>
        <span v-if="!loading" class="result-count">
          {{ t('common.results', bands.length) }}
        </span>
      </div>

      <div v-if="loading" class="message">
        {{ t('bands.loading') }}
      </div>

      <div v-else-if="errorMessage" class="message error">
        {{ errorMessage }}
        <button class="retry-button" @click="searchBands">
          {{ t('common.retry') }}
        </button>
      </div>

      <div v-else-if="bands.length === 0" class="message">
        <h3>{{ t('bands.emptyTitle') }}</h3>
        <p>{{ t('common.emptyHint') }}</p>
      </div>

      <div v-else class="bands-grid">
        <article
          v-for="band in bands"
          :key="band.id"
          class="band-card"
        >
          <div class="band-image">
            <img
              v-if="band.image"
              :src="band.image"
              :alt="band.name || t('bands.fallbackAlt')"
            />
            <span v-else class="image-placeholder">
              {{ band.name?.charAt(0).toUpperCase() || "?" }}
            </span>
          </div>

          <div class="band-info">
            <h3>
              <RouterLink
                :to="band.slug ? `/bands/${band.slug}` : '/bands'"
                class="profile-link"
              >
                {{ band.name || t('bands.unknown') }}
              </RouterLink>
            </h3>

            <p v-if="band.bio" class="band-bio">
              {{ band.bio }}
            </p>
            <p v-else class="band-bio muted">
              {{ t('common.noBio') }}
            </p>

            <div v-if="band.genres?.length" class="genre-list">
              <span
                v-for="genre in band.genres ?? []"
                :key="genre.id"
                class="genre-tag"
              >
                {{ genre.name }}
              </span>
            </div>

            <div class="members">
              <h4>{{ t('bands.members') }}</h4>

              <ul v-if="band.members?.length">
                <li
                  v-for="member in band.members ?? []"
                  :key="member.id"
                >
                  <span>{{ member.artist?.name || t('bands.unknownMember') }}</span>
                  <span v-if="member.role" class="member-role">
                    {{ member.role }}
                  </span>
                </li>
              </ul>

              <p v-else class="muted">
                {{ t('bands.noMembers') }}
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.bands-page {
  min-height: 100vh;
  padding: 3rem max(1.5rem, calc((100% - 1120px) / 2));
  background: var(--color-bg);
  color: var(--color-text);
}

.bands-header {
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
h3,
h4 {
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
  width: min(100%, 420px);
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

.bands-section {
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

.bands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.band-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-surface);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.band-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgb(36 22 64 / 8%);
}

.band-image {
  display: grid;
  aspect-ratio: 16 / 10;
  place-items: center;
  overflow: hidden;
  background: var(--color-surface-2);
}

.band-image img {
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

.band-info {
  padding: 1.1rem;
}

.band-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.band-bio {
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
  color: var(--color-muted);
  opacity: 0.75;
}

.genre-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.genre-tag {
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: var(--color-surface-2);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
}

.members {
  padding-top: 0.9rem;
  border-top: 1px solid var(--color-divider);
}

.members h4 {
  margin: 0 0 0.65rem;
  font-size: 0.9rem;
}

.members ul {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.members li {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--color-text);
  font-size: 0.85rem;
}

.member-role {
  color: var(--color-muted);
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
  .bands-header {
    align-items: stretch;
    flex-direction: column;
  }

  .search-form {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .band-card {
    transition: none;
  }
}
</style>
