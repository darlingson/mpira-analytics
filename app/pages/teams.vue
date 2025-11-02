<template>
    <div
        class="min-h-screen bg-gray-950 text-gray-50 p-6 relative overflow-hidden"
    >
        <!-- Background Glows -->
        <div
            class="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/20 blur-3xl rounded-full animate-pulse-slow"
        />
        <div
            class="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-emerald-400/10 blur-3xl rounded-full animate-pulse-slow"
        />

        <!-- Header / Search -->
        <div class="max-w-6xl mx-auto mb-10 text-center">
            <h1 class="text-4xl md:text-5xl font-extrabold mb-2">
                Our
                <span
                    class="bg-gradient-to-r from-emerald-400 via-teal-300 to-yellow-400 text-transparent bg-clip-text animate-gradient"
                    >Teams</span
                >
            </h1>
            <p class="text-gray-400 mb-6">
                Browse all teams in the Malawi Super League 2024
            </p>

            <UInput
                v-model="search"
                placeholder="Search for a team..."
                icon="i-heroicons-magnifying-glass-20-solid"
                class="w-full max-w-lg mx-auto"
                :ui="{
                    base: 'text-lg',
                }"
            />
        </div>

        <div
            class="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6"
        >
            <UCard
                v-for="team in filteredTeams"
                :key="team.id"
                :ui="{
                    root: 'relative overflow-hidden hover:scale-105 hover:shadow-xl transition-transform duration-300 cursor-pointer bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl',
                    body: 'p-4 flex flex-col items-center',
                }"
                @click="navigateTo(`/team-performance/${team.id}`)"
            >
                <!-- Team Icon -->
                <div
                    class="flex justify-center items-center h-20 w-20 mb-4 p-3 rounded-lg border border-gray-800 bg-gradient-to-br from-teal-700/20 via-emerald-700/10 to-yellow-400/10 hover:scale-110 transition-transform duration-300"
                >
                    <UIcon
                        :name="team.icon"
                        class="w-full h-full text-teal-300"
                    />
                </div>
                <p
                    class="text-center font-bold text-xl text-teal-300 hover:text-yellow-400 transition-colors duration-300"
                >
                    {{ team.name }}
                </p>

                <p class="text-center text-gray-400 text-sm mt-1">
                    {{ team.league }} • {{ team.stadium }}
                </p>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useFetch } from "#app";

interface Team {
    id: number;
    name: string;
    slug: string;
    league: string;
    district: string;
    stadium: string;
    icon: string;
}

const search = ref("");
const teams = ref<Team[]>([]);

const fetchTeams = async () => {
    const { data } = await useFetch("/api/teams");
    teams.value = (data.value as Team[]) || [];
};

onMounted(() => fetchTeams());

const filteredTeams = computed(() => {
    if (!search.value) return teams.value;
    return teams.value.filter((team) =>
        team.name.toLowerCase().includes(search.value.toLowerCase()),
    );
});
</script>

<style scoped>
@keyframes gradient-move {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

@keyframes pulse-slow {
    0%,
    100% {
        opacity: 0.4;
        transform: scale(1);
    }
    50% {
        opacity: 0.7;
        transform: scale(1.1);
    }
}

.animate-gradient {
    background-size: 200% 200%;
    animation: gradient-move 8s ease infinite;
}

.animate-pulse-slow {
    animation: pulse-slow 8s ease-in-out infinite;
}
</style>
