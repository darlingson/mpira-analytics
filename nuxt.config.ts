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
    ['@clerk/nuxt', {
      signInUrl: '/auth',
      signUpUrl: '/auth',
      signInFallbackRedirectUrl: '/admin/dashboard',
      signUpFallbackRedirectUrl: '/admin/dashboard',
    }],
  ],
  tres: {
    devtools: true,
  },
  css: ['~/app/assets/css/main.css'],

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