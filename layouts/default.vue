<template>
  <div>
    <LayoutNavBar />

    <div class="content">
      <slot />
    </div>
  </div>
</template>
<script setup></script>

<style scoped lang="postcss">
.content {
  height: calc(100dvh - 70px);
  overflow: auto;
}
</style>
