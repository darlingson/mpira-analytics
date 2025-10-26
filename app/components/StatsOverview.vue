<script setup lang="ts">
// In Nuxt 3/Vue 3, we don't import components for the data/logic
// like we would in React. We just define the reactive state.

// Icon names for Nuxt UI's Icon component (using 'lucide' prefix for the set)
const stats = [
    {
        label: "Total Matches",
        value: "156",
        icon: "lucide:trophy",
        change: "+12 this week",
    },
    {
        label: "Comeback Wins",
        value: "23",
        icon: "lucide:trending-up",
        change: "14.7% of games",
    },
    {
        label: "Heartbreakers",
        value: "18",
        icon: "lucide:heart",
        change: "11.5% of games",
    },
    {
        label: "Late Winners",
        value: "34",
        icon: "lucide:clock",
        change: "After 80th min",
    },
];
</script>

<template>
    <section class="border-b border-border bg-card">
        <div class="container mx-auto px-4 py-12">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                    v-for="stat in stats"
                    :key="stat.label"
                    class="relative overflow-hidden rounded-lg border border-border bg-background p-6"
                >
                    <div class="flex items-start justify-between">
                        <div>
                            <p
                                class="text-sm font-medium text-muted-foreground uppercase tracking-wide"
                            >
                                {{ stat.label }}
                            </p>
                            <p class="mt-2 text-4xl font-bold tracking-tight">
                                {{ stat.value }}
                            </p>
                            <p class="mt-1 text-sm text-accent">
                                {{ stat.change }}
                            </p>
                        </div>

                        <div class="rounded-lg bg-primary/10 p-3">
                            <UIcon
                                :name="stat.icon"
                                class="h-6 w-6 text-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
