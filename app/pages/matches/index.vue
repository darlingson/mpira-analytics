<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface Match {
  id: number
  date: string
  competition: string
  competitionId: number
  homeTeam: string
  homeTeamId: number
  awayTeam: string
  awayTeamId: number
  scoreHome: number | null
  scoreAway: number | null
  venue: string | null
}

const { data: matches, error, status } = await useFetch<Match[]>('/api/matches')

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function scoreDisplay(home: number | null, away: number | null) {
  if (home === null || away === null) return 'vs'
  return `${home} - ${away}`
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) > new Date()
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold">Matches</h1>
      <p class="text-muted mt-1">All matches across Malawi football</p>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-16">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-muted" />
    </div>

    <div v-else-if="error" class="text-center py-16">
      <p class="text-muted">Failed to load matches. Please try again later.</p>
    </div>

    <div v-else-if="!matches?.length" class="text-center py-16">
      <p class="text-muted">No matches found.</p>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink v-for="match in matches" :key="match.id" :to="`/matches/${match.id}`"
        class="rounded-xl border border-default bg-elevated p-5 transition hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5">
        <div class="flex items-center justify-between text-xs text-muted mb-3">
          <span>{{ formatDate(match.date) }}</span>
          <span v-if="isUpcoming(match.date)" class="rounded-full bg-amber-400/10 text-amber-400 px-2 py-0.5 text-xs font-medium">
            Upcoming
          </span>
          <span v-else>{{ match.competition }}</span>
        </div>

        <div class="flex items-center justify-between gap-4">
          <div class="flex-1 text-right font-semibold truncate">{{ match.homeTeam }}</div>
          <div class="flex-shrink-0 text-lg font-bold tabular-nums"
            :class="match.scoreHome !== null && match.scoreAway !== null
              ? match.scoreHome > match.scoreAway ? 'text-primary' : match.scoreHome < match.scoreAway ? 'text-muted' : 'text-default'
              : 'text-muted text-sm'">
            {{ scoreDisplay(match.scoreHome, match.scoreAway) }}
          </div>
          <div class="flex-1 font-semibold truncate">{{ match.awayTeam }}</div>
        </div>

        <div v-if="match.venue" class="mt-3 text-xs text-dimmed truncate">
          {{ match.venue }}
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
