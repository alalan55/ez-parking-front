<template>
  <section class="space-y-5">
    <div class="flex items-center gap-2">
      <span
        class="w-6 h-6 shrink-0 rounded bg-green-700 dark:bg-green-500 flex items-center justify-center text-white"
      >
        <Icon name="tabler:parking-circle" size="1rem" />
      </span>
      <div>
        <h2 class="text-base font-semibold text-ink leading-tight">
          {{ isCheckin ? "Novo check-in" : "Check-out" }}
        </h2>
        <p class="text-xs text-ink-muted">
          {{
            isCheckin
              ? targetVacancyId
                ? `Registrar entrada na vaga ${targetVacancyId}.`
                : "Registre a entrada de um veículo em uma vaga disponível."
              : "Confirme a saída para liberar a vaga."
          }}
        </p>
      </div>
    </div>

    <div class="grid sm:grid-cols-1 md:grid-cols-3 gap-3">
      <UFormField label="Placa do veículo" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
        <UInput
          v-model="information.vehicle.plate"
          :disabled="!isCheckin"
          placeholder="ABC1D23"
          class="w-full"
          :ui="{ base: 'font-mono uppercase tracking-widest rounded' }"
          @input="debounceSearch"
        />
      </UFormField>

      <UFormField label="Cliente" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
        <USelect
          v-model="information.clientId"
          :items="clients"
          :disabled="!clients || !clients.length"
          placeholder="Selecionar cliente"
          class="w-full"
          :ui="{ base: 'rounded' }"
        />
      </UFormField>

      <UFormField label="Hora de entrada" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
        <UInput
          v-model="information.entryTime"
          :disabled="!isCheckin"
          type="time"
          class="w-full"
          :ui="{ base: 'font-mono rounded' }"
        />
      </UFormField>

      <UFormField
        v-if="!isCheckin"
        label="Hora de saída"
        :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }"
      >
        <UInput v-model="information.exitTime" type="time" class="w-full" :ui="{ base: 'font-mono rounded' }" />
      </UFormField>
    </div>

    <UFormField label="Observação" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
      <UInput
        v-model="information.observation"
        :disabled="!isCheckin"
        placeholder="Observações adicionais (opcional)"
        class="w-full"
        :ui="{ base: 'rounded' }"
      />
    </UFormField>

    <div class="flex items-center justify-end gap-2 pt-3 border-t border-line">
      <UButton
        :color="isCheckin ? 'primary' : 'error'"
        class="rounded"
        :loading="loading"
        :disabled="isDisabled"
        :label="isCheckin ? 'Confirmar check-in' : 'Confirmar check-out'"
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
  targetVacancyId: {
    type: [Number, String],
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

const isDisabled = computed(
  () =>
    loading.value ||
    (isCheckin.value &&
      (!information.value.vehicle.plate ||
        information.value.vehicle.plate.length < 7))
);

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
    `/vehicle/clients-based-on-vehicle/${plate}`
  );

  if (error.value) {
    console.error("Error fetching clients by vehicle:", error);
    toast.error({
      title: "Falha",
      message: "Não foi possível buscar os clientes para este veículo.",
    });
    return;
  }

  clients.value = (data.value.content || []).map((e) => ({
    ...e,
    label: e.name,
    value: e.id,
  }));
};

const currentTime = () =>
  new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const fillLocalInfo = () => {
  if (props.infoProps) {
    information.value = { ...props.infoProps };
    information.value.entryTime = props.infoProps?.activeVacancyLog?.entryTime
      ? new Date(
          props.infoProps.activeVacancyLog.entryTime
        ).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
    information.value.exitTime = currentTime();
  } else {
    information.value.entryTime = currentTime();
  }
};

const timeToIso = (time) => {
  const [hours, minutes] = time.split(":");
  const today = new Date();
  today.setHours(Number(hours), Number(minutes), 0, 0);
  return today.toISOString();
};

const extractErrorMessage = (error, fallback) => {
  const message = error?.message ?? error;
  if (Array.isArray(message)) return message.join(" ");
  if (typeof message === "string" && message) return message;
  return fallback;
};

const checkin = async () => {
  if (!information.value.vehicle.plate || information.value.vehicle.plate.length < 7) {
    toast.warning({
      title: "Atenção",
      message: "Informe uma placa válida (mínimo 7 caracteres).",
    });
    return;
  }

  if (!information.value.entryTime) {
    toast.warning({
      title: "Atenção",
      message: "Por favor, informe a hora de entrada.",
    });
    return;
  }

  loading.value = true;

  const model = {
    vehiclePlate: information.value.vehicle.plate.toUpperCase(),
    entryTime: timeToIso(information.value.entryTime),
    observation: information.value.observation,
    // collaboratorId/organizationId are set server-side from the logged-in
    // collaborator's own token — no need to (and no way to honestly) send
    // them from here.
  };

  if (props.targetVacancyId) model.vacancyId = Number(props.targetVacancyId);

  const { error } = await http.post("/parking-log/checkin", model);

  loading.value = false;

  if (error.value) {
    console.error("Error during check-in:", error.value);
    toast.error({
      title: "Falha",
      message: extractErrorMessage(
        error.value,
        "Não foi possível realizar o check-in."
      ),
    });
    return;
  }

  toast.success({
    title: "Check-in realizado com sucesso!",
  });

  emit("update");
};

const checkout = async () => {
  if (!information.value.exitTime) {
    toast.warning({
      title: "Atenção",
      message: "Por favor, informe a hora de saída.",
    });
    return;
  }

  loading.value = true;

  const model = {
    logId: information.value.parkingLogId,
    exitTime: timeToIso(information.value.exitTime),
  };

  const { error } = await http.post("/parking-log/checkout", model);

  loading.value = false;

  if (error.value) {
    console.error("Error during check-out:", error.value);
    toast.error({
      title: "Falha",
      message: extractErrorMessage(
        error.value,
        "Não foi possível realizar o check-out."
      ),
    });
    return;
  }

  toast.success({
    title: "Check-out realizado com sucesso!",
  });

  emit("update");
};

fillLocalInfo();
</script>
