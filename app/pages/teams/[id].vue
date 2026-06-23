<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

definePageMeta({ layout: 'default' })

const route = useRoute()
const teamId = computed(() => Number(route.params.id))

interface TeamDetail {
  id: number
  name: string
  shortName: string | null
  logoUrl: string | null
  country: string | null
  squad: {
    id: number
    name: string
    shortName: string | null
    position: string | null
    nationality: string | null
    photoUrl: string | null
  }[]
  recentMatches: {
    id: number
    date: string
    competition: string
    homeTeam: string
    awayTeam: string
    scoreHome: number | null
    scoreAway: number | null
    venue: string | null
  }[]
}

interface TopScorer {
  id: number
  name: string
  goals: number
}

interface BiggestWin {
  id: number
  date: string
  goal_diff: number
  opponent: string
  score: string
}

interface HighScoringMatch {
  id: number
  date: string
  team_score: number
  opponent: string
  score: string
}

interface TeamOverview {
  matchesPlayed: number
  goalsFor: number
  goalsAgainst: number
  goalsPerMatch: number
  topScorers: TopScorer[]
  biggestWin: BiggestWin | null
  highScoringMatches: HighScoringMatch[]
}

interface FastestGoal {
  minute: number
  player: string
  opponent: string
  date: string
}

interface Equalizer {
  playerId: number
  player: string
  count: number
}

interface TeamAttack {
  fastestGoal: FastestGoal | null
  latestWinningGoal: FastestGoal | null
  equalizers: Equalizer[]
  first5WinRate: number
}

interface TeamDefense {
  comebackWins: number
  scoredFirstAndWon: number
  scoredFirstAndLost: number
  cleanSheets: number
}

const tabs = [
  { label: 'Squad', value: 'squad' },
  { label: 'Matches', value: 'matches' },
  { label: 'Overview', value: 'overview' },
  { label: 'Attack', value: 'attack' },
  { label: 'Defense', value: 'defense' },
] satisfies TabsItem[]

const { data: team, error, status } = await useFetch<TeamDetail>(`/api/teams/${route.params.id}`)

const { data: overview, execute: fetchOverview } = await useFetch<TeamOverview>(
  () => `/api/team-overview/${teamId.value}`,
  { immediate: false }
)

const { data: attack, execute: fetchAttack } = await useFetch<TeamAttack>(
  () => `/api/team-attack-insights/${teamId.value}`,
  { immediate: false }
)

const { data: defense, execute: fetchDefense } = await useFetch<TeamDefense>(
  () => `/api/team-insights/${teamId.value}`,
  { immediate: false }
)

const activeTab = ref('squad')

