export default defineNuxtRouteMiddleware((to) => {
  const { isSignedIn } = useAuth();

  const protectedRoutes = /^\/(admin|dashboard|teams|players)(\/|$)/;

  if (protectedRoutes.test(to.path)) {
    if (!isSignedIn) return navigateTo('/auth');
  }
});
