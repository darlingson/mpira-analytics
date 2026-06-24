<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

definePageMeta({ layout: 'default' })

const tabs = [
  { label: 'Comebacks & Heartbreaks', value: 'comebacks' },
  { label: 'Goals & Timing', value: 'goals' },
  { label: 'Winning Habits', value: 'winning' },
  { label: 'Defense & Equalizers', value: 'defense' },
] satisfies TabsItem[]

const activeTab = ref('comebacks')
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">Cross-Team Insights</h1>
      <p class="text-muted-foreground mt-1">
        Stats and trends across all teams in the league
      </p>
    </div>

    <UTabs v-model="activeTab" :items="tabs" class="w-full">
      <template #content="{ item }">
        <div v-if="item.value === 'comebacks'" class="space-y-8 mt-6">
          <ComebackKings />
          <HeartBreakers />
        </div>
        <div v-else-if="item.value === 'goals'" class="space-y-8 mt-6">
          <LatestWinners />
          <EarlyGoalWinRate />
        </div>
        <div v-else-if="item.value === 'winning'" class="space-y-8 mt-6">
          <ScoreFirstWin />
          <RedCardSurvival />
        </div>
        <div v-else-if="item.value === 'defense'" class="space-y-8 mt-6">
          <CleanSheets />
          <TheEqualizers />
        </div>
      </template>
    </UTabs>
  </div>
</template>
