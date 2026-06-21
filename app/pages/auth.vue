<template>
    <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#04060a]">
        <div class="absolute inset-0 -z-20 bg-gradient-to-b from-[#021018] via-[#03121a] to-[#00070a]" />
        <div class="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
            <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#083235] opacity-60 blur-[120px]"></div>
            <div
                class="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#06312a] opacity-40 blur-[140px]">
            </div>
            <div
                class="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(20,184,166,0.02),transparent_40%)]" />
        </div>
        <UCard
            class="relative z-10 w-full max-w-lg px-10 py-12 rounded-2xl border border-gray-800/40 bg-gradient-to-b from-[#071018]/60 to-[#02040a]/60 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
            <div class="flex flex-col items-center text-center mb-8">
                <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                    Welcome to
                    <span class="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-lime-300">
                        Mpira Stats
                    </span>
                </h1>
            </div>
            <ClerkLoaded>
                <SignIn routing="hash" afterSignInUrl="/admin/dashboard" afterSignUpUrl="/admin/dashboard" />
            </ClerkLoaded>
            <ClerkLoading>
                <div class="flex justify-center py-8">
                    <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-teal-400" />
                </div>
            </ClerkLoading>
        </UCard>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" })
</script>
