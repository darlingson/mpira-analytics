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
            class="relative z-10 w-full max-w-2xl px-10 py-12 rounded-2xl border border-gray-800/40 bg-gradient-to-b from-[#071018]/60 to-[#02040a]/60 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
            <div class="flex flex-col items-center text-center mb-8">
                <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                    Welcome to
                    <span class="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-lime-300">
                        Mpira Stats
                    </span>
                </h1>
                <p class="mt-3 text-gray-300 max-w-2xl">
                    Explore real-time insights into Malawi’s football — players, teams and season stats.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                    <form @submit.prevent="handleSubmit" class="space-y-4">
                        <UInput v-model="email" type="email" icon="i-heroicons-envelope" size="lg" color="neutral"
                            variant="outline" placeholder="Email address"
                            class="bg-transparent text-white placeholder-gray-400 border-gray-700" required />

                        <UInput v-model="password" type="password" icon="i-heroicons-lock-closed" size="lg"
                            color="neutral" variant="outline" placeholder="Password"
                            class="bg-transparent text-white placeholder-gray-400 border-gray-700" required
                            minlength="6" />

                        <div class="flex items-center justify-between mt-2">
                            <label class="flex items-center gap-2 text-sm text-gray-300">
                                <input v-model="remember" type="checkbox"
                                    class="h-4 w-4 rounded bg-gray-800 accent-teal-400" />
                                Remember me
                            </label>

                            <NuxtLink to="/forgot" class="text-sm text-teal-300 hover:underline">Forgot?</NuxtLink>
                        </div>

                        <UButton type="submit" size="lg" block :loading="isLoading"
                            class="mt-3 py-3 font-semibold text-lg bg-gradient-to-r from-teal-400 to-emerald-300 shadow-[0_10px_30px_rgba(20,184,166,0.12)] hover:brightness-105 transition">
                            {{ isRegister ? "Create account" : "Login" }}
                        </UButton>
                    </form>

                    <div class="mt-4 text-sm text-gray-300">
                        {{ isRegister ? "Already have an account?" : "New here?" }}
                        <button @click="toggleForm" class="ml-1 text-teal-300 font-medium hover:underline">
                            {{ isRegister ? "Sign in" : "Create one" }}
                        </button>
                    </div>

                    <p v-if="error" class="mt-4 text-sm text-red-400">{{ error }}</p>
                </div>
                <div class="hidden md:flex flex-col justify-center pl-6">
                    <div class="mb-6">
                        <div
                            class="inline-flex items-center px-3 py-2 rounded-full bg-gradient-to-r from-teal-600/10 to-transparent border border-gray-700/30">
                            <span class="text-sm text-teal-300 font-semibold">⚽ Featured</span>
                        </div>
                    </div>

                    <div
                        class="p-6 rounded-xl border border-gray-800/30 bg-gradient-to-b from-[#071018]/50 to-transparent">
                        <h3 class="text-xl font-semibold text-white mb-2">Season at a glance</h3>
                        <p class="text-gray-300 text-sm mb-4">
                            16 Teams · 340+ Players · 150+ Matches analyzed — insights ready when you log in.
                        </p>

                        <div class="grid grid-cols-3 gap-2">
                            <div class="text-center">
                                <p class="text-2xl font-bold text-teal-300">16</p>
                                <p class="text-xs text-gray-400">Teams</p>
                            </div>
                            <div class="text-center">
                                <p class="text-2xl font-bold text-teal-300">340+</p>
                                <p class="text-xs text-gray-400">Players</p>
                            </div>
                            <div class="text-center">
                                <p class="text-2xl font-bold text-teal-300">150+</p>
                                <p class="text-xs text-gray-400">Matches</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" })

type LoginResponse = { accessToken: string }
type RegisterResponse = { ok: true }

const email = ref("")
const password = ref("")
const remember = ref(false)
const error = ref("")
const isRegister = ref(false)

const isLoading = ref(false);

function toggleForm() {
    isRegister.value = !isRegister.value
    error.value = ""
}

async function handleSubmit() {
    error.value = ""
    isLoading.value = true
    try {
        const endpoint = isRegister.value
            ? "/api/auth/register"
            : "/api/auth/login"

        const body = { email: email.value, password: password.value }

        const res = await $fetch<LoginResponse | RegisterResponse>(endpoint, {
            method: "POST",
            body
        })

        if (isRegister.value) {
            isRegister.value = false
            return
        }

        const token = useCookie("accessToken", {
            maxAge: remember.value ? 60 * 60 * 24 * 7 : 60 * 15
        })

        if ("accessToken" in res) {
            token.value = res.accessToken
            await navigateTo("/admin/dashboard")
            return
        }
        
        isLoading.value = false
        await navigateTo("/admin/dashboard")
    } catch (e: any) {
        error.value =
            e?.data?.statusMessage ||
            e?.message ||
            "Authentication failed"
    }
    isLoading.value = false
}
</script>


<style scoped>
@keyframes gradient-move {
    0% {
        background-position: 0% 50%
    }

    50% {
        background-position: 100% 50%
    }

    100% {
        background-position: 0% 50%
    }
}

.bg-clip-text.animate-grad {
    background-size: 200% 200%;
    animation: gradient-move 6s ease infinite;
}
</style>
