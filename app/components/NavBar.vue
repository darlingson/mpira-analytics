<template>
  <UContainer class="flex items-center justify-between py-4">
    <!-- Logo -->
    <ULink to="/" class="font-bold text-xl text-(--ui-primary)">MyApp</ULink>

    <!-- Desktop Navigation -->
    <div class="hidden md:flex items-center gap-4">
      <ULink
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        active-class="text-primary font-semibold"
        class="text-gray-600 dark:text-gray-300 hover:text-primary transition"
      >
        {{ item.label }}
      </ULink>
    </div>

    <!-- Right Side Controls -->
    <div class="flex items-center gap-2">
      <UButton
        class="md:hidden"
        variant="ghost"
        icon="i-heroicons-bars-3"
        @click="isOpen = !isOpen"
      />
    </div>

    <!-- Mobile Menu -->
    <div
      v-if="isOpen"
      class="absolute top-16 left-0 w-full bg-white dark:bg-gray-900 shadow-md py-4 px-6 flex flex-col gap-4 md:hidden z-50"
    >
      <ULink
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        class="text-gray-800 dark:text-gray-100 hover:text-primary"
        @click="isOpen = false"
      >
        {{ item.label }}
      </ULink>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const isOpen = ref(false)

const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: () => (colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark')
})

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Seasons', to: '/seasons' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' }
]
</script>
