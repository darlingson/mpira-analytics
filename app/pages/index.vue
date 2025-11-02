<template>
    <div
        class="min-h-screen bg-gray-950 text-gray-50 flex flex-col overflow-hidden"
    >
        <!-- Animated Background Lights -->
        <div
            class="absolute inset-0 -z-10 bg-gradient-to-b from-teal-700/20 via-gray-950 to-black animate-gradient-move"
        />
        <div
            class="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/20 blur-3xl rounded-full animate-pulse-slow"
        />
        <div
            class="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-emerald-400/10 blur-3xl rounded-full animate-pulse-slow"
        />

        <!-- Hero Section -->
        <section
            class="flex flex-col items-center justify-center text-center flex-1 px-6 py-24"
        >
            <h1
                class="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight"
            >
                Welcome to
                <span
                    class="bg-gradient-to-r from-emerald-400 via-teal-300 to-yellow-400 text-transparent bg-clip-text animate-gradient"
                >
                    Mpira Stats
                </span>
            </h1>

            <p
                class="mt-6 max-w-2xl text-gray-400 text-lg md:text-xl leading-relaxed transition-opacity duration-700"
            >
                Explore real-time insights into Malawi’s football world —
                players, teams, and season stats brought to life with data and
                design.
            </p>

            <div class="mt-12 flex gap-6">
                <UButton
                    size="lg"
                    color="primary"
                    class="hover:scale-105 transition-transform duration-300 shadow-lg shadow-teal-500/20"
                    to="/home"
                >
                    ⚽ Explore Teams
                </UButton>
                <UButton
                    size="lg"
                    color="neutral"
                    variant="soft"
                    class="hover:scale-105 transition-transform duration-300"
                    to="/about"
                >
                    📊 Learn More
                </UButton>
            </div>
        </section>

        <!-- Stats Cards -->
        <section class="bg-gray-900/60 py-20 px-6 border-t border-gray-800">
            <div
                class="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-6xl mx-auto text-center"
            >
                <div
                    v-for="(item, i) in stats"
                    :key="i"
                    class="p-8 rounded-2xl bg-gradient-to-b from-gray-800/60 to-gray-900/30 hover:from-teal-800/30 hover:to-gray-800/20 backdrop-blur-md border border-gray-800 transition transform hover:-translate-y-1 hover:scale-105"
                >
                    <p class="text-5xl font-extrabold text-teal-400">
                        {{ item.value }}
                    </p>
                    <p class="text-gray-400 mt-2 text-lg">{{ item.label }}</p>
                </div>
            </div>
        </section>

        <!-- Interactive Chart Section -->
        <section class="bg-gray-950 py-24 px-6 relative overflow-hidden">
            <div
                class="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"
            />
            <div class="max-w-5xl mx-auto text-center relative z-10">
                <h2
                    class="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent"
                >
                    Season Performance Overview
                </h2>

                <div
                    class="relative bg-gray-900/60 rounded-2xl p-8 border border-gray-800 backdrop-blur-sm hover:shadow-lg hover:shadow-teal-400/10 transition-all duration-300"
                >
                    <ClientOnly>
                        <Bar
                            :data="chartData"
                            :options="chartOptions"
                            class="w-full h-96"
                        />
                    </ClientOnly>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="py-6 text-center text-gray-500 border-t border-gray-800">
            <p>
                © 2025
                <span class="text-teal-400 font-semibold">MpiraStats</span> —
                Empowering Malawian Football
            </p>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { Bar } from "vue-chartjs";
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
} from "chart.js";

definePageMeta({
    layout: false,
});

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
);

const stats = [
    { value: "16", label: "Teams" },
    { value: "340+", label: "Players" },
    { value: "150+", label: "Matches Analyzed" },
];

const chartData = {
    labels: ["2019", "2020", "2021", "2022", "2023", "2024"],
    datasets: [
        {
            label: "Goals Scored",
            backgroundColor: "#14b8a6",
            data: [12, 15, 18, 22, 25, 30],
        },
        {
            label: "Matches Played",
            backgroundColor: "#facc15",
            data: [18, 20, 23, 25, 28, 30],
        },
    ],
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { labels: { color: "#fff" } },
    },
    scales: {
        x: {
            ticks: { color: "#aaa" },
            grid: { color: "#333" },
        },
        y: {
            ticks: { color: "#aaa" },
            grid: { color: "#333" },
        },
    },
};
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
