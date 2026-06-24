<script setup lang="ts">
const { data: fastestGoalData } = await useFetch("/api/insights/fastest-goal-and-result")
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-accent p-3">
                <UIcon
                    name="lucide:rocket"
                    class="h-8 w-8 text-accent-foreground"
                />
            </div>
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-balance">
                    FASTEST GOAL & RESULT
                </h2>
                <p class="text-muted-foreground text-pretty">
                    Each team's fastest goal and whether they won that match
                </p>
            </div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
                v-for="(team, idx) in fastestGoalData"
                :key="team.team"
                class="p-6 bg-card border-border hover:border-accent transition-colors"
            >
                <div class="flex items-center gap-3 mb-4">
                    <div
                        class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-xl font-bold text-accent"
                    >
                        {{ idx + 1 }}
                    </div>
                    <h3 class="text-xl font-bold">{{ team.team }}</h3>
                </div>

                <div class="mb-4">
                    <p class="text-6xl font-bold text-accent">
                        {{ team.fastest_goal }}<span class="text-3xl">'</span>
                    </p>
                    <p class="text-sm text-muted-foreground mt-1">
                        by {{ team.player }} vs {{ team.opponent }}
                    </p>
                </div>

                <div class="flex items-center justify-between text-sm">
                    <Badge
                        :variant="team.won ? 'default' : 'destructive'"
                    >
                        {{ team.won ? 'Won' : 'Did not win' }}
                    </Badge>
                    <span class="text-xs text-muted-foreground">
                        {{ new Date(team.date).toLocaleDateString('en-GB') }}
                    </span>
                </div>
            </Card>
        </div>
    </section>
</template>
