
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import RegisterView from "../views/RegisterView.vue";
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import ArtistsView from "../views/ArtistsView.vue";
import LegalPlaceholderView from "../views/LegalInfoView.vue";
import BandsView from "../views/BandsView.vue";
import ArtistDetailView from "../views/ArtistDetailView.vue";
import BandDetailView from "../views/BandDetailView.vue";
import EventsView from "../views/EventsView.vue";
import EventDetailView from "../views/EventDetailView.vue";
import VideoViews from "../views/VideoViews.vue";
import StreamsView from "../views/StreamsView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/artists",
      name: "artists",
      component: ArtistsView,
    },
    {
      path: "/impressum",
      name: "impressum",
      component: LegalPlaceholderView,
    },
    {
      path: "/datenschutz",
      name: "datenschutz",
      component: LegalPlaceholderView,
    },
    {
      path: "/kontakt",
      name: "kontakt",
      component: LegalPlaceholderView,
    },
    {
      path: "/nutzungsbedingungen",
      name: "nutzungsbedingungen",
      component: LegalPlaceholderView,
    },
    {
      path: "/bands",
      name: "bands",
      component: BandsView,
    },
    {
      path: "/artists/:slug",
      name: "artist-detail",
      component: ArtistDetailView,
    },
    {
      path: "/bands/:slug",
      name: "band-detail",
      component: BandDetailView,
    },
    {
      path: "/events",
      name: "events",
      component: EventsView,
    },
    {
      path: "/events/:slug",
      name: "event-detail",
      component: EventDetailView,
    },
    {
      path: "/streams",
      name: "streams",
      component: StreamsView,
    },
    {
      path: "/streams/:slug",
      name: "stream-detail",
      component: () => import("../views/StreamDetailView.vue"),
    },
    {
      path: "/videos",
      name: "videos",
      component: VideoViews,
    },
    {
      path: "/videos/:slug",
      name: "video-detail",
      component: () => import("../views/VideoDetailVue.vue"),
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "login" };
  }

  return true;
});

export default router;
