export default defineNuxtRouteMiddleware(async (to) => {
  const protectedRoutes = ["/dashboard", "/admin", "/profile"];
  if (!protectedRoutes.includes(to.path)) return;

  const { $fetch } = useNuxtApp();
  try {
    await $fetch("/api/auth/session");
  } catch {
    return navigateTo("/login");
  }
});