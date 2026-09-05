<template>
  <aside
    class="fixed top-4 left-4 bottom-4 z-40 flex flex-col bg-surface border border-line rounded-2xl shadow-lg shadow-slate-900/10 overflow-visible transition-[width] duration-200"
    :class="collapsed ? 'w-16' : 'w-64'"
  >
    <div class="relative h-full flex flex-col rounded-2xl overflow-hidden">
      <div
        class="h-16 shrink-0 flex items-center gap-2 border-b border-line"
        :class="collapsed ? 'justify-center px-0' : 'px-5'"
      >
        <div
          class="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-violet-500 to-teal-500 shadow-sm shadow-violet-500/30 flex items-center justify-center text-white p-1.5"
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_side_543)">
              <path
                d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z"
                fill="currentColor"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0343 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.9001L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285ZM29.2403 4.41187L43.5881 18.7597C44.9757 20.1473 44.9743 22.1235 44.6322 23.7139C44.2714 25.3919 43.4158 27.2666 42.252 29.1604C40.8128 31.5022 38.8165 34.012 36.4142 36.4142C34.012 38.8165 31.5022 40.8128 29.1604 42.252C27.2666 43.4158 25.3919 44.2714 23.7139 44.6322C22.1235 44.9743 20.1473 44.9757 18.7597 43.5881L4.41187 29.2403C3.29027 28.1187 3.08209 26.5973 3.21067 25.2783C3.34099 23.9415 3.8369 22.4852 4.54214 21.0277C5.96129 18.0948 8.43335 14.7382 11.5858 11.5858C14.7382 8.43335 18.0948 5.9613 21.0277 4.54214C22.4852 3.8369 23.9415 3.34099 25.2783 3.21067C26.5973 3.08209 28.1187 3.29028 29.2403 4.41187Z"
                fill="currentColor"
              ></path>
            </g>
            <defs>
              <clipPath id="clip0_side_543">
                <rect width="48" height="48" fill="white"></rect>
              </clipPath>
            </defs>
          </svg>
        </div>
        <span
          v-if="!collapsed"
          class="font-display text-base font-bold text-ink whitespace-nowrap"
        >
          Ez-parking
        </span>
      </div>

      <nav
        class="flex-1 overflow-y-auto py-4 space-y-1"
        :class="collapsed ? 'px-2' : 'px-3'"
      >
        <NuxtLink
          v-for="link in links"
          :key="link.name"
          :to="link.path"
          class="side-link"
          :class="{ 'justify-center px-0': collapsed }"
          :title="collapsed ? link.name : undefined"
        >
          <Icon :name="link.icon" size="1.15rem" class="shrink-0" />
          <span v-if="!collapsed" class="whitespace-nowrap">{{ link.name }}</span>
        </NuxtLink>
      </nav>

      <div
        class="shrink-0 border-t border-line p-3 flex items-center"
        :class="collapsed ? 'flex-col gap-2' : 'justify-between'"
      >
        <div class="flex items-center gap-1" :class="{ 'flex-col': collapsed }">
          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-tabler-sun' : 'i-tabler-moon'"
              color="neutral"
              variant="ghost"
              class="rounded-full"
              :ui="{ base: 'rounded-full' }"
              :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
              @click="toggleColorMode"
            />
            <template #fallback>
              <UButton
                icon="i-tabler-moon"
                color="neutral"
                variant="ghost"
                class="rounded-full"
                :ui="{ base: 'rounded-full' }"
                disabled
              />
            </template>
          </ClientOnly>
          <UButton
            icon="i-tabler-bell"
            color="neutral"
            variant="ghost"
            class="rounded-full"
            :ui="{ base: 'rounded-full' }"
          />
        </div>

        <figure class="w-8 h-8 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600"></figure>
      </div>
    </div>

    <button
      type="button"
      class="absolute -right-3 top-7 w-6 h-6 rounded-full bg-surface border border-line shadow-md flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
      :aria-label="collapsed ? 'Expandir menu' : 'Retrair menu'"
      @click="collapsed = !collapsed"
    >
      <Icon :name="collapsed ? 'tabler:chevron-right' : 'tabler:chevron-left'" size="0.9rem" />
    </button>
  </aside>
</template>

<script setup>
const collapsed = useSidebarCollapsed();

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
const toggleColorMode = () => {
  colorMode.preference = isDark.value ? "light" : "dark";
};

const links = [
  { name: "Home", path: "/internal", icon: "tabler:layout-dashboard" },
  { name: "Métricas", path: "/internal/metrics", icon: "tabler:chart-bar" },
  { name: "Clientes", path: "/internal/clients", icon: "tabler:users" },
  {
    name: "Organização",
    path: "/internal/organization",
    icon: "tabler:building-skyscraper",
  },
];

onMounted(() => {
  try {
    const stored = localStorage.getItem("ez-parking-sidebar-collapsed");
    if (stored !== null) collapsed.value = stored === "true";
  } catch (e) {
    // localStorage unavailable — keep default
  }
});

watch(collapsed, (value) => {
  try {
    localStorage.setItem("ez-parking-sidebar-collapsed", String(value));
  } catch (e) {
    // ignore
  }
});
</script>

<style lang="postcss" scoped>
.side-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink-muted);
  text-decoration: none;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.side-link:hover {
  background: var(--color-line);
  color: var(--color-ink);
}

.side-link.router-link-exact-active,
.side-link.router-link-exact-active:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(20, 184, 166, 0.12));
  color: var(--color-ink);
  font-weight: 600;
}

.side-link.router-link-exact-active::after {
  content: "";
  position: absolute;
  right: 0.4rem;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 55%;
  border-radius: 999px;
  background: linear-gradient(rgb(139, 92, 246), rgb(20, 184, 166));
}
</style>
