import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { api } from "../services/api";
import RegisterView from "./RegisterView.vue";

const push = vi.fn();

vi.mock("../services/api", () => ({
  api: {
    post: vi.fn(),
  },
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push }),
}));

describe("RegisterView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mountView() {
    return mount(RegisterView, {
      global: {
        stubs: {
          RouterLink: {
            props: ["to"],
            template: "<a :href='to'><slot /></a>",
          },
        },
      },
    });
  }

  it("submits registration data and navigates to login", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    const wrapper = mountView();

    await wrapper.find("#username").setValue("newuser");
    await wrapper.find("#email").setValue("new@example.com");
    await wrapper.find("#password").setValue("StrongPassword123!");
    await wrapper.find("#password-confirm").setValue("StrongPassword123!");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(api.post).toHaveBeenCalledWith("/accounts/register/", {
      username: "newuser",
      email: "new@example.com",
      password: "StrongPassword123!",
      password_confirm: "StrongPassword123!",
    });
    expect(push).toHaveBeenCalledWith("/login");
  });

  it("shows field validation errors returned by the API", async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { email: ["Already registered."] } },
    });
    const wrapper = mountView();

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.find(".message.error").text()).toContain(
      "email: Already registered.",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a generic message when the API error has no response data", async () => {
    vi.mocked(api.post).mockRejectedValue(new Error("Network error"));
    const wrapper = mountView();

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.find(".message.error").text()).toContain(
      "Die Registrierung ist fehlgeschlagen.",
    );
  });
});
