<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

definePageMeta({ layout: 'default' })

const { data: seasonData } = await useFetch("/api/seasons/performance")

const seasons = computed(() => [...new Set(seasonData.value?.map(s => s.season) ?? [])].sort())
const teams = computed(() => [...new Set(seasonData.value?.map(s => s.team) ?? [])].sort())

const selectedSeason = ref(seasons.value[0] ?? '')
const selectedTeams = ref<string[]>([])
const selectedTeam = ref('')

const filteredTable = computed(() =>
  seasonData.value?.filter(s => !selectedSeason.value || s.season === selectedSeason.value) ?? []
)

const comparisonData = computed(() =>
  seasonData.value?.filter(s =>
    (s.season === selectedSeason.value || !selectedSeason.value) &&
    selectedTeams.value.includes(s.team)
  ) ?? []
)

const teamHistory = computed(() =>
  seasonData.value?.filter(s => s.team === selectedTeam.value) ?? []
)

const tabs = [
  { label: 'Table View', value: 'table' },
  { label: 'Team Comparison', value: 'compare' },
  { label: 'Season Comparison', value: 'history' },
] satisfies TabsItem[]

const activeTab = ref('table')
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">Season Performance</h1>
      <p class="text-muted-foreground mt-1">Team statistics across seasons</p>
    </div>

    <div class="flex items-center gap-4">
      <USelect
        v-model="selectedSeason"
        :items="seasons"
        placeholder="All seasons"
        class="w-48"
      />
    </div>

    <UTabs v-model="activeTab" :items="tabs" class="w-full">
      <template #content="{ item }">
        <div v-if="item.value === 'table'" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border text-muted-foreground">
                <th class="text-left py-2 pr-4">Team</th>
                <th class="text-center px-2 py-2">P</th>
                <th class="text-center px-2 py-2">W</th>
                <th class="text-center px-2 py-2">D</th>
                <th class="text-center px-2 py-2">L</th>
                <th class="text-center px-2 py-2">GF</th>
                <th class="text-center px-2 py-2">GA</th>
                <th class="text-center px-2 py-2">GD</th>
                <th class="text-center px-2 py-2">Pts</th>
                <th class="text-center px-2 py-2">CS</th>
                <th class="text-center px-2 py-2">FTS</th>
                <th class="text-left px-2 py-2">Home</th>
                <th class="text-left px-2 py-2">Away</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="s in filteredTable"
                :key="`${s.season}-${s.team}`"
                class="border-b border-border/50 hover:bg-muted/50 transition-colors"
              >
                <td class="py-2 pr-4 font-medium">{{ s.team }}</td>
                <td class="text-center px-2 py-2">{{ s.matchesPlayed }}</td>
                <td class="text-center px-2 py-2 text-green-500">{{ s.wins }}</td>
                <td class="text-center px-2 py-2 text-muted-foreground">{{ s.draws }}</td>
                <td class="text-center px-2 py-2 text-red-500">{{ s.losses }}</td>
                <td class="text-center px-2 py-2">{{ s.goalsScored }}</td>
                <td class="text-center px-2 py-2">{{ s.goalsConceded }}</td>
                <td class="text-center px-2 py-2 font-bold"
                  :class="s.goalDifference > 0 ? 'text-green-500' : s.goalDifference < 0 ? 'text-red-500' : ''"
                >{{ s.goalDifference }}</td>
                <td class="text-center px-2 py-2 font-bold">{{ s.wins * 3 + s.draws }}</td>
                <td class="text-center px-2 py-2">{{ s.cleanSheets }}</td>
                <td class="text-center px-2 py-2">{{ s.failedToScore }}</td>
                <td class="px-2 py-2 text-xs">{{ s.homeRecord }}</td>
                <td class="px-2 py-2 text-xs">{{ s.awayRecord }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="item.value === 'compare'" class="space-y-4">
          <USelect
            v-model="selectedTeams"
            :items="teams"
            multiple
            placeholder="Select teams to compare..."
            class="w-80"
          />
          <div v-if="comparisonData.length" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border text-muted-foreground">
                  <th class="text-left py-2 pr-4">Team</th>
                  <th class="text-center px-2 py-2">P</th>
                  <th class="text-center px-2 py-2">W</th>
                  <th class="text-center px-2 py-2">D</th>
                  <th class="text-center px-2 py-2">L</th>
                  <th class="text-center px-2 py-2">GF</th>
                  <th class="text-center px-2 py-2">GA</th>
                  <th class="text-center px-2 py-2">GD</th>
                  <th class="text-center px-2 py-2">Pts</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="s in comparisonData"
                  :key="`${s.season}-${s.team}`"
                  class="border-b border-border/50"
                >
                  <td class="py-2 pr-4 font-medium">{{ s.team }}</td>
                  <td class="text-center px-2 py-2">{{ s.matchesPlayed }}</td>
                  <td class="text-center px-2 py-2 text-green-500">{{ s.wins }}</td>
                  <td class="text-center px-2 py-2">{{ s.draws }}</td>
                  <td class="text-center px-2 py-2 text-red-500">{{ s.losses }}</td>
                  <td class="text-center px-2 py-2">{{ s.goalsScored }}</td>
                  <td class="text-center px-2 py-2">{{ s.goalsConceded }}</td>
                  <td class="text-center px-2 py-2 font-bold"
                    :class="s.goalDifference > 0 ? 'text-green-500' : s.goalDifference < 0 ? 'text-red-500' : ''"
                  >{{ s.goalDifference }}</td>
                  <td class="text-center px-2 py-2 font-bold">{{ s.wins * 3 + s.draws }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-sm text-muted-foreground py-4">
            Select one or more teams to compare.
          </p>
        </div>

        <div v-else-if="item.value === 'history'" class="space-y-4">
          <USelect
            v-model="selectedTeam"
            :items="teams"
            placeholder="Select a team..."
            class="w-64"
          />
          <div v-if="teamHistory.length" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border text-muted-foreground">
                  <th class="text-left py-2 pr-4">Season</th>
                  <th class="text-center px-2 py-2">P</th>
                  <th class="text-center px-2 py-2">W</th>
                  <th class="text-center px-2 py-2">D</th>
                  <th class="text-center px-2 py-2">L</th>
                  <th class="text-center px-2 py-2">GF</th>
                  <th class="text-center px-2 py-2">GA</th>
                  <th class="text-center px-2 py-2">GD</th>
                  <th class="text-center px-2 py-2">Pts</th>
                  <th class="text-center px-2 py-2">Avg G</th>
                  <th class="text-center px-2 py-2">Avg GA</th>
                  <th class="text-left px-2 py-2">Home</th>
                  <th class="text-left px-2 py-2">Away</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="s in teamHistory"
                  :key="s.season"
                  class="border-b border-border/50"
                >
                  <td class="py-2 pr-4 font-medium">{{ s.season }}</td>
                  <td class="text-center px-2 py-2">{{ s.matchesPlayed }}</td>
                  <td class="text-center px-2 py-2 text-green-500">{{ s.wins }}</td>
                  <td class="text-center px-2 py-2">{{ s.draws }}</td>
                  <td class="text-center px-2 py-2 text-red-500">{{ s.losses }}</td>
                  <td class="text-center px-2 py-2">{{ s.goalsScored }}</td>
                  <td class="text-center px-2 py-2">{{ s.goalsConceded }}</td>
                  <td class="text-center px-2 py-2 font-bold"
                    :class="s.goalDifference > 0 ? 'text-green-500' : s.goalDifference < 0 ? 'text-red-500' : ''"
                  >{{ s.goalDifference }}</td>
                  <td class="text-center px-2 py-2 font-bold">{{ s.wins * 3 + s.draws }}</td>
                  <td class="text-center px-2 py-2">{{ s.avgGoalsPerGame }}</td>
                  <td class="text-center px-2 py-2">{{ s.avgGoalsConcededPerGame }}</td>
                  <td class="px-2 py-2 text-xs">{{ s.homeRecord }}</td>
                  <td class="px-2 py-2 text-xs">{{ s.awayRecord }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else-if="selectedTeam" class="text-sm text-muted-foreground py-4">
            No data for this team.
          </p>
          <p v-else class="text-sm text-muted-foreground py-4">
            Select a team to see their performance across seasons.
          </p>
        </div>
      </template>
    </UTabs>
  </div>
</template>
