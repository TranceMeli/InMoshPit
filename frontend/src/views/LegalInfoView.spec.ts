import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { useRoute } from "vue-router";
import LegalInfoView from "./LegalInfoView.vue";

vi.mock("vue-router", () => ({
  useRoute: vi.fn(),
}));

describe("LegalInfoView", () => {
  it.each([
    ["/impressum", "Impressum"],
    ["/datenschutz", "Datenschutzerklärung"],
    ["/kontakt", "Kontakt"],
    ["/nutzungsbedingungen", "Nutzungsbedingungen"],
  ])("shows the page content for %s", (path, title) => {
    vi.mocked(useRoute).mockReturnValue({ path } as ReturnType<typeof useRoute>);

    const wrapper = mount(LegalInfoView);

    expect(wrapper.find("h1").text()).toBe(title);
    expect(wrapper.text()).toContain("Entwicklungsplatzhalter");
  });
});
