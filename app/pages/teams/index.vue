<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface Team {
  id: number
  name: string
  shortName: string | null
  logoUrl: string | null
  country: string | null
}

const { data: teams, error, status } = await useFetch<Team[]>('/api/teams')
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold">Teams</h1>
      <p class="text-muted mt-1">Clubs competing in Malawi football</p>
    </div>

    <div v-if="status === 'pending'" class="flex justify-center py-16">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-muted" />
    </div>

    <div v-else-if="error" class="text-center py-16">
      <p class="text-muted">Failed to load teams. Please try again later.</p>
    </div>

    <div v-else-if="!teams?.length" class="text-center py-16">
      <p class="text-muted">No teams found.</p>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <NuxtLink v-for="team in teams" :key="team.id" :to="`/teams/${team.id}`"
        class="flex items-center gap-4 rounded-xl border border-default bg-elevated p-5 transition hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5">
        <div class="h-14 w-14 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <span v-if="!team.logoUrl" class="text-lg font-bold text-muted">{{ team.shortName?.charAt(0) || team.name.charAt(0) }}</span>
          <img v-else :src="team.logoUrl" :alt="team.name" class="h-full w-full object-contain" />
        </div>
        <div class="min-w-0">
          <p class="font-semibold truncate">{{ team.name }}</p>
          <p class="text-xs text-muted truncate">{{ team.shortName }}<span v-if="team.country"> · {{ team.country }}</span></p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
