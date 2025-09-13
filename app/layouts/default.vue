<template>
    <div class="flex flex-col min-h-screen">
      <UHeader>
        <template #logo>
          <span class="font-bold text-xl text-(--ui-primary)">Seasons Performance</span>
        </template>
        <template #navigation>
          <UNavigation :links="navLinks" />
        </template>
        <template #panel>
          <UButton
            label="GitHub"
            color="neutral"
            variant="outline"
            icon="i-simple-icons-github"
            to="https://github.com/nuxt/ui"
            target="_blank"
          />
        </template>
      </UHeader>
      <main class="flex-1 container mx-auto p-4">
        <slot />
      </main>
    </div>
  </template>
  
  <script setup>
  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Seasons', to: '/seasons' },
  ];
  </script>