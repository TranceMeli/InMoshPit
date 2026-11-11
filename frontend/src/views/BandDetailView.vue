
<script setup lang="ts">
import { t } from "../i18n";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getBand, type Band } from "../services/artists";

const route = useRoute();

const band = ref<Band | null>(null);
const loading = ref(true);
const errorMessage = ref("");

async function loadBand() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const slug = String(route.params.slug);
    band.value = await getBand(slug);
  } catch {
    errorMessage.value = t('bands.detail.notFound');
  } finally {
    loading.value = false;
  }
}

onMounted(loadBand);
</script>

<template>
  <main class="detail-page">
    <div v-if="loading" class="state-message">
      {{ t('bands.detail.loading') }}
    </div>

    <div v-else-if="errorMessage" class="state-message error">
      <h1>{{ t('bands.detail.notFoundTitle') }}</h1>
      <p>{{ errorMessage }}</p>
      <RouterLink to="/bands" class="back-link">
        {{ t('bands.detail.backToList') }}
      </RouterLink>
    </div>

    <template v-else-if="band">
      <RouterLink to="/bands" class="back-link">
        <span aria-hidden="true">←</span>
        {{ t('bands.all') }}
      </RouterLink>

      <section class="profile-header">
        <div class="profile-image">
          <img
            v-if="band.image"
            :src="band.image"
            :alt="band.name"
          />
          <span v-else class="image-placeholder">
            {{ band.name.charAt(0).toUpperCase() }}
          </span>
        </div>

        <div class="profile-heading">
          <p class="eyebrow">BAND PROFILE</p>
          <h1>{{ band.name }}</h1>

          <div v-if="band.genres.length" class="genre-list">
            <span
              v-for="genre in band.genres"
              :key="genre.id"
              class="genre-tag"
            >
              {{ genre.name }}
            </span>
          </div>

          <a
            v-if="band.website"
            :href="band.website"
            target="_blank"
            rel="noopener noreferrer"
            class="website-link"
          >
            {{ t('common.website') }}
          </a>
        </div>
      </section>

      <section class="profile-section">
        <h2>{{ t('bands.detail.about', { name: band.name }) }}</h2>

        <p v-if="band.bio" class="biography">
          {{ band.bio }}
        </p>
        <p v-else class="muted">
          {{ t('bands.detail.noBioLong') }}
        </p>
      </section>

      <section class="profile-section">
        <div class="section-heading">
          <h2>{{ t('bands.detail.bandMembers') }}</h2>
          <span class="member-count">
            {{ t('bands.detail.memberCount', band.members.length) }}
          </span>
        </div>

        <div v-if="band.members.length" class="members-grid">
          <article
            v-for="member in band.members"
            :key="member.id"
            class="member-card"
          >
            <div class="member-avatar">
              <span>
                {{ member.artist.name.charAt(0).toUpperCase() }}
              </span>
            </div>

            <div class="member-info">
              <RouterLink
                :to="`/artists/${member.artist.slug}`"
                class="member-name"
              >
                {{ member.artist.name }}
              </RouterLink>

              <p v-if="member.role" class="member-role">
                {{ member.role }}
              </p>
              <p v-else class="member-role">
                {{ t('bands.detail.memberRole') }}
              </p>

              <p v-if="member.joined_on" class="member-date">
                {{ t('bands.detail.since', { date: member.joined_on }) }}
              </p>
            </div>
          </article>
        </div>

        <p v-else class="muted">
          {{ t('bands.detail.noMembersLong') }}
        </p>
      </section>

      <section class="profile-section">
        <h2>{{ t('common.information') }}</h2>

        <div class="info-card">
          <span class="info-label">{{ t('common.genres') }}</span>
          <span v-if="band.genres.length">
            {{ band.genres.map((genre) => genre.name).join(", ") }}
          </span>
          <span v-else class="muted">{{ t('common.noGenres') }}</span>
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
.website-link:hover,
.member-name:hover {
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
h2,
h3 {
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
  color: var(--color-brand-text);
  font-size: 0.8rem;
  font-weight: 700;
}

.website-link {
  color: var(--color-brand-text);
  font-weight: 600;
  text-decoration: none;
}

.profile-section {
  max-width: 900px;
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

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.member-count {
  color: var(--color-muted);
  font-size: 0.85rem;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-surface);
}

.member-avatar {
  display: grid;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 50%;
  background: var(--color-surface-2);
  color: var(--color-accent);
  font-family: var(--font-display, sans-serif);
  font-size: 1.5rem;
  font-weight: 800;
}

.member-name {
  color: var(--color-text);
  font-weight: 700;
  text-decoration: none;
}

.member-role,
.member-date {
  margin: 0.25rem 0 0;
  color: var(--color-muted);
  font-size: 0.85rem;
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
