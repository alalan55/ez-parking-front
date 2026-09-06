// The real organization id for the logged-in collaborator — replaces the
// hardcoded `1` that used to be sprinkled through every internal page's API
// calls. Relies on `useAuth().user` already being populated (layouts/default.vue
// awaits `fetchMe()` before any page renders).
export const useCurrentOrganizationId = () => {
  const { user } = useAuth();
  return computed(() => user.value?.organizationId);
};
