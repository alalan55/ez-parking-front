<template>
  <button
    class="w-full px-2 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
    :class="[props.class, props.variant]"
    :disabled="props.disabled || props.loading"
  >
    <slot>
      <span class="font-semibold">{{ props.title }}</span>
    </slot>

    <SharedTSpinner v-if="props.loading" size="4" border="2" />
  </button>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) => ["primary", "outlined"].includes(value), //"tonal"
  },
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
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped lang="postcss">
/* bg-[#000] text-[#fff] hover:bg-[#111] focus:bg-[#111] active:bg-[#222] */

.primary {
  background: #000;
  color: #fff;
}

.primary:hover {
  background: #111;
  color: #fff;
}

.primary:focus {
  background: #111;
  color: #fff;
}

.primary:active {
  background: #222;
  color: #fff;
}

.outlined {
  background: transparent;
  color: #000;
  border: 2px solid #000;
}
</style>
