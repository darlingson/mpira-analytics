<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

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

const { data: team, error, status } = await useFetch<TeamDetail>(`/api/teams/${route.params.id}`)

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
  <div class="space-y-8">
    <NuxtLink to="/teams" class="text-sm text-muted hover:text-default transition-colors inline-flex items-center gap-1">
      <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
      Back to teams
    </NuxtLink>

    <div v-if="status === 'pending'" class="flex justify-center py-16">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-muted" />
    </div>

    <div v-else-if="error" class="text-center py-16">
      <p class="text-muted">Failed to load team details. Please try again later.</p>
    </div>

    <div v-else-if="team">
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

      <div>
        <h2 class="text-xl font-bold mb-4">Current Squad</h2>
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

      <div>
        <h2 class="text-xl font-bold mb-4">Recent Matches</h2>
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
    </div>
  </div>
</template>
