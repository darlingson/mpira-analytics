<template>
  <UApp>
    <Analytics />
    <SpeedInsights />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
<script setup>
import { Analytics } from '@vercel/analytics/nuxt'
import { SpeedInsights } from '@vercel/speed-insights/vue';
useHead({
  title: "Malawi Football Analytics Platform | Insights from Malawi football",
  meta: [
    {
      name: 'description',
      content: 'Malawi Football Analytics Platform offering team performance insights, historical data, and player metrics.'
    }
  ]
})
</script>
