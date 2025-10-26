<script setup lang="ts">
// Data setup in the Vue 3 Composition API
const equalizerData = [
    {
        player: "Hassan Kajoke",
        team: "Nyasa Big Bullets",
        equalizers: 4,
        matches: [
            {
                match: "vs Silver Strikers",
                minute: "78'",
                score: "2 - 2",
                date: "15/03/2025",
            },
            {
                match: "vs MAFCO",
                minute: "65'",
                score: "1 - 1",
                date: "22/02/2025",
            },
        ],
    },
    {
        player: "Patrick Mwaungulu",
        team: "Silver Strikers",
        equalizers: 3,
        matches: [],
    },
    {
        player: "Chimwemwe Idana",
        team: "Blue Eagles",
        equalizers: 3,
        matches: [],
    },
];

// Components Card and Badge are assumed to be auto-imported.
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-primary p-3">
                <UIcon
                    name="lucide:equal"
                    class="h-8 w-8 text-primary-foreground"
                />
            </div>
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-balance">
                    THE EQUALIZERS
                </h2>
                <p class="text-muted-foreground text-pretty">
                    Players who rescued their teams with equalizing goals
                </p>
            </div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
                v-for="player in equalizerData"
                :key="player.player"
                class="p-6 bg-card border-border hover:border-primary transition-colors"
            >
                <div class="mb-4">
                    <h3 class="text-xl font-bold mb-1">{{ player.player }}</h3>
                    <p class="text-sm text-muted-foreground">
                        {{ player.team }}
                    </p>
                </div>

                <div class="mb-6">
                    <p
                        class="text-sm text-muted-foreground uppercase tracking-wide mb-2"
                    >
                        Equalizers
                    </p>
                    <p class="text-5xl font-bold text-primary">
                        {{ player.equalizers }}
                    </p>
                </div>

                <div v-if="player.matches.length > 0" class="space-y-3">
                    <p
                        class="text-sm font-medium text-muted-foreground uppercase tracking-wide"
                    >
                        Recent Equalizers
                    </p>
                    <div
                        v-for="(match, idx) in player.matches"
                        :key="idx"
                        class="rounded-lg border border-border bg-background p-3"
                    >
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium">{{
                                match.match
                            }}</span>
                            <Badge variant="outline" class="font-mono">
                                {{ match.minute }}
                            </Badge>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-lg font-bold text-primary">{{
                                match.score
                            }}</span>
                            <span class="text-xs text-muted-foreground">{{
                                match.date
                            }}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </section>
</template>
