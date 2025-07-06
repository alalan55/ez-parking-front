<template>
  <section class="space-y-6">
    <h2 class="text-2xl font-bold mb-4">
      {{ isCheckin ? "Check-in" : "Check-out" }}
    </h2>

    <div class="rounded-xl p-6 flex-1">
      <div class="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium text-[#5c748a] mb-1"
            >Placa do veículo</label
          >
          <SharedTInput
            v-model="information.vehicle.plate"
            :readonly="!isCheckin"
            placeholder="Placa"
            type="text"
            @input="debounceSearch"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-[#5c748a] mb-1"
            >Clientes</label
          >
          <SharedTSelect :options="clients" placeholder="Cliente" type="text" />
        </div>

        <div>
          <label class="block text-xs font-medium text-[#5c748a] mb-1"
            >Hora entrada</label
          >
          <SharedTInput
            v-model="information.entryTime"
            :readonly="!isCheckin"
            placeholder="Hora entrada"
            type="time"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-[#5c748a] mb-1"
            >Hora saída</label
          >
          <SharedTInput placeholder="Hora saída" type="text" />
        </div>

      
      </div>
        <div class="mt-4">
          <label class="block text-xs font-medium text-[#5c748a] mb-1"
            >Observação</label
          >
          <SharedTInput placeholder="Observação" type="text" />
        </div>
    </div>

    <div class="flex items-center justify-end">
      <SharedTButton
        class="max-w-[130px]"
        type="primary"
        :title="isCheckin ? 'Check-in' : 'Check-out'"
      />
    </div>
  </section>
</template>

<script setup>
import { useDebounceFn } from "@vueuse/core";

const props = defineProps({
  infoProps: {
    type: Object,
    default: null,
  },
});

const toast = useToast();
const http = useApi();

const information = ref({ id: "", vehicle: { plate: "" }, status: "" });
const clients = ref([]);

const debounceSearch = useDebounceFn(() => {
  searchClientsByVehicle();
}, 800);

const isCheckin = computed(() => !props.infoProps);

const searchClientsByVehicle = async () => {
  const plate = information.value.vehicle.plate;
  if (!plate) return;

  if (plate.length < 7) {
    toast.warning({
      title: "Atenção",
      message: "A placa deve ter pelo menos 7 caracteres.",
    });
    return;
  }

  const { data, error } = await http.get(
    `/dash/clients-based-on-vehicle/${plate}`
  );

  if (error.value) {
    console.error("Error fetching clients by vehicle:", error);
    toast.error({
      title: "Falha",
      description: "Não foi possível buscar os clientes para este veículo.",
    });
  }

  clients.value = data.value.content.map((e) => ({
    ...e,
    label: e.name,
    value: e.id,
  }));
};

const fillLocalInfo = () => {
  if (props.infoProps) {
    information.value = { ...props.infoProps };
    information.value.entryTime = new Date(
      props.infoProps.activeVacancyLog.createdAt
    ).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

fillLocalInfo();
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
