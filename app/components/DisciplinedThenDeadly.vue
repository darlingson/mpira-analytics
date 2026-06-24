<script setup lang="ts">
const { data: disciplinedData } = await useFetch("/api/insights/disciplined-then-deadly")
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-primary p-3">
                <UIcon
                    name="lucide:swords"
                    class="h-8 w-8 text-primary-foreground"
                />
            </div>
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-balance">
                    DISCIPLINED THEN DEADLY
                </h2>
                <p class="text-muted-foreground text-pretty">
                    Matches where a team got a card in the first half and scored in the second
                </p>
            </div>
        </div>

        <div v-if="!disciplinedData || disciplinedData.length === 0" class="text-center py-12 rounded-xl border border-border bg-card">
            <UIcon name="lucide:search-x" class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 class="text-lg font-medium">No Matches Found</h3>
            <p class="text-sm text-muted-foreground mt-1">
                No matches match this pattern yet.
            </p>
        </div>

        <div v-else class="space-y-4">
            <Card
                v-for="(item, idx) in disciplinedData"
                :key="idx"
                class="p-6 bg-card border-border"
            >
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-xl font-bold">{{ item.team }}</h3>
                        <p class="text-sm text-muted-foreground">
                            vs {{ item.opponent }}
                            <span class="text-xs ml-2">{{ new Date(item.match_date).toLocaleDateString('en-GB') }}</span>
                        </p>
                    </div>
                    <Badge
                        :variant="item.won ? 'default' : item.drawn ? 'secondary' : 'destructive'"
                    >
                        {{ item.final_score }}
                        {{ item.won ? 'W' : item.drawn ? 'D' : 'L' }}
                    </Badge>
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            First Half Cards
                        </p>
                        <div v-for="(card, ci) in item.card_events" :key="ci"
                            class="flex items-center gap-2 text-sm mb-1"
                        >
                            <Badge variant="outline" class="font-mono text-xs">{{ card.minute }}'</Badge>
                            <span>{{ card.player }}</span>
                            <UIcon
                                :name="card.type === 'red_card' || card.type === 'second_yellow_card' ? 'lucide:octagon-alert' : 'lucide:triangle-alert'"
                                :class="card.type === 'red_card' || card.type === 'second_yellow_card' ? 'text-red-500' : 'text-yellow-500'"
                                class="h-4 w-4"
                            />
                        </div>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Second Half Goals
                        </p>
                        <div v-for="(g, gi) in item.goal_events" :key="gi"
                            class="flex items-center gap-2 text-sm mb-1"
                        >
                            <Badge variant="outline" class="font-mono text-xs">{{ g.minute }}'</Badge>
                            <span>{{ g.player }}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </section>
</template>
