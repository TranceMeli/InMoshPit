import { onBeforeUnmount, onMounted, ref } from "vue";

/** Ab dieser Breite ist die Seitenleiste ausklappbar (sonst nur Icon-Leiste). */
export const WIDE_QUERY = "(min-width: 1100px)";

/** Unterhalb dieser Breite gibt es keine Seitenleiste, sondern die untere Navigation. */
export const MOBILE_QUERY = "(max-width: 767px)";

function supported(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

/**
 * Reaktive Media Query. Ohne matchMedia-Unterstützung (z. B. in Tests) gilt
 * `fallback`.
 */
export function useMediaQuery(query: string, fallback: boolean) {
  const matches = ref(supported() ? window.matchMedia(query).matches : fallback);

  let list: MediaQueryList | undefined;

  const update = (event: MediaQueryListEvent) => {
    matches.value = event.matches;
  };

  onMounted(() => {
    if (!supported()) {
      return;
    }

    list = window.matchMedia(query);
    matches.value = list.matches;
    list.addEventListener("change", update);
  });

  onBeforeUnmount(() => list?.removeEventListener("change", update));

  return matches;
}

/** Breite Ansicht (Desktop) und mobile Ansicht als reaktive Flags. */
export function useBreakpoint() {
  return {
    isWide: useMediaQuery(WIDE_QUERY, true),
    isMobile: useMediaQuery(MOBILE_QUERY, false),
  };
}

/** Momentaufnahme für Klick-Handler außerhalb von Komponenten. */
export function isWideNow(): boolean {
  return supported() ? window.matchMedia(WIDE_QUERY).matches : true;
}
