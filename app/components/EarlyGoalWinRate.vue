<script setup lang="ts">
// Data setup in the Vue 3 Composition API
const earlyGoalData = [
    {
        team: "Nyasa Big Bullets",
        early_goals: 6,
        wins: 5,
        win_rate: 83.3,
    },
    {
        team: "Silver Strikers",
        early_goals: 5,
        wins: 4,
        win_rate: 80.0,
    },
    {
        team: "Mighty Mukuru Wanderers",
        early_goals: 4,
        wins: 2,
        win_rate: 50.0,
    },
];

// Components Card and Progress are assumed to be auto-imported.
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-accent p-3">
                <UIcon
                    name="lucide:zap"
                    class="h-8 w-8 text-accent-foreground"
                />
            </div>
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-balance">
                    FAST STARTERS
                </h2>
                <p class="text-muted-foreground text-pretty">
                    Win rate when scoring in the first 5 minutes
                </p>
            </div>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
            <Card
                v-for="team in earlyGoalData"
                :key="team.team"
                class="p-6 bg-card border-border"
            >
                <h3 class="text-xl font-bold mb-6">{{ team.team }}</h3>

                <div class="mb-6">
                    <p
                        class="text-sm text-muted-foreground uppercase tracking-wide mb-2"
                    >
                        Win Rate
                    </p>
                    <div class="flex items-baseline gap-2 mb-3">
                        <span class="text-5xl font-bold text-accent">{{
                            team.win_rate
                        }}</span>
                        <span class="text-2xl text-muted-foreground">%</span>
                    </div>
                    <Progress :value="team.win_rate" class="h-3" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="rounded-lg bg-background p-4 text-center">
                        <p class="text-sm text-muted-foreground mb-1">
                            Early Goals
                        </p>
                        <p class="text-3xl font-bold">{{ team.early_goals }}</p>
                    </div>
                    <div class="rounded-lg bg-background p-4 text-center">
                        <p class="text-sm text-muted-foreground mb-1">Wins</p>
                        <p class="text-3xl font-bold text-accent">
                            {{ team.wins }}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    </section>
</template>
