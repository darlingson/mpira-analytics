<script setup lang="ts">
// Data setup in the Vue 3 Composition API
const comebackData = [
    {
        team: "Nyasa Big Bullets",
        comebacks: 5,
        matches: [
            {
                match: {
                    home_team: "Nyasa Big Bullets",
                    away_team: "Silver Strikers",
                    final_score: "3 - 2",
                    match_date: "15/03/2025",
                },
                events: [
                    {
                        minute: "23'",
                        team: "Silver Strikers",
                        player: "John Banda",
                        score_at_event: "0 - 1",
                    },
                    {
                        minute: "45'",
                        team: "Silver Strikers",
                        player: "Patrick Mwaungulu",
                        score_at_event: "0 - 2",
                    },
                    {
                        minute: "67'",
                        team: "Nyasa Big Bullets",
                        player: "Hassan Kajoke",
                        score_at_event: "1 - 2",
                    },
                    {
                        minute: "78'",
                        team: "Nyasa Big Bullets",
                        player: "Babatunde Adepoju",
                        score_at_event: "2 - 2",
                    },
                    {
                        minute: "89'",
                        team: "Nyasa Big Bullets",
                        player: "Hassan Kajoke",
                        score_at_event: "3 - 2",
                    },
                ],
            },
        ],
    },
    {
        team: "Silver Strikers",
        comebacks: 3,
        matches: [],
    },
    {
        team: "Mighty Mukuru Wanderers",
        comebacks: 4,
        matches: [],
    },
];
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-primary p-3">
                <!-- Lucide TrendingUp icon using the Nuxt UI/Iconify component -->
                <UIcon
                    name="lucide:trending-up"
                    class="h-8 w-8 text-primary-foreground"
                />
            </div>
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-balance">
                    COMEBACK KINGS
                </h2>
                <p class="text-muted-foreground text-pretty">
                    Teams who turned defeat into victory
                </p>
            </div>
        </div>

        <div class="grid gap-6">
            <!-- Outer iteration (v-for) for each team -->
            <Card
                v-for="(team, idx) in comebackData"
                :key="team.team"
                class="p-6 bg-card border-border hover:border-primary transition-colors"
            >
                <div class="flex items-start justify-between mb-6">
                    <div class="flex items-center gap-4">
                        <div
                            class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl font-bold text-primary"
                        >
                            {{ idx + 1 }}
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold">{{ team.team }}</h3>
                            <p class="text-muted-foreground">
                                <span class="text-accent font-bold text-xl">{{
                                    team.comebacks
                                }}</span>
                                comeback victories
                            </p>
                        </div>
                    </div>
                    <Badge variant="secondary" class="text-lg px-4 py-2">
                        {{ team.comebacks }} wins
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
                                <span class="font-bold text-accent">{{
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
