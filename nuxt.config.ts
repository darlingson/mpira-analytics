// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/scripts'],

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-07-16',
  runtimeConfig: {
    // databaseUrl: process.env.DATABASE_URL,
    databaseUrl: process.env.NUXT_DATABASE_URL
  },
})