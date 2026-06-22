<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

interface MatchDetail {
  id: number
  date: string
  competition: string
  season: string
  league: string | null
  homeTeam: string
  homeTeamId: number
  awayTeam: string
  awayTeamId: number
  scoreHome: number | null
  scoreAway: number | null
  venue: string | null
  events: {
    id: number
    minute: number
    eventType: string
    player: string
    playerId: number
    assistingPlayer: string | null
    assistingPlayerId: number | null
  }[]
}

const { data: match, error, status } = await useFetch<MatchDetail>(`/api/matches/${route.params.id}`)

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

const eventIcons: Record<string, string> = {
  goal: 'i-heroicons-soccer-ball',
  yellow_card: 'i-heroicons-exclamation-triangle',
  red_card: 'i-heroicons-no-symbol',
  substitution: 'i-heroicons-arrow-right-left',
}

const eventColors: Record<string, string> = {
  goal: 'text-green-400',
  yellow_card: 'text-amber-400',
  red_card: 'text-red-400',
  substitution: 'text-blue-400',
}
</script>

<template>
  <div class="space-y-8">
    <NuxtLink to="/matches" class="text-sm text-muted hover:text-default transition-colors inline-flex items-center gap-1">
      <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
      Back to matches
    </NuxtLink>

    <div v-if="status === 'pending'" class="flex justify-center py-16">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-muted" />
    </div>

    <div v-else-if="error" class="text-center py-16">
      <p class="text-muted">Failed to load match details. Please try again later.</p>
    </div>

    <div v-else-if="match">
      <div class="rounded-xl border border-default bg-elevated p-6 sm:p-8">
        <div class="text-center space-y-2 mb-8">
          <p class="text-sm text-muted">{{ formatDate(match.date) }}</p>
          <p class="text-sm text-muted">{{ match.competition }}<span v-if="match.season"> · {{ match.season }}</span></p>
          <p v-if="match.league" class="text-xs text-dimmed">{{ match.league }}</p>
        </div>

        <div class="flex items-center justify-center gap-6 sm:gap-12">
          <NuxtLink :to="`/teams/${match.homeTeamId}`" class="flex-1 text-right group">
            <p class="text-lg sm:text-2xl font-bold group-hover:text-primary transition-colors">{{ match.homeTeam }}</p>
          </NuxtLink>

          <div class="flex-shrink-0">
            <div class="text-4xl sm:text-5xl font-extrabold tabular-nums"
              :class="match.scoreHome !== null && match.scoreAway !== null
                ? 'text-default'
                : 'text-muted'">
              <span :class="match.scoreHome !== null && match.scoreAway !== null && match.scoreHome > match.scoreAway ? 'text-primary' : ''">
                {{ match.scoreHome ?? '?' }}
              </span>
              <span class="mx-1 text-muted">-</span>
              <span :class="match.scoreHome !== null && match.scoreAway !== null && match.scoreAway > match.scoreHome ? 'text-primary' : ''">
                {{ match.scoreAway ?? '?' }}
              </span>
            </div>
          </div>

          <NuxtLink :to="`/teams/${match.awayTeamId}`" class="flex-1 group">
            <p class="text-lg sm:text-2xl font-bold group-hover:text-primary transition-colors">{{ match.awayTeam }}</p>
          </NuxtLink>
        </div>

        <div v-if="match.venue" class="text-center mt-6">
          <p class="text-sm text-dimmed">{{ match.venue }}</p>
        </div>
      </div>

      <div v-if="match.events.length" class="mt-8">
        <h2 class="text-xl font-bold mb-4">Match Timeline</h2>
        <div class="space-y-3">
          <div v-for="event in match.events" :key="event.id"
            class="flex items-center gap-4 rounded-xl border border-default bg-elevated px-5 py-3">
            <span class="text-sm font-mono text-muted w-12 flex-shrink-0">{{ event.minute }}'</span>
            <UIcon :name="eventIcons[event.eventType] || 'i-heroicons-circle-stack'" class="h-5 w-5 flex-shrink-0"
              :class="eventColors[event.eventType] || 'text-muted'" />
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ event.player }}</p>
              <p v-if="event.eventType === 'goal' && event.assistingPlayer" class="text-xs text-muted">
                Assist: {{ event.assistingPlayer }}
              </p>
              <p v-else-if="event.eventType === 'substitution'" class="text-xs text-muted">
                Substitution
              </p>
              <p v-else-if="event.eventType === 'yellow_card'" class="text-xs text-muted">
                Yellow Card
              </p>
              <p v-else-if="event.eventType === 'red_card'" class="text-xs text-muted">
                Red Card
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="mt-8 text-center py-8 rounded-xl border border-default bg-elevated">
        <p class="text-muted">No events recorded for this match.</p>
      </div>
    </div>
  </div>
</template>
