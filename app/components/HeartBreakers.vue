<script setup lang="ts">
// Data setup in the Vue 3 Composition API
const heartbreakerData = [
    {
        team: "MAFCO FC",
        heartbreaks: 4,
        matches: [
            {
                match: {
                    home_team: "MAFCO FC",
                    away_team: "Blue Eagles",
                    final_score: "1 - 2",
                    match_date: "22/03/2025",
                },
                events: [
                    {
                        minute: "12'",
                        team: "MAFCO FC",
                        player: "Chikumbutso Salima",
                        score_at_event: "1 - 0",
                    },
                    {
                        minute: "56'",
                        team: "Blue Eagles",
                        player: "Chimwemwe Idana",
                        score_at_event: "1 - 1",
                    },
                    {
                        minute: "83'",
                        team: "Blue Eagles",
                        player: "Chimwemwe Idana",
                        score_at_event: "1 - 2",
                    },
                ],
            },
        ],
    },
    {
        team: "Karonga United",
        heartbreaks: 3,
        matches: [],
    },
];
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-primary p-3">
                <!-- Lucide HeartCrack icon using the Nuxt UI/Iconify component -->
                <UIcon
                    name="lucide:heart-crack"
                    class="h-8 w-8 text-primary-foreground"
                />
            </div>
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-balance">
                    HEARTBREAKERS
                </h2>
                <p class="text-muted-foreground text-pretty">
                    Teams who scored first but lost the game
                </p>
            </div>
        </div>

        <div class="grid gap-6">
            <!-- Outer iteration (v-for) for each team -->
            <Card
                v-for="(team, idx) in heartbreakerData"
                :key="team.team"
                class="p-6 bg-card border-border hover:border-primary transition-colors"
            >
                <div class="flex items-start justify-between mb-6">
                    <div class="flex items-center gap-4">
                        <div
                            class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl font-bold text-primary"
                        >
                            <!-- Vue expression for index (idx + 1) -->
                            {{ idx + 1 }}
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold">{{ team.team }}</h3>
                            <p class="text-muted-foreground">
                                <span class="text-primary font-bold text-xl">{{
                                    team.heartbreaks
                                }}</span>
                                heartbreaking defeats
                            </p>
                        </div>
                    </div>
                    <Badge variant="destructive" class="text-lg px-4 py-2">
                        {{ team.heartbreaks }} losses
                    </Badge>
                </div>

                <!-- Conditional rendering (v-if) for matches -->
                <div v-if="team.matches.length > 0" class="space-y-4">
                    <!-- Inner iteration for match details -->
                    <div
                        v-for="(match, matchIdx) in team.matches"
                        :key="matchIdx"
                        class="rounded-lg border border-border bg-background p-4"
                    >
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-4">
                                <span class="font-bold">{{
                                    match.match.home_team
                                }}</span>
                                <span class="text-2xl font-bold text-primary">{{
                                    match.match.final_score
                                }}</span>
                                <span class="font-bold">{{
                                    match.match.away_team
                                }}</span>
                            </div>
                            <span class="text-sm text-muted-foreground">{{
                                match.match.match_date
                            }}</span>
                        </div>

                        <div class="space-y-2">
                            <p
                                class="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3"
                            >
                                Match Timeline
                            </p>
                            <!-- Deepest iteration for events -->
                            <div
                                v-for="(event, eventIdx) in match.events"
                                :key="eventIdx"
                                class="flex items-center gap-3 text-sm"
                            >
                                <Badge variant="outline" class="font-mono">
                                    {{ event.minute }}
                                </Badge>
                                <span class="font-medium">{{
                                    event.player
                                }}</span>
                                <span class="text-muted-foreground"
                                    >({{ event.team }})</span
                                >
                                <!-- Lucide ArrowRight icon -->
                                <UIcon
                                    name="lucide:arrow-right"
                                    class="h-4 w-4 text-muted-foreground"
                                />
                                <span class="font-bold">{{
                                    event.score_at_event
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </section>
</template>
