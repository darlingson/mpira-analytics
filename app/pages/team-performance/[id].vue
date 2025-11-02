<template>
    <div
        class="min-h-screen bg-[#0f172a] bg-[radial-gradient(60rem_60rem_at_10%_-10%,#1b2a3e40,transparent),radial-gradient(80rem_80rem_at_90%_-20%,#0b3b3640,transparent)] text-slate-200 p-8"
    >
        <div class="flex items-center justify-between mb-10">
            <h1 class="text-2xl font-bold">Team Performance</h1>
            <div class="flex items-center gap-4">
                <UInput
                    icon="i-heroicons-magnifying-glass-20-solid"
                    placeholder="Search team..."
                    color="neutral"
                    variant="outline"
                    class="w-72"
                />
                <UButton
                    icon="i-heroicons-bell"
                    variant="ghost"
                    color="neutral"
                />
                <UAvatar icon="i-heroicons-user" size="md" />
            </div>
        </div>

        <!-- Team header -->
        <div class="flex items-center gap-4 mb-6">
            <div
                class="h-12 w-12 rounded-full bg-slate-300/10 border border-slate-500/30 grid place-items-center"
            >
                <div class="h-6 w-6 rounded-full bg-slate-400/30" />
            </div>
            <div>
                <h2 class="text-3xl font-extrabold tracking-tight">
                    {{ data?.team.name }}
                </h2>
            </div>
        </div>

        <UTabs
            :items="tabs"
            variant="pill"
            :ui="{ trigger: 'grow' }"
            class="gap-4 w-full"
        >
            <template #overview>
                <div
                    class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
                >
                    <section class="panel">
                        <header class="panel-header">
                            <p class="panel-eyebrow">Attack</p>
                            <h3 class="panel-title">Goals Scored</h3>
                            <div class="panel-icon">
                                <UIcon
                                    name="i-heroicons-bolt"
                                    class="text-emerald-400"
                                />
                            </div>
                        </header>
                        <div class="panel-body">
                            <div class="text-5xl font-extrabold tracking-tight">
                                {{ overview?.goalsFor ?? 0 }}
                            </div>
                            <p class="text-slate-400 text-sm mt-1">
                                {{ overview?.goalsPerMatch ?? 0 }} per match
                            </p>
                        </div>
                    </section>

                    <section class="panel">
                        <header class="panel-header">
                            <p class="panel-eyebrow">Defense</p>
                            <h3 class="panel-title">Goals Conceded</h3>
                            <div class="panel-icon">
                                <UIcon
                                    name="i-heroicons-shield-exclamation"
                                    class="text-rose-400"
                                />
                            </div>
                        </header>
                        <div class="panel-body">
                            <div class="text-5xl font-extrabold tracking-tight">
                                {{ overview?.goalsAgainst ?? 0 }}
                            </div>
                            <p class="text-slate-400 text-sm mt-1">
                                Across {{ overview?.matchesPlayed ?? 0 }} games
                            </p>
                        </div>
                    </section>

                    <section class="panel md:col-span-2 xl:col-span-1">
                        <header class="panel-header">
                            <p class="panel-eyebrow">Highs</p>
                            <h3 class="panel-title">Biggest Win</h3>
                            <div class="panel-icon">
                                <UIcon
                                    name="i-heroicons-trophy"
                                    class="text-yellow-400"
                                />
                            </div>
                        </header>
                        <div class="panel-body">
                            <div v-if="overview?.biggestWin" class="space-y-2">
                                <div class="row">
                                    <span class="text-slate-300"
                                        >vs
                                        {{ overview.biggestWin.opponent }}</span
                                    >
                                    <span class="score score-win">{{
                                        overview.biggestWin.score
                                    }}</span>
                                </div>
                                <p class="text-xs text-slate-500">
                                    {{ overview.biggestWin.match?.match_date }}
                                </p>
                            </div>
                            <p v-else class="text-slate-400 text-sm">
                                No wins yet
                            </p>
                        </div>
                    </section>

                    <!-- Top Scorer -->
                    <section class="panel">
                        <header class="panel-header">
                            <p class="panel-eyebrow">Finishing</p>
                            <h3 class="panel-title">Top Scorer</h3>
                            <div class="panel-icon">
                                <UIcon
                                    name="i-heroicons-user-circle"
                                    class="text-violet-400"
                                />
                            </div>
                        </header>
                        <div class="panel-body">
                            <div
                                v-if="overview?.topScorers?.length"
                                class="flex items-center gap-3"
                            >
                                <UAvatar
                                    :alt="overview.topScorers[0].name"
                                    size="md"
                                    class="bg-violet-500/20 text-violet-300 ring-2 ring-violet-500/30"
                                />
                                <div>
                                    <p class="font-bold">
                                        {{ overview.topScorers[0].name }}
                                    </p>
                                    <p class="text-slate-400 text-sm">
                                        {{ overview.topScorers[0].goals }} goals
                                    </p>
                                </div>
                            </div>
                            <p v-else class="text-slate-400 text-sm">
                                No goals recorded
                            </p>
                        </div>
                    </section>
                </div>

                <section class="panel">
                    <header class="panel-header">
                        <div>
                            <p class="panel-eyebrow">Fire-power</p>
                            <h3 class="panel-title">
                                High-Scoring Matches (≥ 3 goals scored)
                            </h3>
                        </div>
                        <div class="panel-icon">
                            <UIcon
                                name="i-heroicons-fire"
                                class="text-orange-400"
                            />
                        </div>
                    </header>
                    <div class="panel-body">
                        <ul
                            v-if="overview?.highScoringMatches?.length"
                            class="space-y-2 text-sm"
                        >
                            <li
                                v-for="(g, i) in overview.highScoringMatches"
                                :key="i"
                                class="row"
                            >
                                <span>vs {{ opponentName(g.match) }}</span>
                                <span class="score score-win"
                                    >{{ g.scored }}-{{ g.conceded }}</span
                                >
                            </li>
                        </ul>
                        <p v-else class="text-slate-400 text-sm">
                            No high-scoring games yet
                        </p>
                    </div>
                </section>
            </template>
            <template #defense>
                <div
                    class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    <section class="panel">
                        <header class="panel-header">
                            <div>
                                <p class="panel-eyebrow">Defensive Solidity</p>
                                <h3 class="panel-title">Clean Sheets</h3>
                            </div>
                            <div class="panel-icon">
                                <UIcon
                                    name="i-heroicons-shield-check"
                                    class="text-emerald-400"
                                />
                            </div>
                        </header>

                        <div class="panel-body">
                            <div
                                class="text-6xl font-extrabold tracking-tight mb-5"
                            >
                                {{ data?.clean_sheets.count }}
                            </div>
                            <ul class="space-y-2 text-sm">
                                <li
                                    v-for="(
                                        m, i
                                    ) in data?.clean_sheets.matches.slice(0, 4)"
                                    :key="i"
                                    class="row"
                                >
                                    <span>vs {{ opponentName(m.match) }}</span>
                                    <span class="score score-win">{{
                                        m.match.final_score
                                    }}</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <!-- PANEL: Team Resilience -->
                    <section class="panel">
                        <header class="panel-header">
                            <div>
                                <p class="panel-eyebrow">Team Resilience</p>
                                <h3 class="panel-title">Comeback Wins</h3>
                            </div>
                            <div class="panel-icon">
                                <UIcon
                                    name="i-heroicons-arrows-pointing-out"
                                    class="text-violet-400"
                                />
                            </div>
                        </header>

                        <div class="panel-body">
                            <div
                                class="text-6xl font-extrabold tracking-tight mb-5"
                            >
                                {{ data?.comeback_wins.count }}
                            </div>
                            <ul class="space-y-4 text-sm">
                                <li
                                    v-for="(
                                        m, i
                                    ) in data?.comeback_wins.matches.slice(
                                        0,
                                        2,
                                    )"
                                    :key="i"
                                >
                                    <div class="row">
                                        <span
                                            >vs
                                            {{ opponentName(m.match) }}</span
                                        >
                                        <span class="score score-win">{{
                                            m.match.final_score
                                        }}</span>
                                    </div>
                                    <div class="ht">
                                        HT: {{ m.match.half_time }} ·
                                        <span class="text-violet-300">
                                            back from
                                            {{ m.comeback_moments[0]?.score }}
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section class="panel">
                        <header class="panel-header">
                            <div>
                                <p class="panel-eyebrow">
                                    Leading from the Front
                                </p>
                                <h3 class="panel-title">
                                    Win Rate After Scoring First
                                </h3>
                            </div>
                            <div class="panel-icon">
                                <UIcon
                                    name="i-heroicons-arrow-trending-up"
                                    class="text-emerald-400"
                                />
                            </div>
                        </header>

                        <div class="panel-body flex flex-col items-center">
                            <div class="donut mb-4" />
                            <div
                                class="text-5xl font-extrabold text-emerald-400 -mt-28 mb-16"
                            >
                                {{ firstWinRate }}%
                            </div>
                            <div class="flex gap-6 text-sm">
                                <span class="legend"
                                    ><i class="dot bg-emerald-500" />Win</span
                                >
                                <span class="legend"
                                    ><i class="dot bg-amber-400" />Draw</span
                                >
                                <span class="legend"
                                    ><i class="dot bg-rose-500" />Loss</span
                                >
                            </div>
                        </div>
                    </section>

                    <!-- PANEL: Vulnerability -->
                    <section class="panel md:col-span-2 xl:col-span-1">
                        <header class="panel-header">
                            <div>
                                <p class="panel-eyebrow">Vulnerability</p>
                                <h3 class="panel-title">
                                    Dropped Points From Lead
                                </h3>
                            </div>
                            <div class="panel-icon">
                                <UIcon
                                    name="i-heroicons-arrow-trending-down"
                                    class="text-rose-400"
                                />
                            </div>
                        </header>

                        <div class="panel-body">
                            <div
                                class="text-6xl font-extrabold tracking-tight mb-3"
                            >
                                {{ data?.scored_first_and_lost.count }}
                            </div>
                            <p class="text-slate-400 text-sm mb-5">
                                Matches lost after taking the lead.
                            </p>

                            <ul class="space-y-4 text-sm">
                                <li
                                    v-for="(
                                        m, i
                                    ) in data?.scored_first_and_lost.matches.slice(
                                        0,
                                        2,
                                    )"
                                    :key="i"
                                >
                                    <div class="row">
                                        <span
                                            >vs
                                            {{ opponentName(m.match) }}</span
                                        >
                                        <span class="score score-loss">{{
                                            m.match.final_score
                                        }}</span>
                                    </div>
                                    <div class="ht">
                                        Led {{ m.first_goal.minute }}'
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>
            </template>
            <template #attack>
                <!-- Attack-insight grid -->
                <div
                    class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
                >
                    <!-- Fastest goal -->
                    <section class="panel">
                        <header class="panel-header">
                            <p class="panel-eyebrow">Blitz Start</p>
                            <h3 class="panel-title">Fastest Goal</h3>
                            <div class="panel-icon">
                                <UIcon
                                    name="i-heroicons-rocket-launch"
                                    class="text-emerald-400"
                                />
                            </div>
                        </header>
                        <div class="panel-body">
                            <div class="text-5xl font-extrabold">
                                {{ attackStats?.fastestGoal.minute ?? "–" }}'
                            </div>
                            <ul
                                v-if="attackStats?.fastestGoal.matches.length"
                                class="mt-3 space-y-2 text-sm"
                            >
                                <li
                                    v-for="(
                                        g, i
                                    ) in attackStats.fastestGoal.matches.slice(
                                        0,
                                        2,
                                    )"
                                    :key="i"
                                    class="row"
                                >
                                    <span>vs {{ opponentName(g.match) }}</span>
                                    <span class="score score-win">{{
                                        g.match.final_score
                                    }}</span>
                                </li>
                            </ul>
                            <p v-else class="text-slate-400 text-sm mt-2">
                                No data
                            </p>
                        </div>
                    </section>

                    <!-- Latest winner -->
                    <section class="panel">
                        <header class="panel-header">
                            <p class="panel-eyebrow">Late Heroics</p>
                            <h3 class="panel-title">Latest Winner</h3>
                            <div class="panel-icon">
                                <UIcon
                                    name="i-heroicons-clock"
                                    class="text-violet-400"
                                />
                            </div>
                        </header>
                        <div class="panel-body">
                            <div class="text-5xl font-extrabold">
                                {{
                                    attackStats?.latestWinningGoal.minute ??
                                    "–"
                                }}'
                            </div>
                            <ul
                                v-if="
                                    attackStats?.latestWinningGoal.matches
                                        .length
                                "
                                class="mt-3 space-y-2 text-sm"
                            >
                                <li
                                    v-for="(
                                        g, i
                                    ) in attackStats.latestWinningGoal.matches.slice(
                                        0,
                                        2,
                                    )"
                                    :key="i"
                                    class="row"
                                >
                                    <span>vs {{ opponentName(g.match) }}</span>
                                    <span class="score score-win">{{
                                        g.match.final_score
                                    }}</span>
                                </li>
                            </ul>
                            <p v-else class="text-slate-400 text-sm mt-2">
                                No data
                            </p>
                        </div>
                    </section>

                    <!-- First-5 win rate -->
                    <section class="panel">
                        <header class="panel-header">
                            <p class="panel-eyebrow">Fast Start</p>
                            <h3 class="panel-title">Win % (≤ 5')</h3>
                            <div class="panel-icon">
                                <UIcon
                                    name="i-heroicons-bolt"
                                    class="text-yellow-400"
                                />
                            </div>
                        </header>
                        <div class="panel-body flex flex-col items-center">
                            <div class="text-5xl font-extrabold">
                                {{ attackStats?.first5WinRate ?? 0 }}%
                            </div>
                            <p class="text-slate-400 text-sm mt-1">
                                {{ attackStats?.first5Scored ?? 0 }} games
                            </p>
                            <UButton
                                label="View games"
                                variant="ghost"
                                color="neutral"
                                size="sm"
                                class="mt-3"
                                @click="showFirst5 = !showFirst5"
                            />
                        </div>
                    </section>

                    <!-- Equalizer kings -->
                    <section class="panel">
                        <header class="panel-header">
                            <p class="panel-eyebrow">Resilience</p>
                            <h3 class="panel-title">Equalizers</h3>
                            <div class="panel-icon">
                                <UIcon
                                    name="i-heroicons-arrows-right-left"
                                    class="text-orange-400"
                                />
                            </div>
                        </header>
                        <div class="panel-body">
                            <ul
                                v-if="attackStats?.equalizers.length"
                                class="space-y-2 text-sm"
                            >
                                <li
                                    v-for="(
                                        e, i
                                    ) in attackStats.equalizers.slice(0, 3)"
                                    :key="i"
                                    class="row"
                                >
                                    <span>{{ e.player }}</span>
                                    <span class="score score-draw">{{
                                        e.count
                                    }}</span>
                                </li>
                            </ul>
                            <p v-else class="text-slate-400 text-sm">
                                None yet
                            </p>
                            <UButton
                                label="All equalizers"
                                variant="ghost"
                                color="neutral"
                                size="sm"
                                class="mt-3"
                                @click="showEqualizers = !showEqualizers"
                            />
                        </div>
                    </section>
                </div>

                <!-- Expandable first-5 games -->
                <UCollapse v-model="showFirst5">
                    <section class="panel mb-6">
                        <header class="panel-header">
                            <h3 class="panel-title">
                                Games with early goals (≤ 5')
                            </h3>
                        </header>
                        <div class="panel-body">
                            <ul
                                v-if="attackStats?.first5Matches.length"
                                class="space-y-3 text-sm"
                            >
                                <li
                                    v-for="(g, i) in attackStats.first5Matches"
                                    :key="i"
                                    class="row"
                                >
                                    <span
                                        >vs {{ opponentName(g.match) }} -
                                        {{ g.match.final_score }}</span
                                    >
                                    <span class="text-slate-400"
                                        >({{
                                            g.first5Goals
                                                .map((g) => g.minute)
                                                .join(", ")
                                        }})</span
                                    >
                                    <UBadge
                                        :color="g.won ? 'emerald' : 'rose'"
                                        variant="subtle"
                                        class="ml-auto"
                                    >
                                        {{ g.won ? "W" : "L" }}
                                    </UBadge>
                                </li>
                            </ul>
                            <p v-else class="text-slate-400 text-sm">
                                No early goals yet
                            </p>
                        </div>
                    </section>
                </UCollapse>

                <!-- Expandable equalizer details -->
                <UCollapse v-model="showEqualizers">
                    <section class="panel">
                        <header class="panel-header">
                            <h3 class="panel-title">All equalizer details</h3>
                        </header>
                        <div class="panel-body">
                            <div
                                v-for="(e, i) in attackStats?.equalizers"
                                :key="i"
                                class="mb-4 last:mb-0"
                            >
                                <p class="font-bold text-violet-300 mb-2">
                                    {{ e.player }} ({{ e.count }})
                                </p>
                                <ul class="space-y-1 text-xs text-slate-400">
                                    <li
                                        v-for="(m, j) in e.matches"
                                        :key="j"
                                        class="row"
                                    >
                                        <span
                                            >vs {{ opponentName(m.match) }} -
                                            {{ m.match.final_score }}</span
                                        >
                                        <span>{{ m.goal.minute }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </UCollapse>
            </template>
        </UTabs>
    </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line
// @ts-nocheck
import type { TabsItem } from "@nuxt/ui";
import { computed } from "vue";

interface Stats {
    team: Team;
    comeback_wins: ComebackWins;
    scored_first_and_won: ScoredFirstAndWon;
    scored_first_and_lost: ScoredFirstAndLost;
    clean_sheets: CleanSheets;
}
interface Team {
    id: number;
    name: string;
}
interface ComebackWins {
    count: number;
    matches: ComebackMatch[];
}
interface ComebackMatch {
    match: Match;
    goals: Goal[];
    comeback_moments: { minute: number; score: string }[];
}
interface ScoredFirstAndWon {
    count: number;
    matches: FirstWinMatch[];
}
interface FirstWinMatch {
    match: Match;
    goals: Goal[];
    first_goal: Goal;
}
interface ScoredFirstAndLost {
    count: number;
    matches: FirstLostMatch[];
}
interface FirstLostMatch {
    match: Match;
    goals: Goal[];
    first_goal: Goal;
}
interface CleanSheets {
    count: number;
    matches: CleanMatch[];
}
interface CleanMatch {
    match: Match;
    goals: Goal[];
}
interface Match {
    id: number;
    season: string;
    match_date: string;
    home_team: string;
    away_team: string;
    final_score: string;
    half_time: string;
    home_team_id: number;
    away_team_id: number;
}
interface Goal {
    id: number;
    match_id: number;
    minute: string;
    player: string;
    team: string;
    type: string;
    description: string;
    score_at_event: string;
    team_id: number;
    parsedMinute: number;
}

interface AttackStats {
    team: Team;
    fastestGoal: FastestGoalClass;
    latestWinningGoal: FastestGoalClass;
    equalizers: Equalizer[];
    first5WinRate: number;
    first5Scored: number;
    first5Won: number;
    first5Matches: First5MatchElement[];
}

interface Equalizer {
    player: string;
    count: number;
    matches: EqualizerMatch[];
}

interface EqualizerMatch {
    match: MatchMatch;
    goal: Goal;
    allGoals: Goal[];
}

interface Goal {
    id: number;
    match_id: number;
    minute: string;
    player: string;
    team: string;
    type: Type;
    description: string;
    score_at_event: string;
    team_id: number;
    parsedMinute: number;
}

enum Type {
    Goal = "goal",
}

interface MatchMatch {
    id: number;
    season: string;
    match_date: string;
    home_team: string;
    away_team: string;
    final_score: string;
    half_time: string;
    home_team_id: number;
    away_team_id: number;
}

interface FastestGoalClass {
    minute: number;
    matches: First5MatchElement[];
}

interface First5MatchElement {
    match: MatchMatch;
    first5Goals: Goal[];
    allGoals: Goal[];
    won: boolean;
}

interface Team {
    id: number;
    name: string;
}

const route = useRoute();
const teamId = computed(() => Number(route.params.id));

const { data } = await useFetch<Stats>(`/api/team-insights/${teamId.value}`, {
    key: `team-${teamId.value}`,
});
const { data: overview } = await useFetch(
    `/api/team-overview/${teamId.value}`,
    {
        key: `attack-${teamId.value}`,
    },
);

const firstWinRate = computed(() => {
    const total =
        data.value!.scored_first_and_won.count +
        data.value!.scored_first_and_lost.count;
    return total
        ? Math.round((data.value!.scored_first_and_won.count / total) * 100)
        : 0;
});

const { data: attackStats } = await useFetch<AttackStats>(
    `/api/team-attack-insights/${teamId.value}`,
    { key: `attack-insights-${teamId.value}` },
);

const showFirst5 = ref(false);
const showEqualizers = ref(false);

function opponentName(m: MatchMatch): string {
    return data.value!.team.id === m.home_team_id ? m.away_team : m.home_team;
}

const tabs = [
    {
        label: "Overview",
        description:
            "Make changes to your account here. Click save when you're done.",
        icon: "i-lucide-user",
        slot: "overview" as const,
    },
    {
        label: "Attack",
        description:
            "Change your password here. After saving, you'll be logged out.",
        icon: "i-lucide-lock",
        slot: "attack" as const,
    },
    {
        label: "Defense",
        description:
            "Change your password here. After saving, you'll be logged out.",
        icon: "i-lucide-lock",
        slot: "defense" as const,
    },
] satisfies TabsItem[];
</script>

<style scoped>
@reference "tailwindcss";
.panel {
    @apply rounded-xl border border-slate-700/70 bg-slate-900/50 backdrop-blur-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)];
}
.panel-header {
    @apply px-5 py-4 border-b border-slate-700/60 flex items-center justify-between;
}
.panel-title {
    @apply text-[18px] font-semibold leading-6;
}
.panel-eyebrow {
    @apply text-[12px] uppercase tracking-wide text-slate-400;
}
.panel-icon {
    @apply h-8 w-8 grid place-items-center rounded-full border border-slate-600/50 bg-slate-800/60;
}
.panel-body {
    @apply p-5;
}
.row {
    @apply flex items-center justify-between text-slate-300;
}
.ht {
    @apply text-xs text-slate-500 mt-0.5;
}
.score {
    @apply px-2 py-0.5 rounded-md text-[12px] font-semibold;
}
.score-win {
    @apply bg-emerald-500/15 text-emerald-400;
}
.score-draw {
    @apply bg-amber-400/15 text-amber-300;
}
.score-loss {
    @apply bg-rose-500/15 text-rose-400;
}
.donut {
    width: 220px;
    height: 220px;
    border-radius: 9999px;
    background: conic-gradient(
        rgb(34 197 94) 0 v-bind(firstWinRate + "%"),
        rgba(255, 255, 255, 0.08) v-bind(firstWinRate + "%") 100%
    );
    position: relative;
}
.donut::after {
    content: "";
    position: absolute;
    inset: 20px;
    border-radius: 9999px;
    background: #0b1220;
    box-shadow: inset 0 0 0 1px rgba(100, 116, 139, 0.4);
}
.legend {
    @apply inline-flex items-center gap-2 text-slate-300;
}
.dot {
    @apply inline-block h-2 w-2 rounded-full;
}
</style>
