// export default defineNuxtRouteMiddleware((to) => {
//     const protectedRoutes = ["/admin/*",];
//     if (!protectedRoutes.includes(to.path)) return;

//     const token = useCookie("accessToken");
//     if (!token.value) return navigateTo("/auth");
// });
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie("accessToken");

  const adminProtected = /^\/admin(\/|$)/;

  if (adminProtected.test(to.path)) {
    if (!token.value) return navigateTo('/auth');
  }
});
