<script setup lang="ts">
import { computed } from "vue";

import { coverFor, type CoverInput } from "../utils/cover";
import AppIcon from "./AppIcon.vue";

/**
 * Kachel mit Icon statt Bild. Füllt den Elterncontainer und skaliert das Icon
 * mit dessen Größe (Container Queries), egal ob Karte, Profilbild oder Banner.
 */
const props = defineProps<CoverInput>();

const cover = computed(() => coverFor(props));
</script>

<template>
  <div class="cover" :class="`cover--${cover.palette}`" aria-hidden="true">
    <AppIcon :name="cover.icon" filled size="min(46cqw, 64cqh)" />
  </div>
</template>

<style scoped>
.cover {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  container-type: size;
  /* Die Farben sind Teil der Marke und bleiben in beiden Themes gleich. */
  background: var(--cover-bg);
  color: var(--cover-fg);
}

.cover--violet {
  --cover-bg: #450693;
  --cover-fg: #ffc400;
}

.cover--pink {
  --cover-bg: #ff3f7f;
  --cover-fg: #241640;
}

.cover--amber {
  --cover-bg: #ffc400;
  --cover-fg: #450693;
}

.cover--dark {
  --cover-bg: #24103c;
  --cover-fg: #ff3f7f;
}

.cover--electric {
  --cover-bg: #8c00ff;
  --cover-fg: #ffc400;
}
</style>
