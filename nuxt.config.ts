// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_APP_API_URL || "http://localhost:8080/",
    },
  },

  // Dark mode is defined via our own tokens in assets/css/tailwind.css
  // (see the `.dark` overrides) — color-mode toggling is handled by the
  // navbar's theme switch using @nuxtjs/color-mode's useColorMode().
  colorMode: {
    classSuffix: "",
  },

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "nuxt-toast",
    "nuxt-echarts",
  ],

  echarts: {
    renderer: "svg",
    charts: ["BarChart", "LineChart", "PieChart"],
    components: [
      "DatasetComponent",
      "GridComponent",
      "TooltipComponent",
      "ToolboxComponent",
      "LegendComponent",
      "VisualMapComponent",
      "DataZoomComponent",
      "BrushComponent",
    ],
  },

  css: ["@/assets/css/main.css", "@/assets/css/tailwind.css"],
});
