<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface GoalTimings {
  average_goal_time_per_team: { team: string; average_minute: number; total_goals: number }[]
  goals_by_period: { period: string; goals: number }[]
  minute_histogram: { minute: number; goals: number }[]
}

const { data: timings } = await useFetch<GoalTimings>("/api/goals/timings")

const maxPeriodGoals = computed(() => Math.max(...(timings.value?.goals_by_period.map(p => p.goals) ?? [1]), 1))
const maxHistogram = computed(() => Math.max(...(timings.value?.minute_histogram.map(h => h.goals) ?? [1]), 1))
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">Goal Timings</h1>
      <p class="text-muted-foreground mt-1">When goals are scored across matches</p>
    </div>

    <div v-if="timings" class="space-y-8">
      <div>
        <h2 class="text-xl font-bold mb-4">Average Goal Time Per Team</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="t in timings.average_goal_time_per_team"
            :key="t.team"
            class="p-4 bg-card border-border"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-bold">{{ t.team }}</p>
                <p class="text-xs text-muted-foreground">{{ t.total_goals }} goals</p>
              </div>
              <p class="text-2xl font-bold text-accent">{{ t.average_minute }}<span class="text-sm">'</span></p>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <h2 class="text-xl font-bold mb-4">Goals By Period (15-min intervals)</h2>
        <div class="space-y-3">
          <div
            v-for="p in timings.goals_by_period"
            :key="p.period"
            class="flex items-center gap-4"
          >
            <span class="text-sm font-medium w-16 text-right">{{ p.period }}</span>
            <div class="flex-1 h-6 rounded-full bg-muted overflow-hidden">
              <div
                class="h-full rounded-full bg-accent transition-all"
                :style="{ width: (p.goals / maxPeriodGoals * 100) + '%' }"
              />
            </div>
            <span class="text-sm font-bold w-10">{{ p.goals }}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-xl font-bold mb-4">Minute Histogram</h2>
        <div class="flex items-end gap-0.5 h-32">
          <div
            v-for="h in timings.minute_histogram"
            :key="h.minute"
            class="flex-1 min-w-[2px] bg-accent/60 hover:bg-accent transition-colors relative group"
            :style="{ height: (h.goals / maxHistogram * 100) + '%' }"
          >
            <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {{ h.minute }}': {{ h.goals }} goal{{ h.goals !== 1 ? 's' : '' }}
            </div>
          </div>
        </div>
        <div class="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0'</span>
          <span>45'</span>
          <span>90'</span>
        </div>
      </div>
    </div>
  </div>
</template>
