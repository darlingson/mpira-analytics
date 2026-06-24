<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface TopScorer {
  player: string
  team: string
  goals: number
}

const { data: scorers } = await useFetch<TopScorer[]>("/api/top-scorers")
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">Top Scorers</h1>
      <p class="text-muted-foreground mt-1">Leading goal scorers across all seasons</p>
    </div>

    <div v-if="scorers" class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border text-muted-foreground">
            <th class="text-left py-2 pr-4">#</th>
            <th class="text-left py-2 pr-4">Player</th>
            <th class="text-left py-2 pr-4">Team</th>
            <th class="text-center px-2 py-2">Goals</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(s, idx) in scorers"
            :key="s.player"
            class="border-b border-border/50 hover:bg-muted/50 transition-colors"
          >
            <td class="py-2 pr-4">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                :class="idx === 0 ? 'bg-yellow-500/20 text-yellow-600' : idx === 1 ? 'bg-gray-400/20 text-gray-500' : idx === 2 ? 'bg-amber-700/20 text-amber-800' : 'bg-muted text-muted-foreground'"
              >
                {{ idx + 1 }}
              </div>
            </td>
            <td class="py-2 pr-4 font-medium">{{ s.player }}</td>
            <td class="py-2 pr-4 text-muted-foreground">{{ s.team }}</td>
            <td class="text-center px-2 py-2">
              <Badge variant="default" class="text-base px-3 py-1">{{ s.goals }}</Badge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
