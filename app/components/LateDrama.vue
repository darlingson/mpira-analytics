<script setup lang="ts">
const { data: lateDramaData } = await useFetch("/api/insights/late-drama")
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-accent p-3">
                <UIcon
                    name="lucide:drama"
                    class="h-8 w-8 text-accent-foreground"
                />
            </div>
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-balance">
                    LATE DRAMA
                </h2>
                <p class="text-muted-foreground text-pretty">
                    Points gained or lost from goals scored after 75th minute
                </p>
            </div>
        </div>

        <div v-if="!lateDramaData || lateDramaData.length === 0" class="text-center py-12 rounded-xl border border-border bg-card">
            <UIcon name="lucide:search-x" class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 class="text-lg font-medium">No Late Drama</h3>
            <p class="text-sm text-muted-foreground mt-1">
                No matches with late goals that changed the outcome.
            </p>
        </div>

        <div v-else class="grid gap-6">
            <Card
                v-for="(team, idx) in lateDramaData"
                :key="team.team"
                class="p-6 bg-card border-border"
            >
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-4">
                        <div
                            class="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-2xl font-bold text-accent"
                        >
                            {{ idx + 1 }}
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold">{{ team.team }}</h3>
                            <p class="text-sm text-muted-foreground">
                                Net: <span :class="team.net_effect > 0 ? 'text-green-500 font-bold' : team.net_effect < 0 ? 'text-red-500 font-bold' : ''">
                                    {{ team.net_effect > 0 ? '+' : '' }}{{ team.net_effect }}
                                </span> points
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-4 text-center">
                        <div>
                            <p class="text-2xl font-bold text-green-500">+{{ team.points_gained }}</p>
                            <p class="text-xs text-muted-foreground">Gained</p>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-red-500">-{{ team.points_lost }}</p>
                            <p class="text-xs text-muted-foreground">Lost</p>
                        </div>
                    </div>
                </div>

                <div v-if="team.matches.length" class="space-y-3">
                    <p class="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Affected Matches
                    </p>
                    <div
                        v-for="(m, mi) in team.matches"
                        :key="mi"
                        class="rounded-lg border border-border bg-background p-3 flex items-center justify-between"
                    >
                        <div class="flex items-center gap-3 text-sm">
                            <span class="font-medium">{{ m.home_team }}</span>
                            <span class="font-bold">{{ m.final_score }}</span>
                            <span class="font-medium">{{ m.away_team }}</span>
                        </div>
                        <div class="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Without late: {{ m.score_without_late }}</span>
                            <Badge
                                :variant="m.points_difference > 0 ? 'default' : 'destructive'"
                                class="text-xs"
                            >
                                {{ m.points_difference > 0 ? '+' : '' }}{{ m.points_difference }} pts
                            </Badge>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </section>
</template>
