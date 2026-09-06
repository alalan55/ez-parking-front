import { ref } from "vue";

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiUrl;

  // Função que lida com as requisições HTTP usando $fetch
  const handleRequest = async (
    method,
    endpoint,
    payload = null,
    options = {}
  ) => {
    const data = ref(null);
    const loading = ref(false);
    const error = ref(null);

    try {
      loading.value = true;

      // Real session token (set by useAuth on login/register), not sent at
      // all for the two endpoints that don't need one yet (/auth/login,
      // /auth/register themselves).
      const token = useCookie("ez_token").value;

      const fetchOptions = {
        method,
        baseURL,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      };

      if (payload && method !== "GET" && method !== "DELETE") {
        fetchOptions.body = payload;
      }

      data.value = await $fetch(endpoint, fetchOptions);
    } catch (err) {
      // An expired/invalid token is worth clearing right away so the app
      // doesn't keep sending it — the next navigation to an /internal page
      // will bounce to /auth/login via middleware/auth.global.js.
      if (err?.response?.status === 401) {
        useCookie("ez_token").value = null;
      }
      error.value = err?.data || err?.message || "An unknown error occurred";
    } finally {
      loading.value = false;
    }

    return { data, loading, error };
  };

  // Funções HTTP específicas
  const get = (endpoint, options = {}) =>
    handleRequest("GET", endpoint, null, options);
  const post = (endpoint, payload = {}, options = {}) =>
    handleRequest("POST", endpoint, payload, options);
  const put = (endpoint, payload = {}, options = {}) =>
    handleRequest("PUT", endpoint, payload, options);
  const del = (endpoint, options = {}) =>
    handleRequest("DELETE", endpoint, null, options);
  const patch = (endpoint, payload = {}, options = {}) =>
    handleRequest("PATCH", endpoint, payload, options);

  return {
    get,
    post,
    put,
    patch,
    delete: del,
  };
};
