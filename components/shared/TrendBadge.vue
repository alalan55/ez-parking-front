<template>
  <span
    v-if="value !== null && value !== undefined"
    class="font-mono text-[11px] font-semibold flex items-center gap-0.5"
    :class="value > 0 ? 'text-green-700 dark:text-green-500' : value < 0 ? 'text-red-600 dark:text-red-500' : 'text-ink-faint'"
  >
    <Icon v-if="value !== 0" :name="value > 0 ? 'tabler:arrow-up' : 'tabler:arrow-down'" size="0.75rem" />
    {{ value > 0 ? "+" : "" }}{{ value }}%
  </span>
</template>

<script setup>
defineProps({
  value: {
    type: Number,
    default: null,
  },
});
</script>
