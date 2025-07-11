<template>
  <section class="space-y-6">
    <h2 class="text-2xl font-bold mb-4">
      {{ isCheckin ? "Check-in" : "Check-out" }}
    </h2>

    <div class="rounded-xl p-6 flex-1">
      <div class="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
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
          <SharedTSelect
            v-model="information.clientId"
            :options="clients"
            placeholder="Cliente"
            type="text"
          />
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
        <div v-if="!isCheckin">
          <label class="block text-xs font-medium text-[#5c748a] mb-1"
            >Hora saída</label
          >
          <SharedTInput
            v-model="information.exitTime"
            placeholder="Hora saída"
            type="time"
          />
        </div>
      </div>
      <div class="mt-4">
        <label class="block text-xs font-medium text-[#5c748a] mb-1"
          >Observação</label
        >
        <SharedTInput
          v-model="information.observation"
          :readonly="!isCheckin"
          placeholder="Observação"
          type="text"
        />
      </div>
    </div>

    <div class="flex items-center justify-end">
      <SharedTButton
        class="max-w-[130px]"
        type="primary"
        :loading="loading"
        :disabled="loading || !information.vehicle.plate"
        :title="isCheckin ? 'Check-in' : 'Check-out'"
        @click="isCheckin ? checkin() : checkout()"
      />
    </div>
  </section>
</template>

<script setup>
import { useDebounceFn } from "@vueuse/core";

const emit = defineEmits(["close", "update"]);

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
const loading = ref(false);

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
      props.infoProps?.activeVacancyLog?.createdAt
    ).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

// const pad = (n) => {
//   return n < 10 ? "0" + n : n;
// };

const checkin = async () => {
  loading.value = true;
  const model = {
    vehiclePlate: information.value.vehicle.plate,
    clientId: information.value.clientId,
    entryTime: information.value.entryTime,
    observation: information.value.observation,
    collaboratorId: 1, // Assuming a static collaborator ID for now
    organizationId: 1, // Assuming a static organization ID for now
  };

  // parse entryTime to ISO string and format to today
  const [hours, minutes] = information.value.entryTime.split(":");
  const today = new Date();

  today.setHours(Number(hours), Number(minutes), 0, 0);
  model.entryTime = today.toISOString();

  const { error } = await http.post("/dash/checkin", model);

  if (error.value) {
    loading.value = false;
    console.error("Error during check-in:", error);
    toast.error({
      title: "Falha",
      description: "Não foi possível realizar o check-in.",
    });
    return;
  }

  toast.success({
    title: "Check-in realizado com sucesso!",
  });

  loading.value = false;

  emit("update");
};

const checkout = async () => {


  if(!information.value.exitTime) {
    toast.warning({
      title: "Atenção",
      message: "Por favor, informe a hora de saída.",
    });
    return;
  }

  loading.value = true;

  const model = {
    vacancyId: information.value.id,
    logId: information.value.parkingLogId,
    exitTime: information.value.exitTime,
    collaboratorId: 1, // Assuming a static collaborator ID for now
    organizationId: 1, // Assuming a static organization ID for now
  };

  const [hours, minutes] = information.value.exitTime.split(":");
  const today = new Date();
  today.setHours(Number(hours), Number(minutes), 0, 0);
  model.exitTime = today.toISOString();

  const { error } = await http.post("/dash/checkout", model);

  if (error.value) {
    loading.value = false;
    console.error("Error during check-out:", error.value);
    toast.error({
      title: "Falha",
      message: "Não foi possível realizar o check-out.",
    });
    return;
  }

  toast.success({
    title: "Check-out realizado com sucesso!",
  });

  loading.value = false;
  emit("update");
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
