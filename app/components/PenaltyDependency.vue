<script setup lang="ts">
const { data: penaltyData } = await useFetch("/api/insights/penalty-dependency")
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-primary p-3">
                <UIcon
                    name="lucide:circle-slash-2"
                    class="h-8 w-8 text-primary-foreground"
                />
            </div>
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-balance">
                    PENALTY DEPENDENCY
                </h2>
                <p class="text-muted-foreground text-pretty">
                    Percentage of goals coming from penalties
                </p>
            </div>
        </div>

        <div v-if="!penaltyData || penaltyData.length === 0" class="text-center py-12 rounded-xl border border-border bg-card">
            <UIcon name="lucide:circle-slash-2" class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 class="text-lg font-medium">Not Available</h3>
            <p class="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Penalty goals cannot be identified because <code class="text-accent">match_events</code> stores all goals
                with <code class="text-accent">event_type = 'goal'</code> and no penalty-specific subtype exists.
            </p>
        </div>
    </section>
</template>
