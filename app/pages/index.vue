<template>
  <div class="min-h-screen flex flex-col overflow-hidden">
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 blur-3xl rounded-full animate-pulse-slow" />
    <div class="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-accent-400/10 blur-3xl rounded-full animate-pulse-slow" />

    <section class="flex flex-col items-center justify-center text-center flex-1 px-6 py-24 animate-slide-up">
      <h1 class="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
        Welcome to
        <span class="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 text-transparent bg-clip-text animate-gradient">
          Mpira Stats
        </span>
      </h1>

      <p class="mt-6 max-w-2xl text-muted text-lg md:text-xl leading-relaxed">
        Explore real-time insights into Malawi's football world — players, teams, and season stats brought to life with data and design.
      </p>

      <div class="mt-12 flex gap-6">
        <UButton size="lg" color="primary" class="hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary/20" to="/auth">
          Sign In
        </UButton>
        <UButton size="lg" color="neutral" variant="soft" class="hover:scale-105 transition-transform duration-300" to="/auth">
          Get Started
        </UButton>
      </div>
    </section>

    <section class="bg-elevated/60 py-20 px-6 border-t border-default">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-6xl mx-auto text-center">
        <div v-for="(item, i) in stats" :key="i" class="p-8 rounded-2xl bg-elevated backdrop-blur-md border border-default transition transform hover:-translate-y-1 hover:scale-105 hover:bg-primary/5">
          <p class="text-5xl font-extrabold text-primary">{{ item.value }}</p>
          <p class="text-muted mt-2 text-lg">{{ item.label }}</p>
        </div>
      </div>
    </section>

    <section class="py-24 px-6 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-t from-elevated/60 to-transparent" />
      <div class="max-w-5xl mx-auto text-center relative z-10">
        <h2 class="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-sky-400 to-cyan-500 bg-clip-text text-transparent">
          Season Performance Overview
        </h2>

        <div class="relative bg-elevated/60 rounded-2xl p-8 border border-default backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <ClientOnly>
            <Bar :data="chartData" :options="chartOptions" class="w-full h-96" />
          </ClientOnly>
        </div>
      </div>
    </section>

    <footer class="py-6 text-center text-muted border-t border-default">
      <p>&copy; 2025 <span class="text-primary font-semibold">MpiraStats</span> — Empowering Malawian Football</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

definePageMeta({ layout: false })

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const stats = [
  { value: '16', label: 'Teams' },
  { value: '340+', label: 'Players' },
  { value: '150+', label: 'Matches Analyzed' },
]

const chartData = {
  labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
  datasets: [
    {
      label: 'Goals Scored',
      backgroundColor: '#38bdf8',
      data: [12, 15, 18, 22, 25, 30],
    },
    {
      label: 'Matches Played',
      backgroundColor: '#22d3ee',
      data: [18, 20, 23, 25, 28, 30],
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#888' } },
  },
  scales: {
    x: {
      ticks: { color: '#888' },
      grid: { color: '#333' },
    },
    y: {
      ticks: { color: '#888' },
      grid: { color: '#333' },
    },
  },
}
</script>
