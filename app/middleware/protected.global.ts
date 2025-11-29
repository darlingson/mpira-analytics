export default defineNuxtRouteMiddleware((to) => {
    const protectedRoutes = ["/admin",];
    if (!protectedRoutes.includes(to.path)) return;

    const token = useCookie("accessToken");
    if (!token.value) return navigateTo("/auth");
});