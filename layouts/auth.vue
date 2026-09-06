<template>
  <div class="auth-bg min-h-dvh flex items-center justify-center p-4">
    <slot />
  </div>
</template>

<style scoped lang="postcss">
/*
  Flat "Terminal Operational Console" background — a faint technical grid
  instead of the old violet/teal ambient glow (gradients/glow are against the
  design language used everywhere else in the app now).
*/
.auth-bg {
  background-color: var(--color-page);
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
  background-size: 32px 32px;
  background-position: center;
}

.dark .auth-bg {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
}
</style>
