
<script setup lang="ts">
</script>

<template>
  <header class="site-header">
    <RouterLink to="/artists" class="brand">
      <span class="brand-name">InMoshPit</span>
      <span class="brand-tagline">Concert streaming platform</span>
    </RouterLink>

    <nav class="main-navigation" aria-label="Hauptnavigation">
      <RouterLink to="/streams">Live</RouterLink>
      <RouterLink to="/artists">Artists</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
      <RouterLink to="/register" class="register-link">
        Registrieren
      </RouterLink>
    <RouterLink to="/events">Events</RouterLink>
    <RouterLink to="/videos">Videos</RouterLink>

    </nav>
  </header>
</template>

<style scoped>
.site-header {
  min-height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 1rem max(1.5rem, calc((100% - 1120px) / 2));
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  color: var(--color-text);
  text-decoration: none;
}

.brand-name {
  font-family: var(--font-display, "Cabinet Grotesk", sans-serif);
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.brand-tagline {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.main-navigation {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.main-navigation a {
  color: var(--color-muted);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 180ms ease;
}

.main-navigation a:hover,
.main-navigation a.router-link-active {
  color: var(--color-accent);
}

.main-navigation .register-link {
  padding: 0.65rem 1rem;
  border-radius: 0.5rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.main-navigation .register-link:hover {
  background: var(--color-primary-hover);
  color: var(--color-on-primary);
}

@media (max-width: 600px) {
  .site-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 1rem;
  }

  .main-navigation {
    flex-wrap: wrap;
    gap: 1rem;
  }
}
</style>
