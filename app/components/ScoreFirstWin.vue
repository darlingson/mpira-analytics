<script setup lang="ts">
const { data: scoreFirstData } = await useFetch("/api/insights/score-first-win")
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
                                    <div class="h-2 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            class="h-full rounded-full transition-all duration-500"
                                            :class="team.win_rate >= 75 ? 'bg-green-500' : team.win_rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'"
                                            :style="{ width: team.win_rate + '%' }"
                                        />
                                    </div>
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
