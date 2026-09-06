// Route guard — runs on every navigation. Real, since the backend now
// actually rejects unauthenticated requests with 401; this just keeps the
// user from landing on a page that would immediately fail every API call.
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie("ez_token");
  const isAuthenticated = !!token.value;

  if (to.path === "/") {
    return navigateTo(isAuthenticated ? "/internal" : "/auth/login");
  }

  if (to.path.startsWith("/internal") && !isAuthenticated) {
    return navigateTo("/auth/login");
  }

  if (to.path.startsWith("/auth") && isAuthenticated) {
    return navigateTo("/internal");
  }
});
