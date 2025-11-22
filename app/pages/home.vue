<script setup lang="ts">
import StatsOverview from "~/components/StatsOverview.vue";
import ScoreFirstWin from "~/components/ScoreFirstWin.vue";
import RedCardSurvival from "~/components/RedCardSurvival.vue";
import LatestWinners from "~/components/LatestWinners.vue";
import HeartBreakers from "~/components/HeartBreakers.vue";
import HalfTimeLeadWin from "~/components/HalfTimeLeadWin.vue";
import TheEqualizers from "~/components/TheEqualizers.vue";
import EarlyGoalWinRate from "~/components/EarlyGoalWinRate.vue";
import ComebackKings from "~/components/ComebackKings.vue";
import CleanSheets from "~/components/CleanSheets.vue";
</script>

<template>
    <main class="min-h-screen bg-background">
        <h1>Malawi Football Analytics Platform</h1>
        <header class="border-b border-border bg-card">
            <div class="container mx-auto px-4 py-6">
                <h1 class="text-4xl font-bold tracking-tight text-balance">
                    MALAWI FOOTBALL STATISTICS
                </h1>
                <p class="mt-2 text-muted-foreground text-pretty">
                    Comprehensive match insights and dramatic moments from
                    Malawi football
                </p>
            </div>
        </header>

        <StatsOverview />

        <div class="container mx-auto px-4 py-12 space-y-16">
            <ComebackKings />
            <HeartBreakers />
            <LatestWinners />
            <CleanSheets />
            <HalfTimeLeadWin />
            <RedCardSurvival />
            <ScoreFirstWin />
            <TheEqualizers />
            <EarlyGoalWinRate />
        </div>

        <footer class="border-t border-border bg-card mt-24">
            <div class="container mx-auto px-4 py-8">
                <p class="text-sm text-muted-foreground text-center">
                    Malawi Football Statistics Platform • 2025 Season
                </p>
            </div>
        </footer>
    </main>
</template>

<style scoped>
/* Add component-specific styles here if needed */
</style>
