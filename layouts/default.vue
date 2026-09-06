<template>
  <div>
    <LayoutNavBar class="md:hidden" />
    <LayoutSideNav class="hidden md:flex" />

    <div class="content" :class="{ 'content--collapsed': collapsed }">
      <slot />
    </div>
  </div>
</template>
<script setup>
const collapsed = useSidebarCollapsed();

// Restores the real session (organizationId, role) from the token before any
// child page runs its own org-scoped fetches — see useCurrentOrganization().
const { fetchMe } = useAuth();
await fetchMe();
</script>

<style scoped lang="postcss">
.content {
  height: 100dvh;
  padding-top: 92px;
  box-sizing: border-box;
  overflow: auto;
  background: var(--color-page);
}

@media (min-width: 768px) {
  .content {
    padding-top: 0;
    /* sidebar's own left-4 inset (1rem) + its 16rem width + a matching 1rem gap before content */
    margin-left: 18rem;
    transition: margin-left 0.2s;
  }

  .content--collapsed {
    /* left-4 inset (1rem) + collapsed 4rem width + 1rem gap */
    margin-left: 6rem;
  }
}
</style>
