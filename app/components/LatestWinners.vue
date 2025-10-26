<script setup lang="ts">
// Data setup in the Vue 3 Composition API
const latestWinnerData = [
    {
        team: "Ekhaya",
        latest_winner: 69,
        matches: [
            {
                match: {
                    home_team: "Ekhaya",
                    away_team: "MAFCO",
                    final_score: "1 - 0",
                    match_date: "09/08/2025",
                    half_time: "0-0",
                },
                winning_goal: {
                    minute: "69'",
                    player: "Yamikani Chester",
                    team: "Ekhaya",
                    score_at_event: "1 - 0",
                },
            },
        ],
    },
    {
        team: "Silver Strikers",
        latest_winner: 88,
        matches: [],
    },
    {
        team: "Nyasa Big Bullets",
        latest_winner: 92,
        matches: [],
    },
];

// Components Card and Badge are assumed to be auto-imported.
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-accent p-3">
                <!-- Lucide Clock icon using the Nuxt UI/Iconify component -->
                <UIcon
                    name="lucide:clock"
                    class="h-8 w-8 text-accent-foreground"
                />
            </div>
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-balance">
                    LATEST WINNING GOALS
                </h2>
                <p class="text-muted-foreground text-pretty">
                    Teams with the latest match-winning goals
                </p>
            </div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Outer iteration (v-for) for each team -->
            <Card
                v-for="team in latestWinnerData"
                :key="team.team"
                class="p-6 bg-card border-border hover:border-accent transition-colors"
            >
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold">{{ team.team }}</h3>
                    <!-- Lucide Trophy icon -->
                    <UIcon name="lucide:trophy" class="h-5 w-5 text-accent" />
                </div>

                <div class="mb-6">
                    <p
                        class="text-sm text-muted-foreground uppercase tracking-wide mb-2"
                    >
                        Latest Winner
                    </p>
                    <div class="flex items-baseline gap-2">
                        <span class="text-5xl font-bold text-accent">{{
                            team.latest_winner
                        }}</span>
                        <span class="text-2xl text-muted-foreground">'</span>
                    </div>
                </div>

                <!-- Conditional rendering (v-if) for matches -->
                <div v-if="team.matches.length > 0" class="space-y-3">
                    <!-- Inner iteration for match details -->
                    <div
                        v-for="(match, idx) in team.matches"
                        :key="idx"
                        class="rounded-lg border border-border bg-background p-3"
                    >
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium">
                                {{ match.match.home_team }} vs
                                {{ match.match.away_team }}
                            </span>
                            <Badge variant="secondary" class="font-bold">
                                {{ match.match.final_score }}
                            </Badge>
                        </div>
                        <div class="flex items-center gap-2 text-sm">
                            <Badge variant="outline" class="font-mono">
                                {{ match.winning_goal.minute }}
                            </Badge>
                            <span class="font-medium text-accent">{{
                                match.winning_goal.player
                            }}</span>
                        </div>
                        <p class="text-xs text-muted-foreground mt-2">
                            {{ match.match.match_date }}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    </section>
</template>
