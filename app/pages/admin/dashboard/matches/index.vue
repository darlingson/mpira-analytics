<script lang="ts" setup>
import { ref, computed, watchEffect, resolveComponent } from 'vue'
const loading = ref(false);
import type { TableColumn } from '@nuxt/ui'

const router = useRouter()
interface Match {
    id: number
    season: string
    match_date: string
    home_team: string
    away_team: string
    final_score: string
    half_time: string
    home_team_id: number
    away_team_id: number
}

interface MatchesResponse {
    data: Match[]
    total: number
    page: number
    pageSize: number
}
interface SimplifiedMatch {
    id: number
    match: string
    date: string
    status: string
    actions: string
}
definePageMeta({
    layout: 'admin',
})

const page = ref(1)
const pageSize = ref(10)
const search = ref('')

const matchesResponse = ref<MatchesResponse>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10
})
const fetchMatches = async () => {
    loading.value = true
    const res = await $fetch<MatchesResponse>('/api/matches', {
        params: { page: page.value, pageSize: pageSize.value, search: search.value }
    })
    matchesResponse.value = res
    loading.value = false
}

await fetchMatches()

watchEffect(() => {
    fetchMatches()
})

const simplifiedMatches = computed(() => {
    return matchesResponse.value.data.map(m => {
        const today = new Date()
        const matchDay = new Date(m.match_date)
        let status = ''

        if (matchDay > today) status = 'Upcoming'
        else if (!m.final_score) status = 'Pending'
        else status = 'Completed'

        return {
            id: m.id,
            match: `${m.home_team} vs ${m.away_team}`,
            date: m.match_date,
            status,
            actions: 'View'
        }
    })
})


const columns: TableColumn<SimplifiedMatch>[] = [
    {
        accessorKey: 'id',
        header: '#',
        cell: ({ row }) => `#${row.getValue('id')}`
    },
    {
        accessorKey: 'match',
        header: 'Match',
    },
    {
        accessorKey: 'date',
        header: 'Date',
    },
    {
        accessorKey: 'status',
        header: 'Status'
    },
    {
        accessorKey: 'Actions',
        header: () => h('div', { class: 'text-right' }, 'Amount'),
        cell: ({ row }) => {
            return h('button', {
                class: 'px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700',
                onClick: () => router.push(`/admin/dashboard/matches/${row.getValue('id')}`)
            }, 'View')
        }
    }
]
</script>

<template>
    <div class="container">
        <hr class="border-gray-700" />

        <section>
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-semibold mb-4 text-white">Recent Match Updates</h2>
                <UButton icon="i-heroicons-plus" size="md" color="primary" variant="solid"
                    to="/admin/dashboard/matches/new">
                    Add New Match
                </UButton>
            </div>

            <div class="mb-4 flex gap-2">
                <input v-model="search" placeholder="Search matches..." class="px-2 py-1 rounded border" />
            </div>

            <UTable :columns="columns" :loading loading-color="primary" loading-animation="carousel"
                :data="simplifiedMatches" class="flex-1" />

            <div class="mt-4 flex justify-between items-center text-white">
                <span>
                    Showing page {{ matchesResponse.page }} of
                    {{ Math.ceil(matchesResponse.total / matchesResponse.pageSize) }}
                </span>
                <div class="flex gap-2">
                    <button :disabled="page === 1" @click="page--" class="px-2 py-1 rounded bg-gray-700">
                        Prev
                    </button>
                    <button :disabled="page >= Math.ceil(matchesResponse.total / matchesResponse.pageSize)"
                        @click="page++" class="px-2 py-1 rounded bg-gray-700">
                        Next
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>
