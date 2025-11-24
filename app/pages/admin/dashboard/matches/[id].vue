<template>
    <div class="container py-6">

        <!-- Match Info -->
        <h2 class="text-2xl font-bold text-white mb-4">
            Match Details - {{ matchData.matchInfo[0]?.home_team }} vs {{ matchData.matchInfo[0]?.away_team }}
        </h2>

        <div class="bg-gray-800 p-4 rounded mb-6 text-white">
            <p><strong>Season:</strong> {{ matchData.matchInfo[0]?.season }}</p>
            <p><strong>Date:</strong> {{ matchData.matchInfo[0]?.match_date }}</p>
            <p><strong>Score:</strong> {{ matchData.matchInfo[0]?.final_score || 'Pending' }}</p>
            <p><strong>Half-time:</strong> {{ matchData.matchInfo[0]?.half_time || '-' }}</p>
        </div>

        <!-- Add Event Button -->
        <div class="flex justify-end mb-4">
            <button v-if="!showForm" @click="showForm = true"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
                Record New Event
            </button>
        </div>

        <Transition name="fade">
            <div>
                <div v-if="showForm">
                    <UCard class="mb-6" variant="subtle">
                        <template #header>
                            <h3 class="text-xl font-semibold">Record New Event</h3>
                        </template>
                        <div class="p-6 rounded-xl text-white">
                            <div class="flex flex-col w-full gap-4">
                                <div class="flex gap-4">
                                    <div class="flex-1">
                                        <UInput v-model="formState.minute" placeholder="Minute e.g 23'" class="w-full" />
                                    </div>
                                    <div class="flex-1">
                                        <UInput v-model="formState.player" placeholder="Player name" class="w-full" />
                                    </div>
                                </div>

                                <div class="flex gap-4">
                                    <div class="flex-1">
                                        <USelectMenu v-model="formState.team_id as number" :items="teamOptions"
                                            placeholder="Select team" value-key="id" label-key="name" :searchable="true"
                                            class="w-full" />
                                    </div>
                                    <div class="flex-1">
                                        <USelectMenu v-model="formState.type" :items="eventTypes"
                                            placeholder="Select type" label-key="label" value-key="value"
                                            class="w-full" />
                                    </div>
                                </div>

                                <div class="flex gap-4">
                                    <UInput v-model="formState.description" placeholder="Description e.g penalty" class="w-full" />

                                    <div class="space-y-2">
                                        <UInput v-model="formState.score_at_event" placeholder="score at event e.g 1-0" class="w-full" />
                                    </div>
                                </div>

                                <div class="flex justify-end gap-3 pt-4">
                                    <UButton type="button" color="neutral" @click="cancelForm" :disabled="isLoading">
                                        Cancel
                                    </UButton>
                                    <UButton type="button" color="primary" @click="addEvent" :loading="isLoading">
                                        Add Event
                                    </UButton>
                                </div>
                            </div>
                        </div>
                    </UCard>
                </div>

            </div>
        </Transition>

        <!-- Match Events Table -->
        <h3 class="text-xl font-semibold text-white mb-2">Match Events</h3>
        <UTable :data="matchData.events" :columns="columns" :loading="pending" loading-color="primary"
            loading-animation="carousel" class="mb-6" />

    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const showForm = ref(false)
const isLoading = ref(false)

// Toast
const toast = useToast()

// Match Data
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
    { default: () => ({ matchInfo: [], events: [] }) }
)

// Form state
const formState = reactive({
    minute: '',
    player: '',
    team_id: null as number | null,
    type: 'goal',
    description: '',
    score_at_event: ''
})

const teamOptions = computed(() => {
    const info = matchData.value.matchInfo?.[0]
    if (!info) return []
    return [
        { id: info.home_team_id, name: info.home_team },
        { id: info.away_team_id, name: info.away_team }
    ]
})

const eventTypes = [
    { label: 'Goal', value: 'goal' },
    { label: 'Yellow Card', value: 'yellow_card' },
    { label: 'Red Card', value: 'red_card' }
]

// Table columns
const columns: TableColumn<Event>[] = [
    { accessorKey: 'minute', header: 'Minute' },
    { accessorKey: 'player', header: 'Player' },
    { accessorKey: 'team', header: 'Team' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'score_at_event', header: 'Score at Event' },
]

// Cancel form
const cancelForm = () => {
    showForm.value = false
    Object.assign(formState, { minute: '', player: '', team_id: null, type: 'goal', description: '', score_at_event: '' })
}

// Add Event
const addEvent = async () => {
    if (!formState.minute || !formState.team_id || !formState.type) return

    const selectedTeam = teamOptions.value.find(t => t.id === formState.team_id)
    if (!selectedTeam) return

    isLoading.value = true
    try {
        await $fetch(`/api/matches/${route.params.id}/events`, {
            method: 'POST',
            body: { ...formState, team: selectedTeam.name }
        })

        toast.add({ title: 'Event added successfully!', color: 'success' })
        await refresh()
        cancelForm()
    } catch (err) {
        console.error(err)
        toast.add({ title: 'Failed to add event.', color: 'error' })
    } finally {
        isLoading.value = false
    }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
