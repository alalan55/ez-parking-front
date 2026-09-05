<template>
  <div class="auth-bg min-h-dvh flex items-center justify-center p-4">
    <slot />
  </div>
</template>

<style scoped lang="postcss">
.auth-bg {
  background:
    radial-gradient(900px circle at 15% 10%, rgba(139, 92, 246, 0.12), transparent 55%),
    radial-gradient(900px circle at 85% 90%, rgba(20, 184, 166, 0.1), transparent 55%),
    var(--color-page);
}
</style>