watch(activeTab, (tab) => {
  if (tab === 'overview' && !overview.value) fetchOverview()
  if (tab === 'attack' && !attack.value) fetchAttack()
  if (tab === 'defense' && !defense.value) fetchDefense()
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function pointsFor(scoreHome: number | null, scoreAway: number | null): 'win' | 'loss' | 'draw' | null {
  if (scoreHome === null || scoreAway === null) return null
  if (scoreHome > scoreAway) return 'win'
  if (scoreHome < scoreAway) return 'loss'
  return 'draw'
}
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/teams" class="text-sm text-muted hover:text-default transition-colors inline-flex items-center gap-1">
      <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
      Back to teams
    </NuxtLink>

    <div v-if="status === 'pending'" class="flex justify-center py-16">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-muted" />
    </div>

    <div v-else-if="error" class="text-center py-16">
      <p class="text-muted">Failed to load team details.</p>
    </div>

    <template v-else-if="team">
      <div class="flex items-center gap-6 rounded-xl border border-default bg-elevated p-6 sm:p-8">
        <div class="h-20 w-20 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <span v-if="!team.logoUrl" class="text-3xl font-bold text-muted">{{ team.shortName?.charAt(0) || team.name.charAt(0) }}</span>
          <img v-else :src="team.logoUrl" :alt="team.name" class="h-full w-full object-contain" />
        </div>
        <div>
          <h1 class="text-3xl font-bold">{{ team.name }}</h1>
          <p class="text-muted mt-1">
            <span v-if="team.shortName">{{ team.shortName }}</span>
            <span v-if="team.country"> · {{ team.country }}</span>
          </p>
        </div>
      </div>

      <UTabs v-model="activeTab" :items="tabs" class="w-full">
        <template #content="{ item }">
          <div v-if="item.value === 'squad'">
            <div v-if="team.squad.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div v-for="player in team.squad" :key="player.id"
                class="flex items-center gap-3 rounded-xl border border-default bg-elevated p-4">
                <div class="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <span v-if="!player.photoUrl" class="text-sm font-bold text-muted">{{ player.name.charAt(0) }}</span>
                  <img v-else :src="player.photoUrl" :alt="player.name" class="h-full w-full object-cover" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium truncate">{{ player.name }}</p>
                  <p v-if="player.position" class="text-xs text-muted">{{ player.position }}</p>
                  <p v-else class="text-xs text-dimmed">No position set</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 rounded-xl border border-default bg-elevated">
              <p class="text-muted">No players currently registered for this team.</p>
            </div>
          </div>

          <div v-else-if="item.value === 'matches'">
            <div v-if="team.recentMatches.length" class="space-y-3">
              <NuxtLink v-for="match in team.recentMatches" :key="match.id" :to="`/matches/${match.id}`"
                class="flex items-center gap-4 rounded-xl border border-default bg-elevated p-4 transition hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5">
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-muted">{{ formatDate(match.date) }}</p>
                  <p class="text-sm truncate">{{ match.competition }}</p>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  <span class="font-medium truncate max-w-28 text-right"
                    :class="pointsFor(match.scoreHome, match.scoreAway) === 'win' ? 'text-primary' : ''">
                    {{ match.homeTeam }}
                  </span>
                  <span class="font-bold tabular-nums flex-shrink-0"
                    :class="match.scoreHome !== null && match.scoreAway !== null
                      ? 'text-default'
                      : 'text-muted text-xs'">
                    {{ match.scoreHome ?? '?' }} - {{ match.scoreAway ?? '?' }}
                  </span>
                  <span class="font-medium truncate max-w-28"
                    :class="pointsFor(match.scoreHome, match.scoreAway) === 'loss' ? 'text-primary' : ''">
                    {{ match.awayTeam }}
                  </span>
                </div>
              </NuxtLink>
            </div>
            <div v-else class="text-center py-8 rounded-xl border border-default bg-elevated">
              <p class="text-muted">No recent matches for this team.</p>
            </div>
          </div>

          <div v-else-if="item.value === 'overview'">
            <div v-if="!overview" class="flex justify-center py-8">
              <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 animate-spin text-muted" />
            </div>
            <div v-else class="space-y-6">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="rounded-xl border border-default bg-elevated p-4 text-center">
                  <p class="text-2xl font-bold text-primary">{{ overview.matchesPlayed }}</p>
                  <p class="text-xs text-muted mt-1">Matches Played</p>
                </div>
                <div class="rounded-xl border border-default bg-elevated p-4 text-center">
                  <p class="text-2xl font-bold text-green-400">{{ overview.goalsFor }}</p>
                  <p class="text-xs text-muted mt-1">Goals For</p>
                </div>
                <div class="rounded-xl border border-default bg-elevated p-4 text-center">
                  <p class="text-2xl font-bold text-red-400">{{ overview.goalsAgainst }}</p>
                  <p class="text-xs text-muted mt-1">Goals Against</p>
                </div>
                <div class="rounded-xl border border-default bg-elevated p-4 text-center">
                  <p class="text-2xl font-bold text-primary">{{ overview.goalsPerMatch }}</p>
                  <p class="text-xs text-muted mt-1">Goals Per Match</p>
                </div>
              </div>

              <div class="rounded-xl border border-default bg-elevated p-5">
                <h3 class="font-semibold mb-3">Top Scorers</h3>
                <div v-if="overview.topScorers.length" class="space-y-2">
                  <div v-for="(scorer, i) in overview.topScorers" :key="scorer.id"
                    class="flex items-center justify-between text-sm">
                    <span><span class="text-muted mr-2">#{{ i + 1 }}</span>{{ scorer.name }}</span>
                    <span class="font-bold">{{ scorer.goals }} goals</span>
                  </div>
                </div>
                <p v-else class="text-sm text-muted">No goals recorded.</p>
              </div>

              <div v-if="overview.biggestWin" class="rounded-xl border border-default bg-elevated p-5">
                <h3 class="font-semibold mb-2">Biggest Win</h3>
                <p class="text-sm">
                  {{ overview.biggestWin.score }}
                  <span class="text-muted">vs</span>
                  {{ overview.biggestWin.opponent }}
                  <span class="text-xs text-muted">({{ formatDate(overview.biggestWin.date) }})</span>
                </p>
              </div>

              <div v-if="overview.highScoringMatches.length" class="rounded-xl border border-default bg-elevated p-5">
                <h3 class="font-semibold mb-3">High-Scoring Matches (≥3 goals)</h3>
                <div class="space-y-2">
                  <div v-for="m in overview.highScoringMatches" :key="m.id"
                    class="flex items-center justify-between text-sm">
                    <span>
                      {{ m.score }}
                      <span class="text-muted">vs</span>
                      {{ m.opponent }}
                    </span>
                    <span class="text-xs text-muted">{{ formatDate(m.date) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="item.value === 'attack'">
            <div v-if="!attack" class="flex justify-center py-8">
              <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 animate-spin text-muted" />
            </div>
            <div v-else class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="rounded-xl border border-default bg-elevated p-5">
                  <h3 class="font-semibold mb-2">Fastest Goal</h3>
                  <p v-if="attack.fastestGoal" class="text-sm">
                    <span class="text-2xl font-bold text-primary">{{ attack.fastestGoal.minute }}'</span>
                    <span class="text-muted"> — {{ attack.fastestGoal.player }} vs {{ attack.fastestGoal.opponent }}</span>
                    <span class="text-xs text-muted block mt-1">({{ formatDate(attack.fastestGoal.date) }})</span>
                  </p>
                  <p v-else class="text-sm text-muted">No goals recorded.</p>
                </div>

                <div class="rounded-xl border border-default bg-elevated p-5">
                  <h3 class="font-semibold mb-2">Latest Winning Goal</h3>
                  <p v-if="attack.latestWinningGoal" class="text-sm">
                    <span class="text-2xl font-bold text-primary">{{ attack.latestWinningGoal.minute }}'</span>
                    <span class="text-muted"> — {{ attack.latestWinningGoal.player }} vs {{ attack.latestWinningGoal.opponent }}</span>
                    <span class="text-xs text-muted block mt-1">({{ formatDate(attack.latestWinningGoal.date) }})</span>
                  </p>
                  <p v-else class="text-sm text-muted">No winning goals recorded.</p>
                </div>
              </div>

              <div class="rounded-xl border border-default bg-elevated p-5">
                <h3 class="font-semibold mb-3">Equalizers</h3>
                <div v-if="attack.equalizers.length" class="space-y-2">
                  <div v-for="eq in attack.equalizers" :key="eq.playerId"
                    class="flex items-center justify-between text-sm">
                    <span>{{ eq.player }}</span>
                    <span class="font-bold">{{ eq.count }} {{ eq.count === 1 ? 'equalizer' : 'equalizers' }}</span>
                  </div>
                </div>
                <p v-else class="text-sm text-muted">No equalizers recorded.</p>
              </div>

              <div class="rounded-xl border border-default bg-elevated p-5">
                <h3 class="font-semibold mb-2">First 5' Win Rate</h3>
                <p class="text-2xl font-bold text-primary">{{ attack.first5WinRate }}%</p>
                <p class="text-xs text-muted mt-1">Win rate when scoring in the first 5 minutes</p>
              </div>
            </div>
          </div>

          <div v-else-if="item.value === 'defense'">
            <div v-if="!defense" class="flex justify-center py-8">
              <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 animate-spin text-muted" />
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="rounded-xl border border-default bg-elevated p-5 text-center">
                <p class="text-3xl font-bold text-primary">{{ defense.comebackWins }}</p>
                <p class="text-sm text-muted mt-1">Comeback Wins</p>
              </div>
              <div class="rounded-xl border border-default bg-elevated p-5 text-center">
                <p class="text-3xl font-bold text-green-400">{{ defense.scoredFirstAndWon }}</p>
                <p class="text-sm text-muted mt-1">Scored First & Won</p>
              </div>
              <div class="rounded-xl border border-default bg-elevated p-5 text-center">
                <p class="text-3xl font-bold text-red-400">{{ defense.scoredFirstAndLost }}</p>
                <p class="text-sm text-muted mt-1">Scored First & Lost</p>
              </div>
              <div class="rounded-xl border border-default bg-elevated p-5 text-center">
                <p class="text-3xl font-bold text-primary">{{ defense.cleanSheets }}</p>
                <p class="text-sm text-muted mt-1">Clean Sheets</p>
              </div>
            </div>
          </div>
        </template>
      </UTabs>
    </template>
  </div>
</template>
