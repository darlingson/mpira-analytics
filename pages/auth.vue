<template>
  <div class="card">
    <h1>{{ isRegister ? "Create account" : "Sign in" }}</h1>

    <form @submit.prevent="handleSubmit">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required minlength="6"/>
      <button type="submit">{{ isRegister ? "Register" : "Login" }}</button>
    </form>

    <p class="switch">
      {{ isRegister ? "Already have an account?" : "New here?" }}
      <a href="#" @click.prevent="isRegister = !isRegister">
        {{ isRegister ? "Sign in" : "Create one" }}
      </a>
    </p>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
/* ---------- state ---------- */
const email      = ref("");
const password   = ref("");
const error      = ref("");
const isRegister = ref(false);

/* ---------- submit ---------- */
async function handleSubmit() {
  error.value = "";
  try {
    const endpoint = isRegister.value ? "/api/auth/register" : "/api/auth/login";
    const res = await $fetch(endpoint, {
      method: "POST",
      body: { email: email.value, password: password.value }
    });

    // success -> store access-token cookie & redirect
    const token = useCookie("accessToken", { maxAge: 60 * 15 }); // 15 min
    token.value = res.accessToken;
    await navigateTo("/dashboard");           // or any protected entry point
  } catch (e) {
    error.value = (e.data?.statusMessage || "Request failed");
  }
}
</script>

<style scoped>
.card{max-width:360px;margin:5rem auto;padding:2rem;border:1px solid #ddd;border-radius:8px}
input{width:100%;padding:.5rem;margin:.5rem 0}
button{width:100%;padding:.6rem;background:#000;color:#fff;border:none;cursor:pointer}
.switch{margin-top:1rem;text-align:center;font-size:.9rem}
.error{color:red;margin-top:1rem}
</style>