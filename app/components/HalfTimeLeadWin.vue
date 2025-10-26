<script setup lang="ts">
// Data setup in the Vue 3 Composition API
const halfTimeData = [
    {
        team: "Nyasa Big Bullets",
        times_led_at_ht: 14,
        times_won: 12,
        win_rate: 85.7,
    },
    {
        team: "Silver Strikers",
        times_led_at_ht: 11,
        times_won: 9,
        win_rate: 81.8,
    },
    {
        team: "Mighty Mukuru Wanderers",
        times_led_at_ht: 10,
        times_won: 7,
        win_rate: 70.0,
    },
];

// Components Card and Progress are assumed to be auto-imported.
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-accent p-3">
                <UIcon
                    name="lucide:trending-up"
                    class="h-8 w-8 text-accent-foreground"
                />
            </div>
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-balance">
                    HALF-TIME LEAD TO WIN
                </h2>
                <p class="text-muted-foreground text-pretty">
                    Teams that protect their half-time advantage
                </p>
            </div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
                v-for="team in halfTimeData"
                :key="team.team"
                class="p-6 bg-card border-border"
            >
                <h3 class="text-xl font-bold mb-6">{{ team.team }}</h3>

                <div class="space-y-6">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span
                                class="text-sm text-muted-foreground uppercase tracking-wide"
                                >Win Rate</span
                            >
                            <span class="text-2xl font-bold text-accent"
                                >{{ team.win_rate }}%</span
                            >
                        </div>
                        <Progress :value="team.win_rate" class="h-3" />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="rounded-lg bg-background p-4 text-center">
                            <p class="text-sm text-muted-foreground mb-1">
                                Led at HT
                            </p>
                            <p class="text-3xl font-bold">
                                {{ team.times_led_at_ht }}
                            </p>
                        </div>
                        <div class="rounded-lg bg-background p-4 text-center">
                            <p class="text-sm text-muted-foreground mb-1">
                                Won Game
                            </p>
                            <p class="text-3xl font-bold text-accent">
                                {{ team.times_won }}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </section>
</template>
