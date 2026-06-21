// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/scripts',
    '@tresjs/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@clerk/nuxt',
  ],
  tres: {
    devtools: true,
  },
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],

  nitro: {
    routeRules: {
      '/login': { redirect: '/auth' },
    },
  },
  compatibilityDate: '2025-07-16',
  runtimeConfig: {
    // databaseUrl: process.env.DATABASE_URL,
    databaseUrl: process.env.NUXT_DATABASE_URL
  },
})