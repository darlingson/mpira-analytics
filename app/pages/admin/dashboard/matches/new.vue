<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent, SelectMenuItem } from '@nuxt/ui'

definePageMeta({ layout: 'admin' })

interface Team {
  id: number
  name: string
  team_slug: string
  league: string
  home_district: string
  home_stadium: string | null
}

interface Match {
  season: string
  match_date: string
  home_team: string
  away_team: string
  final_score: string
  half_time: string
  home_team_id: number
  away_team_id: number
}

const { data: teams, pending } = await useLazyFetch<Team[]>('/api/teams', {
  default: () => [] as Team[],
})

const schema = v.object({
  match_date: v.string(),
  kickoff_time: v.string(),
  home_team_id: v.optional(v.number()),
  away_team_id: v.optional(v.number()),
  match_status: v.string(),
  final_score_home: v.optional(v.number()),
  final_score_away: v.optional(v.number()),
})
type Schema = v.InferOutput<typeof schema>

const state = reactive({
  match_date: new Date().toISOString().substring(0, 10),
  kickoff_time: '20:00',
  home_team_id: undefined as number | undefined,
  away_team_id: undefined as number | undefined,
  match_status: 'Scheduled',
  final_score_home: undefined as number | undefined,
  final_score_away: undefined as number | undefined,
})

const teamItems = computed<SelectMenuItem[]>(() => {
  if (pending.value || !teams.value) return []
  return teams.value.map(team => ({
    label: team.name,
    id: team.id,
  }))
})

const matchStatusItems: SelectMenuItem[] = [
  { label: 'Scheduled', id: 'Scheduled' },
  { label: 'Completed', id: 'Completed' },
  { label: 'Postponed', id: 'Postponed' },
]

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const season = new Date().getFullYear().toString()
  const { match_date, home_team_id, away_team_id, match_status, final_score_home, final_score_away } = event.data

  const homeTeam = teams.value.find(t => t.id === home_team_id)?.name
  const awayTeam = teams.value.find(t => t.id === away_team_id)?.name

  if (!homeTeam || !awayTeam) {
    toast.add({ title: 'Error', description: 'Both teams must be selected', color: 'error' })
    return
  }

  const final_score = match_status === 'Completed'
    ? `${final_score_home ?? 0} - ${final_score_away ?? 0}`
    : ''
  const half_time = ''

  const payload = {
    season,
    match_date,
    home_team: homeTeam,
    away_team: awayTeam,
    home_team_id,
    away_team_id,
    final_score,
    half_time,
  }

try {
  const data = await $fetch('/api/matches', {
    method: 'POST',
    body: payload,
  })

  toast.add({
    title: 'Match Added',
    description: 'The new football match has been scheduled.',
    color: 'success',
  })

  console.log('API Response:', data)
} catch (err: any) {
  toast.add({
    title: 'Error',
    description: 'Failed to create match',
    color: 'error',
  })
  console.error(err)
}

}

function onCancel() {
  console.log('Action cancelled')
}
</script>

<template>
  <div class="px-4 py-6 sm:px-6 lg:px-8">
    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
      <NuxtLink to="/dashboard" class="hover:text-primary-500">Dashboard</NuxtLink> /
      <NuxtLink to="/dashboard/matches" class="hover:text-primary-500">Matches</NuxtLink> /
      <span class="text-gray-900 dark:text-white">Add New Match</span>
    </p>

    <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
      Add a New Football Match
    </h1>

    <UCard>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <UFormField label="Match Date" name="match_date">
            <UInput v-model="state.match_date" type="date" class="w-full" icon="i-heroicons-calendar-days" />
          </UFormField>

          <UFormField label="Kick-off Time" name="kickoff_time">
            <UInput v-model="state.kickoff_time" type="time" class="w-full" icon="i-heroicons-clock" />
          </UFormField>

          <UFormField label="Home Team" name="home_team_id">
            <USelectMenu
              v-model="state.home_team_id"
              placeholder="Select home team"
              value-key="id"
              :items="teamItems"
              :searchable="true"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Away Team" name="away_team_id">
            <USelectMenu
              v-model="state.away_team_id"
              placeholder="Select away team"
              value-key="id"
              :items="teamItems"
              :searchable="true"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Match Status" name="match_status">
            <USelectMenu
              v-model="state.match_status"
              placeholder="Select status"
              value-key="id"
              :items="matchStatusItems"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Final Score" name="final_score">
            <div class="flex gap-2">
              <UInput
                v-model.number="state.final_score_home"
                placeholder="Home"
                type="number"
                class="flex-1 w-full"
                :disabled="state.match_status !== 'Completed'"
              />
              <UInput
                v-model.number="state.final_score_away"
                placeholder="Away"
                type="number"
                class="flex-1 w-full"
                :disabled="state.match_status !== 'Completed'"
              />
            </div>
          </UFormField>

        </div>

        <div class="flex justify-end pt-4 gap-3">
          <UButton color="neutral" variant="ghost" @click="onCancel">Cancel</UButton>
          <UButton type="submit" color="primary" icon="i-heroicons-plus">Add Match</UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
