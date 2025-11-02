<script setup lang="ts">
import { ref, onMounted } from "vue";
export interface Matches {
    team: string;
    comeback_wins: number;
    matches: MatchElement[];
}

export interface MatchElement {
    match: PurpleMatch;
    all_goals: AllGoal[];
    comeback_moments: ComebackMoment[];
}

export interface PurpleMatch {
    id: number;
    season: string;
    match_date: string;
    home_team: string;
    away_team: string;
    final_score: string;
    half_time: string;
}

export interface AllGoal {
    id: number;
    match_id: number;
    minute: string;
    player: string;
    team: string;
    type: Type;
    description: string;
    score_at_event: string;
    parsedMinute: number;
}

enum Type {
    Goal = "goal",
}

export interface ComebackMoment {
    minute: number;
    score: string;
}

type MatchesUI = Matches & { _open?: boolean };

const comebackData = ref<MatchesUI[]>([]);

const fetchComebackKings = async () => {
    try {
        const res = await $fetch<Matches[]>("/api/insights/comeback-kings");
        comebackData.value = res.map((t) => ({ ...t, _open: false }));
    } catch (e) {
        console.error("Failed to load comeback kings", e);
    }
};

onMounted(fetchComebackKings);
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-primary p-3">
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
            <UCard
                v-for="(team, idx) in comebackData"
                :key="team.team"
                class="p-6 bg-card border-border hover:border-primary transition-colors"
            >
                <div class="flex items-start justify-between">
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
                                    team.comeback_wins
                                }}</span>
                                comeback victories
                            </p>
                        </div>
                    </div>

                    <UButton
                        v-if="team.matches.length"
                        variant="ghost"
                        size="sm"
                        square
                        @click="team._open = !team._open"
                    >
                        {{ team._open }}
                        <UIcon
                            :name="
                                team._open
                                    ? 'lucide:chevron-up'
                                    : 'lucide:chevron-down'
                            "
                            class="h-5 w-5"
                        />
                    </UButton>
                </div>

                <UCollapse v-model:open="team._open">
                    <div
                        v-if="team.matches.length && team._open"
                        class="space-y-4 mt-6"
                    >
                        <div
                            v-for="(matchEl, matchIdx) in team.matches"
                            :key="matchIdx"
                            class="rounded-lg border border-border bg-background p-4"
                        >
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <span class="font-bold">{{
                                        matchEl.match.home_team
                                    }}</span>
                                    <span
                                        class="text-2xl font-bold text-primary"
                                        >{{ matchEl.match.final_score }}</span
                                    >
                                    <span class="font-bold">{{
                                        matchEl.match.away_team
                                    }}</span>
                                </div>
                                <span class="text-sm text-muted-foreground">{{
                                    matchEl.match.match_date
                                }}</span>
                            </div>

                            <div class="space-y-2">
                                <p
                                    class="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3"
                                >
                                    Match Timeline
                                </p>
                                <div
                                    v-for="(goal, goalIdx) in matchEl.all_goals"
                                    :key="goalIdx"
                                    class="flex items-center gap-3 text-sm"
                                >
                                    <Badge
                                        variant="outline"
                                        class="font-mono"
                                        >{{ goal.minute }}</Badge
                                    >
                                    <span class="font-medium">{{
                                        goal.player
                                    }}</span>
                                    <span class="text-muted-foreground"
                                        >({{ goal.team }})</span
                                    >
                                    <UIcon
                                        name="lucide:arrow-right"
                                        class="h-4 w-4 text-muted-foreground"
                                    />
                                    <span class="font-bold text-accent">{{
                                        goal.score_at_event
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </UCollapse>
            </UCard>
        </div>
    </section>
</template>
