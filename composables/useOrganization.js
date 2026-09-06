// Shared, fetch-once organization name — used by the nav chrome (sidebar +
// mobile navbar) so both don't independently re-fetch the same record on
// every page load. `useState` makes this SSR-safe and shared across the app.
export const useOrganizationName = () => {
  const name = useState("organization-name", () => "");
  const loaded = useState("organization-name-loaded", () => false);

  const fetchOrganizationName = async () => {
    if (loaded.value) return;
    loaded.value = true;

    const { user, fetchMe } = useAuth();
    await fetchMe();
    const organizationId = user.value?.organizationId;
    if (!organizationId) return;

    const http = useApi();
    const { data, error } = await http.get(`/organization/get-by-id/${organizationId}`);
    if (!error.value) name.value = data.value?.content?.name || "";
  };

  const initials = computed(() =>
    (name.value || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("")
  );

  return { name, initials, fetchOrganizationName };
};
