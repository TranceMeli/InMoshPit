
<script setup lang="ts">
import { t } from "../i18n";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import Hls from "hls.js";

const props = defineProps<{
  src: string;
  title: string;
}>();

const emit = defineEmits<{
  play: [];
  ended: [];
  progress: [seconds: number];
}>();

const videoElement = ref<HTMLVideoElement | null>(null);
const playerError = ref("");
const isLoading = ref(true);

let hls: Hls | null = null;
let lastProgressSecond = -1;

function destroyPlayer() {
  if (hls) {
    hls.destroy();
    hls = null;
  }

  if (videoElement.value) {
    videoElement.value.pause();
    videoElement.value.removeAttribute("src");
    videoElement.value.load();
  }
}

function initializePlayer() {
  destroyPlayer();
  playerError.value = "";
  isLoading.value = true;

  const video = videoElement.value;

  if (!video || !props.src) {
    isLoading.value = false;
    playerError.value = t('player.noSource');
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = props.src;
    return;
  }

  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      capLevelToPlayerSize: true,
    });

    hls.loadSource(props.src);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        playerError.value = t('player.streamFailed');
        isLoading.value = false;
        hls?.destroy();
        hls = null;
      }
    });

    return;
  }

  isLoading.value = false;
  playerError.value = t('player.unsupported');
}

function handleTimeUpdate() {
  const seconds = Math.floor(videoElement.value?.currentTime ?? 0);

  if (seconds !== lastProgressSecond) {
    lastProgressSecond = seconds;
    emit("progress", seconds);
  }
}

watch(() => props.src, initializePlayer);

onMounted(initializePlayer);
onBeforeUnmount(destroyPlayer);
</script>

<template>
  <div class="player-wrapper">
    <video
      ref="videoElement"
      class="video-player"
      controls
      playsinline
      preload="metadata"
      :aria-label="title"
      @play="emit('play')"
      @ended="emit('ended')"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="isLoading = false"
      @waiting="isLoading = true"
      @playing="isLoading = false"
      @error="playerError = t('player.error')"
    />

    <div v-if="isLoading && !playerError" class="player-loading">
      {{ t('player.loading') }}
    </div>

    <div v-if="playerError" class="player-error">
      <span>{{ playerError }}</span>
    </div>
  </div>
</template>

<style scoped>
.player-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: #08050d;
  border-radius: 12px;
}

.video-player {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.player-loading,
.player-error {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  color: #ede7f6;
  background: #100b18dd;
  text-align: center;
}

.player-error {
  color: var(--color-error);
}
</style>
