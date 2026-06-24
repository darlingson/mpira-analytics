<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-50 border-b border-default bg-default/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <NuxtLink to="/dashboard" class="flex items-center gap-2">
            <span class="text-xl font-extrabold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              Mpira Stats
            </span>
          </NuxtLink>
          <div class="flex items-center gap-4">
            <NuxtLink to="/matches" class="text-sm font-medium text-muted hover:text-default transition-colors">
              Matches
            </NuxtLink>
            <NuxtLink to="/teams" class="text-sm font-medium text-muted hover:text-default transition-colors">
              Teams
            </NuxtLink>
            <NuxtLink to="/seasons" class="text-sm font-medium text-muted hover:text-default transition-colors">
              Seasons
            </NuxtLink>
            <NuxtLink to="/insights" class="text-sm font-medium text-muted hover:text-default transition-colors">
              Insights
            </NuxtLink>
            <NuxtLink to="/players" class="text-sm font-medium text-muted hover:text-default transition-colors">
              Players
            </NuxtLink>
            <NuxtLink to="/top-scorers" class="text-sm font-medium text-muted hover:text-default transition-colors">
              Top Scorers
            </NuxtLink>
            <SignOutButton redirectUrl="/auth">
              <UButton color="neutral" variant="ghost" size="sm">
                <UIcon name="i-heroicons-arrow-left-on-rectangle" class="h-5 w-5" />
              </UButton>
            </SignOutButton>
          </div>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

