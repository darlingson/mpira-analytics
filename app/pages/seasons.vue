<template>
    <div class="flex flex-col gap-6">
        <h1 class="font-bold text-2xl text-(--ui-primary)">Seasons Performance</h1>

        <UTabs :items="items" variant="link" :ui="{ trigger: 'grow' }" class="gap-4 w-full">
            <template #table="{ item }">
                <div v-if="data && data.data" class="space-y-8">
                    <div v-for="season in data.data" :key="season.season" class="space-y-4">
                        <h2 class="font-semibold text-xl text-(--ui-primary)">{{ season.season }}</h2>
                        <UTable :data="season.stats" :columns="columns" :loading="pending" class="w-full" />
                    </div>
                </div>
            </template>
            <template #team="{ item }">
                <div v-if="data && data.data" class="space-y-4">
                    <USelectMenu v-model="selectedTeams" :items="teamOptions" multiple placeholder="Select Teams"
                        searchable />
                    <div v-if="selectedTeams.length >= 2" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="team in selectedTeams" :key="team"
                            class="border p-4 rounded shadow bg-white dark:bg-gray-900">
                            <h3 class="font-bold text-lg text-(--ui-primary)">{{ team }}</h3>
                            <div v-for="season in data.data" :key="season.season">
                                <div v-if="season.stats && season.stats.length" v-for="stat in season.stats">
                                    <div :key="stat.team" v-if="stat.team === team">
                                        <p class="text-sm text-gray-500">{{ season.season }}</p>
                                        <ul class="text-sm grid grid-cols-2 gap-x-4">
                                            <li>Matches: {{ stat.teamStats.matches_played }}</li>
                                            <li>Wins: {{ stat.teamStats.wins }}</li>
                                            <li>Draws: {{ stat.teamStats.draws }}</li>
                                            <li>Losses: {{ stat.teamStats.losses }}</li>
                                            <li>Goals Scored: {{ stat.teamStats.goals_scored ?? '-' }}</li>
                                            <li>Goals Conceded: {{ stat.teamStats.goals_conceded ?? '-' }}</li>
                                        </ul>
                                        <hr class="my-2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template #season="{ item }">
                <div v-if="data && data.data" class="space-y-4">
                    <USelectMenu v-model="selectedTeamForSeasonCompare as string" :items="teamOptions" placeholder="Select Team"
                        searchable />
                    <div v-if="selectedTeamForSeasonCompare" class="space-y-2">
                        <h3 class="font-bold text-lg text-(--ui-primary)">
                            {{ selectedTeamForSeasonCompare }} – Season Comparison
                        </h3>
                        <div v-for="season in data.data" :key="season.season"
                            class="border p-4 rounded shadow bg-white dark:bg-gray-900">
                            <div v-if="season.stats && season.stats.length" v-for="stat in season.stats"
                                :key="stat.team">
                                <div v-if="stat.team === selectedTeamForSeasonCompare">
                                    <p class="text-sm text-gray-500">{{ season.season }}</p>
                                    <ul class="text-sm grid grid-cols-2 gap-x-4">
                                        <li>Matches: {{ stat.teamStats.matches_played }}</li>
                                        <li>Wins: {{ stat.teamStats.wins }}</li>
                                        <li>Draws: {{ stat.teamStats.draws }}</li>
                                        <li>Losses: {{ stat.teamStats.losses }}</li>
                                        <li>Goals Scored: {{ stat.teamStats.goals_scored ?? '-' }}</li>
                                        <li>Goals Conceded: {{ stat.teamStats.goals_conceded ?? '-' }}</li>
                                        <li>Goal Diff: {{ stat.teamStats.goal_difference ?? '-' }}</li>
                                        <li>Clean Sheets: {{ stat.teamStats.clean_sheets }}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </UTabs>

        <UProgress v-if="pending" animation="carousel" />

        <UAlert v-if="error" variant="solid" title="Error" :description="error.message" icon="i-lucide-alert-circle" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import type { TabsItem } from '@nuxt/ui';

definePageMeta({
    layout: 'default',
});

const items = [
    {
        label: 'Table View',
        description: 'View season performance in a table format.',
        icon: 'i-lucide-user',
        slot: 'table' as const
    },
    {
        label: 'Team Comparison',
        description: 'Compare stats between selected teams.',
        icon: 'i-lucide-lock',
        slot: 'team' as const
    },
    {
        label: 'Season Comparison',
        description: 'Compare stats for a team across seasons.',
        icon: 'i-lucide-lock',
        slot: 'season' as const
    }
] satisfies TabsItem[];

interface Welcome {
    message: string;
    data: Datum[];
}

interface Datum {
    season: string;
    stats: Stat[];
}

interface Stat {
    team: string;
    teamStats: TeamStats;
}

interface TeamStats {
    matches_played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_scored: number | null;
    goals_conceded: number | null;
    goal_difference: number | null;
    home_goals: number | null;
    away_goals: number | null;
    avg_goals_per_game: number | null;
    avg_goals_conceded_per_game: number | null;
    clean_sheets: number;
    failed_to_score: number;
    home_matches: number;
    away_matches: number;
    home_record: string;
    away_record: string;
}

const { data, pending, error } = await useAsyncData<Welcome>('seasons-performance', () =>
    $fetch('/api/seasons/performance')
);

const selectedTab = ref(0);
const selectedTeams = ref<string[]>([]);
const selectedTeamForSeasonCompare = ref<string | null>(null);

const teamOptions = computed(() => {
    const teams = new Set<string>();
    data.value?.data.forEach((season) => {
        season.stats.forEach((stat) => teams.add(stat.team));
    });
    return Array.from(teams);
});

const columns: TableColumn<Stat>[] = [
    { accessorKey: 'team', header: 'Team' },
    { accessorKey: 'teamStats.matches_played', header: 'Matches Played' },
    { accessorKey: 'teamStats.wins', header: 'Wins' },
    { accessorKey: 'teamStats.draws', header: 'Draws' },
    { accessorKey: 'teamStats.losses', header: 'Losses' },
    { accessorKey: 'teamStats.goals_scored', header: 'Goals Scored' },
    { accessorKey: 'teamStats.goals_conceded', header: 'Goals Conceded' },
    { accessorKey: 'teamStats.goal_difference', header: 'Goal Difference' },
    { accessorKey: 'teamStats.home_goals', header: 'Home Goals' },
    { accessorKey: 'teamStats.away_goals', header: 'Away Goals' },
    { accessorKey: 'teamStats.avg_goals_per_game', header: 'Avg Goals/Game' },
    { accessorKey: 'teamStats.avg_goals_conceded_per_game', header: 'Avg Goals Conceded/Game' },
    { accessorKey: 'teamStats.clean_sheets', header: 'Clean Sheets' },
    { accessorKey: 'teamStats.failed_to_score', header: 'Failed to Score' },
    { accessorKey: 'teamStats.home_matches', header: 'Home Matches' },
    { accessorKey: 'teamStats.away_matches', header: 'Away Matches' },
    { accessorKey: 'teamStats.home_record', header: 'Home Record' },
    { accessorKey: 'teamStats.away_record', header: 'Away Record' },
];

watch(selectedTeams, (newTeams) => {
    const filtered = newTeams.filter(team => teamOptions.value.includes(team));
    if (filtered.length !== newTeams.length || !filtered.every((val, index) => val === newTeams[index])) {
        selectedTeams.value = filtered;
    }
});


watch(selectedTeamForSeasonCompare, (newTeam) => {
    if (newTeam && !teamOptions.value.includes(newTeam)) {
        selectedTeamForSeasonCompare.value = null;
    }
});

</script>