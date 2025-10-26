<script setup lang="ts">
// Data setup in the Vue 3 Composition API
const redCardData = [
    {
        team: "Silver Strikers",
        red_cards: 3,
        wins: 2,
        draws: 1,
        losses: 0,
        survival_rate: 100,
    },
    {
        team: "Nyasa Big Bullets",
        red_cards: 2,
        wins: 1,
        draws: 0,
        losses: 1,
        survival_rate: 50,
    },
];

// Assuming Card and Badge are auto-imported, possibly as UCard and UBadge if using Nuxt UI.
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-primary p-3">
                <UIcon
                    name="lucide:alert-triangle"
                    class="h-8 w-8 text-primary-foreground"
                />
            </div>
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-balance">
                    RED CARD SURVIVAL
                </h2>
                <p class="text-muted-foreground text-pretty">
                    Teams that avoided defeat despite red cards
                </p>
            </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
            <Card
                v-for="team in redCardData"
                :key="team.team"
                class="p-6 bg-card border-border"
            >
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold">{{ team.team }}</h3>

                    <Badge variant="destructive" class="text-lg px-4 py-2">
                        {{ team.red_cards }} red cards
                    </Badge>
                </div>

                <div class="mb-6">
                    <p
                        class="text-sm text-muted-foreground uppercase tracking-wide mb-2"
                    >
                        Survival Rate
                    </p>
                    <p class="text-5xl font-bold text-accent">
                        {{ team.survival_rate }}%
                    </p>
                </div>

                <div class="grid grid-cols-3 gap-3">
                    <div class="rounded-lg bg-background p-3 text-center">
                        <p class="text-sm text-muted-foreground mb-1">Wins</p>
                        <p class="text-2xl font-bold text-accent">
                            {{ team.wins }}
                        </p>
                    </div>
                    <div class="rounded-lg bg-background p-3 text-center">
                        <p class="text-sm text-muted-foreground mb-1">Draws</p>
                        <p class="text-2xl font-bold">{{ team.draws }}</p>
                    </div>
                    <div class="rounded-lg bg-background p-3 text-center">
                        <p class="text-sm text-muted-foreground mb-1">Losses</p>
                        <p class="text-2xl font-bold text-primary">
                            {{ team.losses }}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    </section>
</template>
