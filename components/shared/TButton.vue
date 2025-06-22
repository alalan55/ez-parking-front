<template>
  <button
    class="w-full px-2 py-3 rounded-lg bg-[#000] text-[#fff] hover:bg-[#111] focus:bg-[#111] active:bg-[#222] transition-colors duration-200 flex items-center justify-center gap-2"
    :class="props.class"
  >
    <slot name="content">
      <span class="font-semibold">{{ props.title }}</span>
    </slot>

    <SharedTSpinner v-if="props.loading" size="4" border="2" />
  </button>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: "default",
  },
  class: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style></style>
