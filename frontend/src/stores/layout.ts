import { defineStore } from "pinia";
import { ref } from "vue";

import { getStreams } from "../services/streams";

export type SidebarMode = "expanded" | "rail";

const STORAGE_KEY = "sidebar";

function readPreference(): SidebarMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === "rail" ? "rail" : "expanded";
  } catch {
    return "expanded";
  }
}

/** Zustand der Seitenleiste (ausgeklappt/eingeklappt, Drawer) und der Live-Zähler. */
export const useLayoutStore = defineStore("layout", () => {
  const preference = ref<SidebarMode>(readPreference());
  const drawerOpen = ref(false);
  const liveCount = ref(0);

  function setPreference(mode: SidebarMode) {
    preference.value = mode;

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Die Auswahl gilt dann nur für diese Sitzung.
    }
  }

  /**
   * Menü-Schaltfläche: Auf breiten Seiten klappt sie die Leiste ein und aus.
   * Wo die Leiste nur als Icon-Leiste oder gar nicht sichtbar ist (schmale
   * Seiten, Zuschauer-Seiten), öffnet oder schließt sie stattdessen den Drawer.
   */
  function toggleMenu(options: { wide: boolean; compact: boolean }) {
    if (options.wide && !options.compact) {
      setPreference(preference.value === "expanded" ? "rail" : "expanded");
      return;
    }

    drawerOpen.value = !drawerOpen.value;
  }

  function closeDrawer() {
    drawerOpen.value = false;
  }

  async function refreshLive() {
    try {
      liveCount.value = (await getStreams({ status: "live" })).length;
    } catch {
      // Der Zähler ist nur eine Zusatzinformation; bei Fehlern bleibt der alte Wert.
    }
  }

  return {
    preference,
    drawerOpen,
    liveCount,
    setPreference,
    toggleMenu,
    closeDrawer,
    refreshLive,
  };
});
