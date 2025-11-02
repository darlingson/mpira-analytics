<template>
    <div class="flex h-screen bg-gray-950 text-gray-50">
        <!-- Sidebar -->
        <aside
            class="w-64 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 flex flex-col shadow-lg shadow-teal-500/10 relative"
        >
            <!-- Glowing Accent -->
            <div
                class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-emerald-500 to-yellow-400 animate-gradient"
            />

            <!-- Header -->
            <div class="px-5 py-6 border-b border-gray-800 text-center">
                <h1 class="text-xl font-extrabold tracking-tight">
                    <span
                        class="bg-gradient-to-r from-emerald-400 via-teal-300 to-yellow-400 bg-clip-text text-transparent animate-gradient"
                    >
                        Mpira Stats
                    </span>
                </h1>
                <p class="text-xs text-gray-400 mt-1">
                    Malawi Super League 2024
                </p>
            </div>

            <!-- Search -->
            <div class="px-5 py-4">
                <UInput
                    v-model="q"
                    placeholder="Search..."
                    icon="i-heroicons-magnifying-glass"
                    size="sm"
                    color="neutral"
                    variant="outline"
                    class="text-sm"
                />
            </div>

            <!-- Navigation -->
            <nav class="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
                <NuxtLink
                    v-for="item in navItems"
                    :key="item.to"
                    :to="item.to"
                    class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
                    :class="{
                        'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-md shadow-teal-500/10':
                            route.path === item.to,
                        'hover:bg-gray-800/60 hover:text-teal-300 text-gray-400':
                            route.path !== item.to,
                    }"
                >
                    <UIcon :name="item.icon" class="mr-3 h-5 w-5" />
                    {{ item.label }}
                </NuxtLink>
            </nav>

            <!-- Footer -->
            <div
                class="px-5 py-4 border-t border-gray-800 text-sm text-gray-400"
            >
                <NuxtLink
                    to="/settings"
                    class="flex items-center justify-center gap-2 hover:text-teal-300 transition-all duration-200"
                    :class="{
                        'text-teal-300 font-medium': route.path === '/settings',
                    }"
                >
                    <UIcon name="i-heroicons-cog-6-tooth" class="h-5 w-5" />
                    Settings
                </NuxtLink>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-auto p-8 bg-gray-950 relative">
            <div
                class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.05),transparent_70%)] pointer-events-none"
            />
            <slot />
        </main>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "#app";

const q = ref("");
const route = useRoute();

const navItems = [
    { label: "Dashboard", to: "/home", icon: "i-heroicons-home" },
    { label: "Teams", to: "/teams", icon: "i-heroicons-users" },
    { label: "Matches", to: "/matches", icon: "i-heroicons-sparkles" },
    { label: "Players", to: "/players", icon: "i-heroicons-trophy" },
];
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

.animate-gradient {
    background-size: 200% 200%;
    animation: gradient-move 6s ease infinite;
}
</style>
