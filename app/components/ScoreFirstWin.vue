<script setup lang="ts">
// Data setup in the Vue 3 Composition API
const scoreFirstData = [
    {
        team: "Nyasa Big Bullets",
        scored_first: 18,
        won: 15,
        win_rate: 83.3,
    },
    {
        team: "Silver Strikers",
        scored_first: 15,
        won: 12,
        win_rate: 80.0,
    },
    {
        team: "Mighty Mukuru Wanderers",
        scored_first: 14,
        won: 10,
        win_rate: 71.4,
    },
];

// The Card and Progress components are assumed to be auto-imported
// as <UCard> and <UProgress> from a UI library like Nuxt UI.
// If you are using a custom/headless component setup (like Shadcn-vue),
// you would ensure they are correctly imported or auto-imported.
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-accent p-3">
                <UIcon
                    name="lucide:target"
                    class="h-8 w-8 text-accent-foreground"
                />
            </div>
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-balance">
                    SCORE FIRST, WIN GAME
                </h2>
                <p class="text-muted-foreground text-pretty">
                    Impact of scoring the opening goal
                </p>
            </div>
        </div>

        <div class="grid gap-4">
            <UCard
                v-for="(team, idx) in scoreFirstData"
                :key="team.team"
                class="p-6 bg-card border-border"
            >
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4 flex-1">
                        <div
                            class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-xl font-bold text-accent"
                        >
                            {{ idx + 1 }}
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-bold mb-3">
                                {{ team.team }}
                            </h3>
                            <div class="flex items-center gap-4">
                                <div class="flex-1">
                                    <div
                                        class="flex items-center justify-between mb-2"
                                    >
                                        <span
                                            class="text-sm text-muted-foreground"
                                            >Win Rate</span
                                        >
                                        <span
                                            class="text-xl font-bold text-accent"
                                            >{{ team.win_rate }}%</span
                                        >
                                    </div>
                                    <UProgress
                                        :value="team.win_rate"
                                        class="h-2"
                                    />
                                </div>
                                <div class="text-center px-6">
                                    <p
                                        class="text-sm text-muted-foreground mb-1"
                                    >
                                        Scored First
                                    </p>
                                    <p class="text-2xl font-bold">
                                        {{ team.scored_first }}
                                    </p>
                                </div>
                                <div class="text-center px-6">
                                    <p
                                        class="text-sm text-muted-foreground mb-1"
                                    >
                                        Won
                                    </p>
                                    <p class="text-2xl font-bold text-accent">
                                        {{ team.won }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </UCard>
        </div>
    </section>
</template>
