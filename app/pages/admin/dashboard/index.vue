<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import { computed } from 'vue'

interface Match {
    id: number;
    season: string;
    match_date: string;
    home_team: string;
    away_team: string;
    final_score: string;
    half_time: string;
    home_team_id: number;
    away_team_id: number;
}


definePageMeta({
    layout: 'admin',
})

const { data: matches } = await useLazyFetch<Match[]>('/api/matches/recent', {
    default: () => [] as Match[],
})

const simplifiedMatches = computed(() => {
    return matches.value.map(m => {
        const today = new Date()
        const matchDay = new Date(m.match_date)
        let status = ""

        if (matchDay > today) {
            status = "Upcoming"
        } else if (!m.final_score) {
            status = "Pending"
        } else {
            status = "Completed"
        }

        return {
            match: `${m.home_team} vs ${m.away_team}`,
            date: m.match_date,
            status,
            actions: "View"
        }
    })
})

</script>

<template>
    <div class="space-y-8 p-8">

        <div class="flex justify-between items-center">
            <h1 class="text-3xl font-bold text-white">Dashboard Overview</h1>
            <UButton icon="i-heroicons-plus" size="md" color="primary" variant="solid" to="/admin/dashboard/matches/new">
                + Add New Match
            </UButton>
        </div>

        <hr class="border-gray-700">

        <section>
            <h2 class="text-2xl font-semibold mb-6 text-white">Quick Actions</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                <UCard class="bg-gray-800 hover:bg-gray-700 border border-gray-700 transition"
                    >
                    <NuxtLink to="/admin/dashboard/matches/new">
                        <div class="h-40 bg-gray-600 rounded-t-lg">
                            <img src="https://picsum.photos/400/200?random=1" alt="Add New Match"
                                class="w-full h-full object-cover rounded-t-lg">
                        </div>
                        <div class="p-4">
                            <h3 class="text-xl font-bold mb-2 text-white">Add New Match</h3>
                            <p class="text-gray-400 text-sm">Create a new match entry with teams, date, and venue.</p>
                        </div>
                    </NuxtLink>
                </UCard>

                <UCard class="bg-gray-800 hover:bg-gray-700 border border-gray-700 transition">
                    <NuxtLink to="/admin/dashboard/teams/new">
                        <div class="h-40 bg-gray-600 rounded-t-lg">
                            <img src="https://picsum.photos/400/200?random=2" alt="Add New Team"
                                class="w-full h-full object-cover rounded-t-lg">
                        </div>
                        <div class="p-4">
                            <h3 class="text-xl font-bold mb-2 text-white">Add New Team</h3>
                            <p class="text-gray-400 text-sm">Add a new team to the database with its details.</p>
                        </div>
                    </NuxtLink>
                </UCard>

                <UCard class="bg-gray-800 hover:bg-gray-700 border border-gray-700 transition">
                    <NuxtLink to="/admin/dashboard/players">
                        <div class="h-40 bg-gray-600 rounded-t-lg">
                            <img src="https://picsum.photos/400/200?random=3" alt="Manage Players"
                                class="w-full h-full object-cover rounded-t-lg">
                        </div>
                        <div class="p-4">
                            <h3 class="text-xl font-bold mb-2 text-white">Manage Players</h3>
                            <p class="text-gray-400 text-sm">View, edit, and update player profiles and statistics.</p>
                        </div>
                    </NuxtLink>
                </UCard>
            </div>
        </section>

        <hr class="border-gray-700">

        <section>
            <h2 class="text-2xl font-semibold mb-4 text-white">Recent Match Updates</h2>

            <UTable :data="simplifiedMatches" class="flex-1" />
        </section>
    </div>
</template>