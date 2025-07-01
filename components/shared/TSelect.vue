<script setup>
const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  autocomplete: {
    type: Boolean,
    default: false,
  },
});

const model = defineModel();

const isDropdownOpen = ref(false);
const selectContainer = ref(null);
const inputValue = ref("");
const dropdownStyles = ref({});

onMounted(() => {
  const handleClickOutside = (event) => {
    if (
      selectContainer.value &&
      !selectContainer.value.contains(event.target)
    ) {
      isDropdownOpen.value = false;
    }
  };

  const handleScrollOrResize = () => {
    if (isDropdownOpen.value) updateDropdownPosition();
  };

  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", handleScrollOrResize);
  window.addEventListener("scroll", handleScrollOrResize, true);

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
    window.removeEventListener("resize", handleScrollOrResize);
    window.removeEventListener("scroll", handleScrollOrResize, true);
  });
});

const isOptionsEmpty = computed(() => props.options.length === 0);

// Atualiza o valor do input ao mudar o model
watch(
  model,
  () => {
    const selectedOption = props.options.find(
      (opt) => opt.value === model.value
    );
    inputValue.value = selectedOption ? selectedOption.label : "";
  },
  { immediate: true }
);

// Limpa o model se autocomplete ativado e input vazio
watch(inputValue, (val) => {
  if (props.autocomplete && val.trim() === "") {
    model.value = null;
  }
});

const displayValue = computed(() => {
  const selectedOption = props.options.find(
    (opt) => opt.value === model.value
  );
  return selectedOption ? selectedOption.label : "";
});

const filteredOptions = computed(() => {
  if (!props.autocomplete || !inputValue.value) return props.options;
  return props.options.filter((opt) =>
    opt.label.toLowerCase().includes(inputValue.value.toLowerCase().trim())
  );
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) updateDropdownPosition();
};

const selectOption = (option) => {
  model.value = option.value;
  inputValue.value = option.label;
  isDropdownOpen.value = false;
};

const updateDropdownPosition = () => {
  if (!selectContainer.value) return;
  const rect = selectContainer.value.getBoundingClientRect();
  dropdownStyles.value = {
    position: "absolute",
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    zIndex: 9999,
  };
};

watch(isDropdownOpen, (open) => {
  if (open) updateDropdownPosition();
});
</script>

<template>
  <div>
    <div ref="selectContainer" class="relative w-full">
      <label
        v-if="label"
        class="absolute -top-3 left-2 bg-white px-1 text-sm text-gray-600 z-40"
      >
        {{ label }}
      </label>

      <div v-if="autocomplete" class="w-full">
        <input
          v-model="inputValue"
          type="text"
          class="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101518] focus:outline-0 focus:ring-0 border-none bg-[#eaedf1] focus:border-none h-12 placeholder:text-[#5c748a] p-4 text-base font-normal leading-normal"
          :placeholder="placeholder"
          :readonly="isOptionsEmpty"
          @focus="isDropdownOpen = true"
        />
      </div>

      <!-- Dropdown padrão -->
      <div
        v-else
        class="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101518] focus:outline-0 focus:ring-0 border-none bg-[#eaedf1] focus:border-none h-12 placeholder:text-[#5c748a] p-4 text-base font-normal leading-normal items-center justify-between cursor-pointer transition-all duration-200 relative"
        :class="{
          'ring-2 ring-blue-200': isDropdownOpen,
          'text-gray-400': !model,
        }"
        tabindex="0"
        @click="toggleDropdown"
      >
        <span>
          {{ displayValue || placeholder }}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="ml-2 w-5 h-5 transition-transform duration-200"
          :class="{ 'rotate-180': isDropdownOpen }"
        >
          <path d="M7 10l5 5 5-5z" fill="currentColor" />
        </svg>
      </div>
    </div>

    <!-- Dropdown com teleport -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isDropdownOpen"
          class="border rounded-md shadow-lg bg-white max-h-60 overflow-y-auto"
          :style="dropdownStyles"
        >
          <!-- Se não há opções, mostra mensagem centralizada -->
          <div
            v-if="filteredOptions.length === 0"
            class="px-4 py-6 text-center text-gray-500 text-sm"
          >
            Dados não encontrados
          </div>

          <!-- Se há opções, lista elas normalmente -->
          <div
            v-for="option in filteredOptions"
            :key="option.value"
            class="px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition-colors duration-150"
            :class="{ 'bg-blue-50': model === option.value }"
            @click="selectOption(option)"
          >
            {{ option.label }}
            <svg
              v-if="model === option.value"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="text-blue-500 w-5 h-5 ml-2"
            >
              <path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
