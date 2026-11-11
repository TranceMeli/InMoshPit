
<script setup lang="ts">
import { t } from "../i18n";
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="footer-content">
      <section class="footer-brand">
        <RouterLink to="/artists" class="footer-logo">
          InMoshPit
        </RouterLink>

        <p>
          Concert streaming platform
        </p>

        <p class="footer-description">
          {{ t('footer.description') }}
        </p>
      </section>

      <section class="footer-column">
        <h2>{{ t('footer.discover') }}</h2>
        <RouterLink to="/artists">Artists</RouterLink>
        <RouterLink to="/bands">Bands</RouterLink>
      </section>

      <section class="footer-column">
        <h2>{{ t('footer.information') }}</h2>
        <RouterLink to="/impressum">{{ t('footer.imprint') }}</RouterLink>
        <RouterLink to="/datenschutz">{{ t('footer.privacy') }}</RouterLink>
        <RouterLink to="/nutzungsbedingungen">
          {{ t('footer.terms') }}
        </RouterLink>
        <RouterLink to="/kontakt">{{ t('footer.contact') }}</RouterLink>
      </section>

      <section class="footer-column footer-address">
        <h2>{{ t('footer.contact') }}</h2>
        <p>{{ t('footer.demoName') }}</p>
        <p>Demoallee 404</p>
        <p>76199 Karlsruhe</p>
        <p>{{ t('footer.country') }}</p>
        <p class="demo-notice">{{ t('footer.demoNotice') }}</p>
        <a href="mailto:kontakt@example.invalid">
          kontakt@example.invalid
        </a>
      </section>
    </div>

    <div class="footer-bottom">
      <span>© {{ currentYear }} InMoshPit</span>
      <span>Made for music lovers.</span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: 3rem max(1.5rem, calc((100% - 1120px) / 2)) 1.25rem;
  background: var(--color-surface-2);
  border-top: 1px solid var(--color-border);
  color: var(--color-text);
}

.footer-content {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  gap: 2rem;
  padding-bottom: 2.5rem;
}

.footer-logo {
  color: var(--color-text);
  font-family: var(--font-display, "Cabinet Grotesk", sans-serif);
  font-size: 1.7rem;
  font-weight: 800;
  text-decoration: none;
}

.footer-brand > p:first-of-type {
  margin-top: 0.25rem;
  color: var(--color-accent);
  font-size: 0.85rem;
  font-weight: 600;
}

.footer-description {
  max-width: 280px;
  color: var(--color-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.footer-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.7rem;
}

.footer-column h2 {
  margin: 0 0 0.4rem;
  font-family: var(--font-display, "Cabinet Grotesk", sans-serif);
  font-size: 1rem;
}

.footer-column a {
  color: var(--color-muted);
  font-size: 0.875rem;
  text-decoration: none;
}

.footer-column a:hover {
  color: var(--color-accent);
}

.footer-address p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.footer-address .demo-notice {
  color: var(--color-warning);
  font-size: 0.75rem;
  font-weight: 700;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
  color: var(--color-faint);
  font-size: 0.8rem;
}

@media (max-width: 800px) {
  .footer-content {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .footer-content {
    grid-template-columns: 1fr;
  }

  .footer-bottom {
    flex-direction: column;
  }
}
</style>
