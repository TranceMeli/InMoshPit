import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";

import { MOBILE_QUERY, WIDE_QUERY, isWideNow, useBreakpoint } from "./useBreakpoint";

type Listener = (event: { matches: boolean }) => void;

function mockMatchMedia(initial: Record<string, boolean>) {
  const state = { ...initial };
  const listeners = new Map<string, Set<Listener>>();

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return state[query] ?? false;
      },
      addEventListener: (_: string, listener: Listener) => {
        if (!listeners.has(query)) {
          listeners.set(query, new Set());
        }
        listeners.get(query)!.add(listener);
      },
      removeEventListener: (_: string, listener: Listener) => listeners.get(query)?.delete(listener),
    })),
  );

  return {
    change(query: string, matches: boolean) {
      state[query] = matches;
      listeners.get(query)?.forEach((listener) => listener({ matches }));
    },
    listenerCount: (query: string) => listeners.get(query)?.size ?? 0,
  };
}

function mountProbe() {
  let flags!: ReturnType<typeof useBreakpoint>;

  const wrapper = mount(
    defineComponent({
      setup() {
        flags = useBreakpoint();
        return () => h("div");
      },
    }),
  );

  return { wrapper, flags };
}

describe("useBreakpoint", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads the current state of both queries", () => {
    mockMatchMedia({ [WIDE_QUERY]: true, [MOBILE_QUERY]: false });

    const { flags } = mountProbe();

    expect(flags.isWide.value).toBe(true);
    expect(flags.isMobile.value).toBe(false);
  });

  it("reacts to changes of the viewport", () => {
    const media = mockMatchMedia({ [WIDE_QUERY]: true, [MOBILE_QUERY]: false });
    const { flags } = mountProbe();

    media.change(WIDE_QUERY, false);
    media.change(MOBILE_QUERY, true);

    expect(flags.isWide.value).toBe(false);
    expect(flags.isMobile.value).toBe(true);
  });

  it("stops listening when the component unmounts", () => {
    const media = mockMatchMedia({ [WIDE_QUERY]: true });
    const { wrapper } = mountProbe();

    expect(media.listenerCount(WIDE_QUERY)).toBe(1);

    wrapper.unmount();

    expect(media.listenerCount(WIDE_QUERY)).toBe(0);
  });

  it("falls back to a wide, non-mobile layout without matchMedia support", () => {
    vi.stubGlobal("matchMedia", undefined);

    const { flags } = mountProbe();

    expect(flags.isWide.value).toBe(true);
    expect(flags.isMobile.value).toBe(false);
    expect(isWideNow()).toBe(true);
  });

  it("answers isWideNow from the current state", () => {
    const media = mockMatchMedia({ [WIDE_QUERY]: false });

    expect(isWideNow()).toBe(false);

    media.change(WIDE_QUERY, true);

    expect(isWideNow()).toBe(true);
  });
});
