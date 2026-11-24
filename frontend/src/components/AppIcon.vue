<script setup lang="ts">
import { computed } from "vue";

import { ICONS, type IconName } from "../icons";

const props = withDefaults(
  defineProps<{
    name: IconName;
    /** Gefüllte Variante, z. B. für den aktiven Navigationspunkt. */
    filled?: boolean;
    /** Kantenlänge in px oder als CSS-Länge. Standard: 1.5em (folgt der Schriftgröße). */
    size?: number | string;
    /** Nur setzen, wenn das Icon allein steht und eine Bedeutung trägt. */
    label?: string;
  }>(),
  { filled: false, size: "1.5em", label: undefined },
);

const path = computed(() => {
  const icon = ICONS[props.name];

  return props.filled ? icon.filled : icon.outlined;
});

const dimension = computed(() =>
  typeof props.size === "number" ? `${props.size}px` : props.size,
);
</script>

<template>
  <svg
    class="app-icon"
    viewBox="0 -960 960 960"
    fill="currentColor"
    :style="{ width: dimension, height: dimension }"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
  >
    <path :d="path" />
  </svg>
</template>

<style scoped>
.app-icon {
  display: inline-block;
  flex: none;
  vertical-align: middle;
}
</style>
