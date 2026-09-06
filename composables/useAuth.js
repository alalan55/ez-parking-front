// Real session state — a JWT issued by /auth/login or /auth/register, kept in
// a cookie (SSR-safe, survives reloads) plus the decoded-ish user info the
// backend already hands back alongside the token (no need to decode the JWT
// ourselves on the client).
export const useAuth = () => {
  const token = useCookie("ez_token", {
    maxAge: 60 * 60 * 24 * 7, // 7 days — matches the backend's token expiry
    sameSite: "lax",
  });
  const user = useState("auth-user", () => null);

  const isAuthenticated = computed(() => !!token.value);

  const setSession = ({ token: accessToken, collaborator }) => {
    token.value = accessToken;
    user.value = collaborator;
  };

  const clearSession = () => {
    token.value = null;
    user.value = null;
  };

  const login = async ({ email, password }) => {
    const http = useApi();
    const { data, error } = await http.post("/auth/login", { email, password });
    if (error.value) return { error: error.value };

    setSession(data.value.content);
    return { data: data.value.content };
  };

  const register = async (payload) => {
    const http = useApi();
    const { data, error } = await http.post("/auth/register", payload);
    if (error.value) return { error: error.value };

    setSession(data.value.content);
    return { data: data.value.content };
  };

  // Restores `user` from the token after a hard refresh (SSR state is empty
  // even though the cookie survived). Safe to call more than once.
  const fetchMe = async () => {
    if (!token.value || user.value) return;

    const http = useApi();
    const { data, error } = await http.get("/auth/me");
    if (error.value) {
      clearSession();
      return;
    }
    user.value = data.value.content;
  };

  const logout = () => clearSession();

  return { token, user, isAuthenticated, login, register, logout, fetchMe };
};
