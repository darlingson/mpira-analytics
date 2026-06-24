<script setup lang="ts">
const { data: cleanSheetData } = await useFetch("/api/insights/clean-sheet-when-scoring-first")
</script>

<template>
    <section>
        <div class="flex items-center gap-3 mb-8">
            <div class="rounded-lg bg-accent p-3">
                <UIcon
                    name="lucide:shield"
                    class="h-8 w-8 text-accent-foreground"
                />
            </div>
            <div>
                <h2 class="text-3xl font-bold tracking-tight text-balance">
                    CLEAN SHEET WHEN SCORING FIRST
                </h2>
                <p class="text-muted-foreground text-pretty">
                    Teams that score first and keep a clean sheet
                </p>
            </div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
                v-for="team in cleanSheetData"
                :key="team.team"
                class="p-6 bg-card border-border hover:border-accent transition-colors"
            >
                <h3 class="text-xl font-bold mb-4">{{ team.team }}</h3>
                <div class="flex items-center justify-center py-6">
                    <div class="text-center">
                        <p class="text-6xl font-bold text-accent">
                            {{ team.clean_sheet_when_scoring_first }}
                        </p>
                        <p class="text-sm text-muted-foreground mt-2 uppercase tracking-wide">
                            Clean Sheets
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    </section>
</template>
