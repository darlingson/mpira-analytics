<template>
  <UContainer class="py-6 space-y-8">
    <h1 class="text-2xl font-bold">Football Admin Panel</h1>

    <!-- Add Team -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">Add Team</h2>
      </template>
      <UForm :state="teamForm" @submit="submitTeam">
        <UInput v-model="teamForm.name" placeholder="Name" class="mb-2" />
        <UInput v-model="teamForm.team_slug" placeholder="Slug" class="mb-2" />
        <UInput v-model="teamForm.league" placeholder="League" class="mb-2" />
        <UInput v-model="teamForm.home_district" placeholder="Home District" class="mb-2" />
        <UInput v-model="teamForm.home_stadium" placeholder="Home Stadium" class="mb-2" />
        <UButton type="submit" label="Add Team" />
      </UForm>
    </UCard>

    <!-- Add Match -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">Add Match</h2>
      </template>
      <UForm :state="matchForm" @submit="submitMatch">
        <UInput v-model="matchForm.season" placeholder="Season" class="mb-2" />
        <UInput v-model="matchForm.match_date" placeholder="Date (YYYY-MM-DD)" class="mb-2" />
        <UInput v-model="matchForm.home_team" placeholder="Home Team" class="mb-2" />
        <UInput v-model="matchForm.away_team" placeholder="Away Team" class="mb-2" />
        <UInput v-model="matchForm.final_score" placeholder="Final Score (e.g. 2-1)" class="mb-2" />
        <UInput v-model="matchForm.half_time" placeholder="Half Time Score" class="mb-2" />
        <UButton type="submit" label="Add Match" />
      </UForm>
    </UCard>

    <!-- Add Event -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">Add Match Event</h2>
      </template>
      <UForm :state="eventForm" @submit="submitEvent">
        <UInput v-model="eventForm.match_id" placeholder="Match ID" class="mb-2" />
        <UInput v-model="eventForm.minute" placeholder="Minute" class="mb-2" />
        <UInput v-model="eventForm.player" placeholder="Player" class="mb-2" />
        <UInput v-model="eventForm.team" placeholder="Team" class="mb-2" />
        <UInput v-model="eventForm.type" placeholder="Type (e.g. Goal)" class="mb-2" />
        <UInput v-model="eventForm.description" placeholder="Description" class="mb-2" />
        <UInput v-model="eventForm.score_at_event" placeholder="Score at Event" class="mb-2" />
        <UButton type="submit" label="Add Event" />
      </UForm>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
const teamForm = reactive({
  name: '',
  team_slug: '',
  league: '',
  home_district: '',
  home_stadium: ''
})

const matchForm = reactive({
  season: '',
  match_date: '',
  home_team: '',
  away_team: '',
  final_score: '',
  half_time: ''
})

const eventForm = reactive({
  match_id: '',
  minute: '',
  player: '',
  team: '',
  type: '',
  description: '',
  score_at_event: ''
})

const submitTeam = async () => {
  await $fetch('/api/teams', { method: 'POST', body: teamForm })
  Object.keys(teamForm).forEach(k => (teamForm as any)[k] = '')
}

const submitMatch = async () => {
  await $fetch('/api/matches', { method: 'POST', body: matchForm })
  Object.keys(matchForm).forEach(k => (matchForm as any)[k] = '')
}

const submitEvent = async () => {
  await $fetch('/api/events', { method: 'POST', body: eventForm })
  Object.keys(eventForm).forEach(k => (eventForm as any)[k] = '')
}
</script>