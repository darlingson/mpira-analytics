<template>
    <div class="flex flex-col gap-6">
      <h1 class="font-bold text-2xl text-(--ui-primary)">Seasons Performance</h1>
  
      <!-- Loading State -->
      <UProgress v-if="pending" animation="carousel" />
  
      <!-- Error State -->
      <UAlert
        v-if="error"
        variant="solid"
        title="Error"
        :description="error.message"
        icon="i-lucide-alert-circle"
      />
  
      <!-- Data Display -->
      <div v-if="data" class="space-y-8">
        <div v-for="season in data.data" :key="season.season" class="space-y-4">
          <h2 class="font-semibold text-xl text-(--ui-primary)">{{ season.season }}</h2>
          <UTable :data="season.stats" :columns="columns" :loading="pending" class="w-full" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { h } from 'vue';
  import type { TableColumn } from '@nuxt/ui';
  
  definePageMeta({
    layout: 'default',
  });
  
  interface Welcome {
    message: string;
    data: Datum[];
  }
  
  interface Datum {
    season: string;
    stats: Stat[];
  }
  
  interface Stat {
    team: string;
    teamStats: TeamStats;
  }
  
  interface TeamStats {
    matches_played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_scored: number | null;
    goals_conceded: number | null;
    goal_difference: number | null;
    home_goals: number | null;
    away_goals: number | null;
    avg_goals_per_game: number | null;
    avg_goals_conceded_per_game: number | null;
    clean_sheets: number;
    failed_to_score: number;
    home_matches: number;
    away_matches: number;
    home_record: string;
    away_record: string;
  }
  
  const { data, pending, error } = await useAsyncData<Welcome>('seasons-performance', () =>
    $fetch('/api/seasons/performance')
  );
  
  const columns: TableColumn<Stat>[] = [
    {
      accessorKey: 'team',
      header: 'Team',
    },
    {
      accessorKey: 'teamStats.matches_played',
      header: 'Matches Played',
    },
    {
      accessorKey: 'teamStats.wins',
      header: 'Wins',
    },
    {
      accessorKey: 'teamStats.draws',
      header: 'Draws',
    },
    {
      accessorKey: 'teamStats.losses',
      header: 'Losses',
    },
    {
      accessorKey: 'teamStats.goals_scored',
      header: 'Goals Scored',
      cell: ({ row }) => row.getValue('teamStats.goals_scored') ?? '-',
    },
    {
      accessorKey: 'teamStats.goals_conceded',
      header: 'Goals Conceded',
      cell: ({ row }) => row.getValue('teamStats.goals_conceded') ?? '-',
    },
    {
      accessorKey: 'teamStats.goal_difference',
      header: 'Goal Difference',
      cell: ({ row }) => row.getValue('teamStats.goal_difference') ?? '-',
    },
    {
      accessorKey: 'teamStats.home_goals',
      header: 'Home Goals',
      cell: ({ row }) => row.getValue('teamStats.home_goals') ?? '-',
    },
    {
      accessorKey: 'teamStats.away_goals',
      header: 'Away Goals',
      cell: ({ row }) => row.getValue('teamStats.away_goals') ?? '-',
    },
    {
      accessorKey: 'teamStats.avg_goals_per_game',
      header: 'Avg Goals/Game',
      cell: ({ row }) => row.getValue('teamStats.avg_goals_per_game') ?? '-',
    },
    {
      accessorKey: 'teamStats.avg_goals_conceded_per_game',
      header: 'Avg Goals Conceded/Game',
      cell: ({ row }) => row.getValue('teamStats.avg_goals_conceded_per_game') ?? '-',
    },
    {
      accessorKey: 'teamStats.clean_sheets',
      header: 'Clean Sheets',
    },
    {
      accessorKey: 'teamStats.failed_to_score',
      header: 'Failed to Score',
    },
    {
      accessorKey: 'teamStats.home_matches',
      header: 'Home Matches',
    },
    {
      accessorKey: 'teamStats.away_matches',
      header: 'Away Matches',
    },
    {
      accessorKey: 'teamStats.home_record',
      header: 'Home Record',
    },
    {
      accessorKey: 'teamStats.away_record',
      header: 'Away Record',
    },
  ];
  </script>