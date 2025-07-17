<template>
  <span
    :class="[
      'inline-block animate-spin rounded-full  border-solid border-current border-r-transparent',
      sizeClass,
      borderClass,
    ]"
  ></span>
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    default: "6",
  },
  border: {
    type: String,
    default: "2",
  },
});

const sizeClass = computed(
  () =>
    ({
      4: "h-4 w-4",
      5: "h-5 w-5",
      6: "h-6 w-6",
      8: "h-8 w-8",
      10: "h-10 w-10",
    }[props.size] || "h-6 w-6")
);

const borderClass = computed(
  () =>
    ({
      2: "border-2",
      4: "border-4",
      8: "border-8",
    }[props.border] || "border-2")
);
</script>
