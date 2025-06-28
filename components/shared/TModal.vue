<script setup>
const props = defineProps({
  modelValue: Boolean,
  showCloseButton: Boolean,
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  width: {
    type: String,
    default: "max-w-md",
    validator: (value) =>
      [
        "max-w-md",
        "max-w-lg",
        "max-w-3xl",
        "max-w-4xl",
        "max-w-5xl",
        "max-w-6xl",
        "max-w-7xl",
        "w-full",
      ].includes(value),
  },
});

const emit = defineEmits(["update:modelValue"]);

const closeModal = () => {
  emit("update:modelValue", false);
};

const handleKeydown = (event) => {
  if (event.key === "Escape") closeModal();
};

const modalClasses = computed(
  () =>
    `bg-white rounded-xl shadow-lg p-6 w-[90dvw] sm:w-auto ${props.width} transition-all transform animate-fade-in`
);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeydown);
    } else {
      document.removeEventListener("keydown", handleKeydown);
    }
  }
);

onMounted(() => {
  if (props.modelValue) {
    document.addEventListener("keydown", handleKeydown);
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-50"
      @click.self="closeModal"
    >
      <div :class="modalClasses">
        <button
          v-if="showCloseButton"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          @click="closeModal"
        >
          ✖
        </button>

        <div>
          <slot name="title">
            <h1 class="font-bold">{{ props.title }}</h1>
          </slot>

          <slot name="description">
            <span class="p-text-secondary block mb-5 font-thin">
              {{ props.description }}
            </span>
          </slot>

          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    scale: 0.95;
  }
  to {
    opacity: 1;
    scale: 1;
  }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>
