<template>
  <section class="space-y-6">
    <h2 class="text-2xl font-bold mb-4">
      {{ props.infoProps ? "Check-out" : "Check-in" }}
    </h2>

    <div class="grid gap-6 md:grid-cols-1">
      <div class="rounded-xl p-6 flex-1">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-[#5c748a] mb-1"
              >Vaga ID</label
            >
            <SharedTInput
              v-model="information.id"
              placeholder="Vaga ID"
              type="text"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#5c748a] mb-1"
              >Placa do veículo</label
            >
            <SharedTInput
              v-model="information.Vehicle.plate"
              placeholder="Placa"
              type="text"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-[#5c748a] mb-1"
              >Cliente</label
            >
            <SharedTInput placeholder="Cliente" type="text" />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#5c748a] mb-1"
              >Status</label
            >
            <SharedTInput
              v-model="information.status"
              placeholder="Status"
              type="text"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#5c748a] mb-1"
              >Hora entrada</label
            >
            <SharedTInput placeholder="Hora entrada" type="text" />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#5c748a] mb-1"
              >Hora saída</label
            >
            <SharedTInput placeholder="Hora saída" type="text" />
          </div>
        </div>
      </div>

      <!-- <div class="border border-[#e3e3e3] rounded-xl p-6 flex-1">
        <h3 class="text-lg font-semibold mb-4">Veículo</h3>
        <div class="grid gap-4">
          <div>
            <label class="block text-xs font-medium text-[#5c748a] mb-1"
              >Placa do veículo</label
            >
            <SharedTInput placeholder="Placa do veículo" type="text" />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#5c748a] mb-1"
              >Marca do veículo</label
            >
            <SharedTInput placeholder="Marca do veículo" type="text" />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#5c748a] mb-1"
              >Ano do veículo</label
            >
            <SharedTInput placeholder="Ano do veículo" type="text" />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#5c748a] mb-1"
              >Donos</label
            >
            <SharedTInput placeholder="Donos" type="text" />
          </div>
        </div>
      </div> -->
    </div>
    <div class="flex items-center justify-end">
      <SharedTButton class="max-w-[130px]" type="primary" title="Checkout" />
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  infoProps: {
    type: Object,
    default: () => ({}),
  },
});

const information = ref({ ...props.infoProps });
</script>

<style lang="postcss" scoped>
.title-section {
  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 2px;
    background-color: #e3e3e3;
    bottom: -4px;
    left: 0;
  }
}
</style>
