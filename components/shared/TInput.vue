<template>
  <input
    v-model="model"
    v-maska="`${props.mask}`"
    :placeholder="props.placeholder"
    :type="props.type"
    :readonly="props.readonly"
    class="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101518] focus:outline-0 focus:ring-0 border-none bg-[#eaedf1] focus:border-none h-12 placeholder:text-[#5c748a] p-4 text-base font-normal leading-normal"
  />
</template>
<script setup>
import { vMaska } from "maska/vue";
const model = defineModel({ type: String || Number });

const props = defineProps({
  readonly: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  mask: {
    type: String,
    default: "",
  },
});
</script>
