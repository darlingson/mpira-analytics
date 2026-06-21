<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface Match {
  id: number
  date: string
  competition: string
  homeTeam: string
  awayTeam: string
  scoreHome: number | null
  scoreAway: number | null
  venue: string | null
}

const { data: matches, error, status } = await useFetch<Match[]>('/api/matches/recent')

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function scoreDisplay(home: number | null, away: number | null) {
  if (home === null || away === null) return 'vs'
  return `${home} - ${away}`
}

function isRecent(dateStr: string) {
  const matchDate = new Date(dateStr)
  const now = new Date()
  const diffDays = (now.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= 7
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold">Recent Matches</h1>
      <p class="text-muted mt-1">Latest results from Malawi football</p>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-16">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-muted" />
    </div>

    <div v-else-if="error" class="text-center py-16">
      <p class="text-muted">Failed to load matches. Please try again later.</p>
    </div>

    <div v-else-if="!matches?.length" class="text-center py-16">
      <p class="text-muted">No matches found yet.</p>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="match in matches" :key="match.id"
        class="rounded-xl border border-default bg-elevated p-5 transition hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5">
        <div class="flex items-center justify-between text-xs text-muted mb-3">
          <span>{{ formatDate(match.date) }}</span>
          <span v-if="isRecent(match.date)" class="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
            Live
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
      </div>
    </div>
  </div>
</template>
