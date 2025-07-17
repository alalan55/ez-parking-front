<template>
  <div
    class="overflow-hidden overflow-x-auto rounded-xl border border-[#d4dce2] bg-gray-50 w-full bg-white shadow-sm"
  >
    <table class="flex-1 w-full">
      <thead>
        <tr class="bg-slate-50">
          <th
            v-for="col in columns"
            :key="col.key"
            :class="[
              'px-4 py-3 text-left text-[#0d151c] text-sm font-medium leading-normal',
              col.thClass,
            ]"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="py-8 text-center">
            <slot name="loading">
              <span class="flex justify-center items-center gap-2 w-full">
                <SharedTSpinner size="6" border="2" />
                <span class="text-[#5c748a] text-base">Carregando...</span>
              </span>
            </slot>
          </td>
        </tr>
        <tr v-else-if="!rows.length">
          <td :colspan="columns.length" class="py-8 text-center text-[#5c748a]">
            <slot name="empty">
              Nenhum dado encontrado.
            </slot>
          </td>
        </tr>
        <tr
          v-else
          v-for="(row, rowIdx) in rows"
          :key="rowIdx"
          class="border-t border-t-[#cedce8]"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            :class="[
              'px-4 py-2 text-sm font-normal leading-normal',
              col.tdClass,
            ]"
          >
            <slot
              :name="`cell-${col.key}`"
              :row="row"
              :value="row[col.key]"
              :column="col"
            >
              {{ row[col.key] ?? "-" }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>