<template>
  <div class="flex h-screen">
    <aside class="w-64 bg-elevated border-r border-default flex flex-col shadow-lg shadow-primary/10 relative">
      <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 animate-gradient" />

      <div class="px-5 py-6 border-b border-default text-center">
        <h1 class="text-xl font-extrabold tracking-tight">
          <span class="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent animate-gradient">
            Mpira Stats
          </span>
        </h1>
        <p class="text-xs text-muted mt-1">Malawi Super League 2024</p>
      </div>

      <div class="px-5 py-4">
        <UInput v-model="q" placeholder="Search..." icon="i-heroicons-magnifying-glass" size="sm" color="neutral" variant="outline" class="text-sm" />
      </div>

      <nav class="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
          :class="{
            'bg-primary/20 text-primary border border-primary/30 shadow-md shadow-primary/10': route.path === item.to,
            'hover:bg-accented hover:text-primary text-muted': route.path !== item.to,
          }">
          <UIcon :name="item.icon" class="mr-3 h-5 w-5" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="px-5 py-4 border-t border-default text-sm text-muted">
        <NuxtLink to="/settings" class="flex items-center justify-center gap-2 hover:text-primary transition-all duration-200"
          :class="{ 'text-primary font-medium': route.path === '/settings' }">
          <UIcon name="i-heroicons-cog-6-tooth" class="h-5 w-5" />
          Settings
        </NuxtLink>
      </div>
    </aside>

    <main class="flex-1 overflow-auto p-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from '#app'

const q = ref('')
const route = useRoute()

const navItems = [
  { label: 'Dashboard', to: '/home', icon: 'i-heroicons-home' },
  { label: 'Teams', to: '/teams', icon: 'i-heroicons-users' },
  { label: 'Matches', to: '/matches', icon: 'i-heroicons-sparkles' },
  { label: 'Players', to: '/players', icon: 'i-heroicons-trophy' },
]
</script>
