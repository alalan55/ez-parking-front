<template>
  <div class="shrink-0 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
    <div>
      <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-500"></span>
        Sistema online
        <span v-if="organizationName" class="text-ink-faint">· {{ organizationName }}</span>
      </p>
      <h1 class="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight mt-1">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="text-sm text-ink-muted mt-0.5">
        {{ subtitle }}
      </p>
    </div>

    <div class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
});

const { name: organizationName, fetchOrganizationName } = useOrganizationName();

onMounted(() => {
  fetchOrganizationName();
});
</script>
