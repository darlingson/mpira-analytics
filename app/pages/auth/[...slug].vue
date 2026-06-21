<template>
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/20 blur-[120px]" />
      <div class="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-accent-400/20 blur-[140px]" />
    </div>

    <UCard class="relative z-10 w-full max-w-lg px-10 py-12 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
      <div class="flex flex-col items-center text-center mb-8">
        <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Welcome to
          <span class="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-cyan-300">
            Mpira Stats
          </span>
        </h1>
      </div>

      <ClerkLoaded>
        <SignIn fallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard" />
      </ClerkLoaded>
      <ClerkLoading>
        <div class="flex justify-center py-8">
          <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-primary" />
        </div>
      </ClerkLoading>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })
</script>
