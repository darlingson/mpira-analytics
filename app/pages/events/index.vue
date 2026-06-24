<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface EventStats {
  event_counts: { goals: number; yellow_cards: number; red_cards: number }
  total_matches: number
  average_events_per_match: number
  discipline_per_team: { team: string; yellow_cards: number; red_cards: number }[]
}

const { data: stats } = await useFetch<EventStats>("/api/events/stats")
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">Event Statistics</h1>
      <p class="text-muted-foreground mt-1">Goals, cards, and discipline breakdown</p>
    </div>

    <div v-if="stats" class="space-y-8">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card class="p-5 bg-card border-border text-center">
          <p class="text-3xl font-bold text-accent">{{ stats.event_counts.goals }}</p>
          <p class="text-xs text-muted-foreground mt-1">Total Goals</p>
        </Card>
        <Card class="p-5 bg-card border-border text-center">
          <p class="text-3xl font-bold text-yellow-500">{{ stats.event_counts.yellow_cards }}</p>
          <p class="text-xs text-muted-foreground mt-1">Yellow Cards</p>
        </Card>
        <Card class="p-5 bg-card border-border text-center">
          <p class="text-3xl font-bold text-red-500">{{ stats.event_counts.red_cards }}</p>
          <p class="text-xs text-muted-foreground mt-1">Red Cards</p>
        </Card>
        <Card class="p-5 bg-card border-border text-center">
          <p class="text-3xl font-bold text-primary">{{ stats.average_events_per_match }}</p>
          <p class="text-xs text-muted-foreground mt-1">Avg Events / Match</p>
        </Card>
      </div>

      <div>
        <h2 class="text-xl font-bold mb-4">Discipline Per Team</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border text-muted-foreground">
                <th class="text-left py-2 pr-4">Team</th>
                <th class="text-center px-2 py-2">Yellow Cards</th>
                <th class="text-center px-2 py-2">Red Cards</th>
                <th class="text-center px-2 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="d in stats.discipline_per_team"
                :key="d.team"
                class="border-b border-border/50 hover:bg-muted/50 transition-colors"
              >
                <td class="py-2 pr-4 font-medium">{{ d.team }}</td>
                <td class="text-center px-2 py-2 text-yellow-500">{{ d.yellow_cards }}</td>
                <td class="text-center px-2 py-2 text-red-500">{{ d.red_cards }}</td>
                <td class="text-center px-2 py-2 font-bold">{{ d.yellow_cards + d.red_cards }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
