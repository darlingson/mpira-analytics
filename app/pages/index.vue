<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">

    <!-- Header Section -->
    <header class="text-center mt-12">
      <h1 class="text-5xl font-bold">The Ultimate Hub for Malawian Football Statistics</h1>
      <p class="mt-4 text-gray-400">Dive deep into the world of Malawian football. Explore comprehensive stats on teams, players, and seasons. Your go-to source for in-depth analysis.</p>
      <div class="mt-6">
        <UButton label="Explore Teams" color="blue" />
      </div>
    </header>

    <!-- Stats Section -->
    <section class="mt-12 w-full max-w-7xl">
      <div class="bg-teal-500 p-8 rounded-lg text-center">
        <h2 class="text-4xl font-bold text-white">Mpira STATS</h2>

        <!-- 3D Soccer Ball -->
        <div class="mt-8">
          <ClientOnly>
            <SimpleSoccerBall />
          </ClientOnly>
        </div>

        <!-- Chart Component -->
        <div class="mt-8">
          <ClientOnly>
            <Bar :data="chartData" :options="chartOptions" class="w-full h-96" />
          </ClientOnly>
        </div>
      </div>
    </section>

    <!-- Footer -->
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import SimpleSoccerBall from '~/components/SoccerBall3D.vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartData = {
  labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
  datasets: [
    {
      label: 'Goals Scored',
      backgroundColor: '#ffffff',
      data: [10, 15, 12, 18, 20, 22, 25],
    },
    {
      label: 'Matches Played',
      backgroundColor: '#ff6384',
      data: [20, 22, 18, 25, 23, 27, 30],
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}
</script>

<style scoped>
/* Custom styles can go here */
</style>
