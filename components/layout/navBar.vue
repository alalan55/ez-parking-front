<template>
  <header class="fixed top-3 sm:top-4 inset-x-3 sm:inset-x-4 z-50 flex justify-center">
    <nav
      class="relative w-full max-w-[1300px] h-14 flex items-center justify-between gap-4 px-4 sm:px-5 rounded-lg border border-line bg-surface shadow-sm overflow-hidden isolate"
    >
      <div class="flex items-center shrink-0">
        <div
          class="w-6 h-6 shrink-0 rounded bg-green-700 dark:bg-green-500 flex items-center justify-center text-white p-1"
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_6_543)">
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
              <clipPath id="clip0_6_543">
                <rect width="48" height="48" fill="white"></rect>
              </clipPath>
            </defs>
          </svg>
        </div>
        <span class="text-base font-semibold ml-2 text-ink">Ez-parking</span>
      </div>

      <div class="flex items-center">
        <Icon
          :name="menuVisible ? 'tabler:x' : 'tabler:menu-deep'"
          size="1.5rem"
          class="menu-hamburguer text-ink-muted hover:text-ink transition-colors duration-200 cursor-pointer"
          @click="handleClickmenu"
        />

        <Teleport to="body" :disabled="isDesktop">
          <div ref="menu" class="menu flex items-center gap-1">
            <template v-for="link in links" :key="link.name">
              <NuxtLink
                :to="link.path"
                class="link"
                :class="{
                  hidden: !isDesktop,
                }"
              >
                {{ link.name }}
              </NuxtLink>

              <NuxtLink
                :to="link.path"
                class="link"
                :class="{
                  hidden: isDesktop,
                }"
                @click="handleClickmenu"
              >
                {{ link.name }}
              </NuxtLink>
            </template>

            <div class="flex items-center gap-1 md:ml-2 md:pl-3 md:border-l md:border-line">
              <ClientOnly>
                <UButton
                  :icon="isDark ? 'i-tabler-sun' : 'i-tabler-moon'"
                  color="neutral"
                  variant="ghost"
                  class="rounded"
                  :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
                  @click="toggleColorMode"
                />
                <template #fallback>
                  <UButton
                    icon="i-tabler-moon"
                    color="neutral"
                    variant="ghost"
                    class="rounded"
                    disabled
                  />
                </template>
              </ClientOnly>

              <UButton
                icon="i-tabler-bell"
                color="neutral"
                variant="ghost"
                class="rounded"
              />

              <div
                v-if="organizationInitials"
                class="w-7 h-7 shrink-0 rounded bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-[11px] font-bold flex items-center justify-center ml-1"
                :title="organizationName"
              >
                {{ organizationInitials }}
              </div>

              <UButton
                icon="i-tabler-logout"
                color="neutral"
                variant="ghost"
                class="rounded"
                aria-label="Encerrar sessão"
                title="Encerrar sessão"
                @click="handleLogout"
              />
            </div>
          </div>
        </Teleport>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useWindowSize } from "@vueuse/core";

const menuVisible = ref(false);
const menu = ref(null);

const { width } = useWindowSize();

// Start with the same assumption the server renders (narrow/mobile), then correct
// once mounted — deciding this from `width` directly during SSR causes a hydration
// mismatch, since the server has no real viewport width to measure.
const isDesktop = ref(false);

onMounted(() => {
  isDesktop.value = width.value >= 768;
});

watch(width, (value) => {
  isDesktop.value = value >= 768;
});

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
const toggleColorMode = () => {
  colorMode.preference = isDark.value ? "light" : "dark";
};

const { name: organizationName, initials: organizationInitials, fetchOrganizationName } =
  useOrganizationName();

const { logout } = useAuth();
const handleLogout = async () => {
  logout();
  await navigateTo("/auth/login");
};

onMounted(() => {
  fetchOrganizationName();
});

const links = [
  { name: "Home", path: "/internal" },
  { name: "Métricas", path: "/internal/metrics" },
  { name: "Clientes", path: "/internal/clients" },
  { name: "Auditoria", path: "/internal/audit" },
  { name: "Organização", path: "/internal/organization" },
  { name: "Colaboradores", path: "/internal/collaborators" },
];

const handleClickmenu = () => {
  menuVisible.value = !menuVisible.value;
};

watch(
  () => menuVisible.value,
  (newValue) => {
    if (newValue) {
      menu.value.style.left = "6%";
    } else {
      menu.value.style.left = "150%";
    }
  }
);
</script>

<style lang="postcss" scoped>
.link {
  position: relative;
  text-decoration: none;
  padding: 0.5rem 0.85rem;
  border-radius: 0.375rem;
  font-weight: 500;
  color: var(--color-ink-muted);
  transition:
    background-color 0.2s,
    color 0.2s;
}

.link:hover {
  background: var(--color-line);
  color: var(--color-ink);
}

.menu-hamburguer {
  display: none;
}

.router-link-exact-active,
.router-link-exact-active:hover {
  background: var(--color-brand-soft);
  color: var(--color-ink);
  font-weight: 600;
}

.router-link-exact-active::after {
  content: "";
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 55%;
  border-radius: 999px;
  background: var(--color-brand);
}

@media (max-width: 768px) {
  .menu {
    position: fixed;
    background: var(--color-surface);
    top: 76px;
    right: 0.75rem;
    bottom: 0.75rem;
    left: 150%;
    z-index: 123;
    border-radius: 0.5rem;
    border: 1px solid var(--color-line);
    box-shadow: 0 4px 16px -8px rgba(15, 23, 42, 0.2);
    transition: left ease-in-out 0.3s;
    flex-direction: column;
    align-items: stretch;
    padding: 1.25rem;
    gap: 0.25rem;
  }

  .menu .link {
    padding: 0.75rem 1rem;
  }

  .menu-hamburguer {
    display: block;
  }
}
</style>
