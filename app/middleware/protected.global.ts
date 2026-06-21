export default defineNuxtRouteMiddleware((to) => {
  const { isSignedIn } = useAuth();

  const adminProtected = /^\/admin(\/|$)/;

  if (adminProtected.test(to.path)) {
    if (!isSignedIn) return navigateTo('/auth');
  }
});
