<template>
  <div class="container py-6">

    <h2 class="text-2xl font-bold text-white mb-4">
      Match Details - {{ matchData.matchInfo[0]?.home_team }} vs {{ matchData.matchInfo[0]?.away_team }}
    </h2>

    <div class="bg-gray-800 p-4 rounded mb-6 text-white">
      <p><strong>Season:</strong> {{ matchData.matchInfo[0]?.season }}</p>
      <p><strong>Date:</strong> {{ matchData.matchInfo[0]?.match_date }}</p>
      <p><strong>Score:</strong> {{ matchData.matchInfo[0]?.final_score || 'Pending' }}</p>
      <p><strong>Half-time:</strong> {{ matchData.matchInfo[0]?.half_time || '-' }}</p>
    </div>

    <div class="flex justify-end mb-4">
      <button v-if="!showForm" @click="showForm = true"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
        Record New Event
      </button>
    </div>

    <Transition name="fade">
      <div v-if="showForm" class="mb-6">
        <h3 class="text-xl font-semibold text-white mb-2">Record New Event</h3>

        <form @submit.prevent="addEvent" class="bg-gray-800 p-4 rounded space-y-4 text-white">

          <div class="grid grid-cols-2 gap-4">
            <input v-model="newEvent.minute" type="text" placeholder="Minute (e.g. 23')"
              class="p-2 rounded bg-gray-700 w-full" />

            <input v-model="newEvent.player" type="text" placeholder="Player"
              class="p-2 rounded bg-gray-700 w-full" />
          </div>

          <div class="grid grid-cols-2 gap-4 items-center">
            <div>
              <UFormField label="Team" name="team">
                <USelectMenu
                  v-model="newEvent.team_id as number"
                  :items="teamOptions"
                  placeholder="Select team"
                  value-key="id"
                  label-key="name"
                  :searchable="true"
                  class="w-full"
                />
              </UFormField>
            </div>

            <select v-model="newEvent.type" class="p-2 rounded bg-gray-700 w-full">
              <option value="goal">Goal</option>
              <option value="yellow_card">Yellow Card</option>
              <option value="red_card">Red Card</option>
            </select>
          </div>

          <input v-model="newEvent.description" type="text" placeholder="Description"
            class="p-2 rounded bg-gray-700 w-full" />

          <input v-model="newEvent.score_at_event" type="text" placeholder="Score at event (e.g. 1 - 0)"
            class="p-2 rounded bg-gray-700 w-full" />

          <div class="flex justify-end gap-3">
            <button type="button" @click="cancelForm"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">
              Cancel
            </button>

            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
              Add Event
            </button>
          </div>

        </form>
      </div>
    </Transition>

    <h3 class="text-xl font-semibold text-white mb-2">Match Events</h3>
    <UTable
      :data="matchData.events"
      :columns="columns"
      :loading="pending"
      loading-color="primary"
      loading-animation="carousel"
      class="mb-6"
    />

  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const showForm = ref(false)

interface MatchInfo {
  id: number
  season: string
  match_date: string
  home_team: string
  away_team: string
  final_score?: string
  half_time?: string
  home_team_id: number
  away_team_id: number
}

interface Event {
  id: number
  minute: string
  player: string
  team: string
  team_id: number
  type: string
  description: string
  score_at_event: string
}

interface MatchData {
  matchInfo: MatchInfo[]
  events: Event[]
}

const { data: matchData, pending, refresh } = await useLazyFetch<MatchData>(
  `/api/matches/${route.params.id}`,
  {
    default: () => ({ matchInfo: [], events: [] }),
  }
)
const teamOptions = computed(() => {
  const info = matchData.value.matchInfo?.[0]
  if (!info) return []
  return [
    { id: info.home_team_id, name: info.home_team },
    { id: info.away_team_id, name: info.away_team }
  ]
})

const columns: TableColumn<Event>[] = [
  { accessorKey: 'minute', header: 'Minute' },
  { accessorKey: 'player', header: 'Player' },
  { accessorKey: 'team', header: 'Team' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'score_at_event', header: 'Score at Event' },
]

const newEvent = ref({
  minute: '',
  player: '',
  team_id: null as number | null,
  type: 'goal',
  description: '',
  score_at_event: '',
})

const cancelForm = () => {
  showForm.value = false
  newEvent.value = { minute: '', player: '', team_id: null, type: 'goal', description: '', score_at_event: '' }
}

const addEvent = async () => {
  if (!newEvent.value.minute || !newEvent.value.team_id || !newEvent.value.type) return

  const selectedTeam = teamOptions.value.find(t => t.id === newEvent.value.team_id)
  if (!selectedTeam) return

  await $fetch(`/api/matches/${route.params.id}/events`, {
    method: 'POST',
    body: {
      ...newEvent.value,
      team: selectedTeam.name,
    }
  })

  await refresh()
  cancelForm()
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
