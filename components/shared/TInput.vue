<template>
  <input
    v-model="model"
    :placeholder="props.placeholder"
    :type="props.type"
    class="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101518] focus:outline-0 focus:ring-0 border-none bg-[#eaedf1] focus:border-none h-12 placeholder:text-[#5c748a] p-4 text-base font-normal leading-normal"
  />
</template>
<script setup>
const props = defineProps({
  placeholder: {
    type: String,
    default: "",
  },
  value: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
});

const model = defineModel();
</script>
