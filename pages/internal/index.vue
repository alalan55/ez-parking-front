<template>
  <div class="min-h-full lg:h-full lg:overflow-hidden flex flex-col p-4 md:p-6">
    <div class="w-full max-w-[1400px] mx-auto flex flex-col flex-1 lg:min-h-0 gap-4 md:gap-5">
      <LayoutPageHeader title="Vagas" subtitle="Gerencie a ocupação e acompanhe os veículos em tempo real.">
        <template #actions>
          <ClientOnly>
            <div class="text-right hidden sm:block">
              <p class="font-mono text-sm font-semibold text-ink tabular-nums">{{ formattedClock }}</p>
              <p class="text-xs text-ink-faint capitalize">{{ formattedToday }}</p>
            </div>
          </ClientOnly>
          <UButton
            icon="i-tabler-refresh"
            color="neutral"
            variant="outline"
            class="rounded"
            :loading="loading"
            @click="getVacanciesLogs()"
          />
          <UButton
            icon="i-tabler-plus"
            color="primary"
            class="rounded"
            @click="openCheckin()"
          >
            Novo check-in
          </UButton>
        </template>
      </LayoutPageHeader>

      <section class="shrink-0">
        <div
          class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-line bg-surface border border-line rounded overflow-hidden"
        >
          <div class="p-4">
            <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Ocupação</p>
            <p class="text-2xl font-semibold text-ink mt-1">
              {{ Math.round(occupancy?.occupiedPercentage || 0) }}%
            </p>
            <p class="text-xs text-ink-muted mt-0.5">
              {{ occupancy?.occupied ?? 0 }}/{{ occupancy?.organizationVacancies ?? 0 }} vagas
            </p>
            <div class="h-1 mt-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full rounded-full bg-amber-500 transition-all duration-300"
                :style="{ width: `${Math.round(occupancy?.occupiedPercentage || 0)}%` }"
              ></div>
            </div>
          </div>

          <div class="p-4">
            <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Disponíveis</p>
            <p class="text-2xl font-semibold text-green-600 dark:text-green-500 mt-1">
              {{ String(occupancy?.available ?? 0).padStart(2, "0") }}
            </p>
            <p class="text-xs text-ink-muted mt-0.5">livres agora</p>
          </div>

          <div class="p-4">
            <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Capacidade</p>
            <p class="text-2xl font-semibold text-ink mt-1">{{ occupancy?.organizationVacancies ?? 0 }}</p>
            <p class="text-xs text-ink-muted mt-0.5">vagas cadastradas</p>
          </div>

          <div class="p-4">
            <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Receita de hoje</p>
            <p class="text-2xl font-semibold text-ink mt-1">{{ formattedRevenue }}</p>
            <p class="text-xs text-ink-muted mt-0.5">check-ins concluídos hoje</p>
          </div>
        </div>
      </section>

      <div class="shrink-0 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        <div class="flex items-center gap-1 bg-surface-2 border border-line rounded p-0.5 w-fit">
          <UButton
            v-for="filter in statusFilters"
            :key="filter.value"
            size="sm"
            color="neutral"
            :variant="statusFilter === filter.value ? 'solid' : 'ghost'"
            class="rounded gap-1.5"
            @click="statusFilter = filter.value"
          >
            {{ filter.label }}
            <span class="font-mono text-[11px]">{{ filter.count }}</span>
          </UButton>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UInput
            v-model="search"
            icon="i-tabler-search"
            placeholder="Pesquisar por placa, cliente ou vaga..."
            class="w-full sm:w-[260px]"
            :ui="{ base: 'rounded' }"
            @input="debouncedSearch"
          />

          <USelect
            v-model="typeFilter"
            :items="vehicleTypeOptions"
            class="w-full sm:w-[160px]"
            :ui="{ base: 'rounded' }"
          />
        </div>
      </div>

      <div
        class="flex-1 lg:min-h-0 pb-20 lg:pb-0 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 md:gap-5"
      >
        <section class="flex flex-col lg:min-h-0 lg:min-w-0">
          <div
            class="h-full bg-surface border border-line rounded lg:overflow-hidden flex flex-col"
          >
            <div class="shrink-0 px-3 py-2 border-b border-line flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-ink">Registros operacionais</span>
                <span class="font-mono text-[11px] text-ink-faint border border-line rounded px-1.5 py-0.5">
                  {{ filteredVacancies.length }} vagas
                </span>
              </div>
              <div class="hidden sm:flex items-center gap-2 text-xs text-ink-faint">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500"></span>
                  {{ occupancy?.occupied ?? 0 }} ocupada{{ occupancy?.occupied === 1 ? "" : "s" }}
                </span>
                <span>·</span>
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-500"></span>
                  {{ occupancy?.available ?? 0 }} livres
                </span>
              </div>
            </div>

            <UTable
              :data="filteredVacancies"
              :columns="columns"
              :loading="loading"
              sticky="header"
              class="h-full lg:overflow-y-auto"
              :ui="{ thead: 'bg-surface-2', tr: 'data-[selectable=true]:hover:bg-surface-2' }"
            >
              <template #id-cell="{ row }">
                <span
                  class="inline-flex items-center justify-center w-7 h-6 rounded bg-surface-2 border border-line text-ink text-xs font-bold font-mono"
                >
                  {{ String(row.original.id).padStart(2, "0") }}
                </span>
              </template>

              <template #status-cell="{ row }">
                <span
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-semibold"
                  :class="
                    row.original.status == 0
                      ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="row.original.status == 0 ? 'bg-green-600 dark:bg-green-500' : 'bg-red-600 dark:bg-red-500'"
                  ></span>
                  {{ row.original.status == 0 ? "Livre" : "Ocupado" }}
                </span>
              </template>

              <template #vehicle-cell="{ row }">
                <span
                  v-if="row.original.vehicle?.plate"
                  class="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-2 border border-line text-ink tracking-wider"
                >
                  {{ row.original.vehicle.plate.toUpperCase() }}
                </span>
                <span v-else class="text-ink-faint">—</span>
              </template>

              <template #customer-cell="{ row }">
                <span
                  :class="{
                    'text-ink-faint': !row.original.vehicle?.clients?.length,
                  }"
                >
                  {{
                    row.original.vehicle?.clients?.length > 0
                      ? row.original.vehicle.clients[0]?.name
                      : "—"
                  }}
                </span>
              </template>

              <template #arrival-cell="{ row }">
                <div v-if="row.original.activeVacancyLog?.entryTime">
                  <span class="font-mono text-xs text-ink">
                    {{
                      new Date(row.original.activeVacancyLog.entryTime).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }}
                  </span>
                  <span class="text-amber-600 dark:text-amber-500 text-xs font-mono ml-1">
                    · {{ formatDwell(row.original.activeVacancyLog.entryTime) }}
                  </span>
                </div>
                <span v-else class="text-ink-faint">—</span>
              </template>

              <template #tariff-cell="{ row }">
                <span v-if="row.original.activeVacancyLog?.entryTime" class="font-mono text-ink">
                  {{ formattedRevenueValue(liveTariff(row.original.activeVacancyLog.entryTime)) }}
                </span>
                <span v-else class="text-ink-faint">—</span>
              </template>

              <template #actions-cell="{ row }">
                <div class="flex items-center justify-end gap-1.5">
                  <UButton
                    v-if="row.original.status === 1"
                    size="xs"
                    color="error"
                    variant="outline"
                    icon="i-tabler-logout"
                    class="rounded"
                    @click="updateVacancy(row.original)"
                  >
                    Liberar
                  </UButton>
                  <UButton
                    v-else
                    size="xs"
                    color="neutral"
                    variant="outline"
                    icon="i-tabler-plus"
                    class="rounded"
                    @click="openCheckin(row.original.id)"
                  >
                    Ocupar
                  </UButton>
                </div>
              </template>

              <template #empty>
                <div class="flex flex-col items-center gap-2 text-ink-muted py-4">
                  <Icon name="tabler:car-off" size="1.75rem" class="text-ink-faint" />
                  Nenhuma vaga encontrada.
                </div>
              </template>
            </UTable>

            <div class="shrink-0 px-3 py-2 border-t border-line flex items-center justify-between text-xs text-ink-faint">
              <span class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-500"></span>
                Atualizado automaticamente a cada 25s
              </span>
              <span class="font-mono">{{ filteredVacancies.length }} de {{ vacancies.length }} vagas monitoradas</span>
            </div>
          </div>
        </section>

        <section class="flex flex-col lg:min-h-0 lg:min-w-0">
          <div
            class="lg:max-h-full lg:overflow-y-auto bg-surface border border-line rounded flex flex-col"
          >
            <div class="shrink-0 px-3 py-2.5 border-b border-line flex items-center justify-between">
              <span class="text-sm font-semibold text-ink">Mapa de vagas</span>
              <div class="flex items-center gap-3 text-xs font-medium text-ink-muted">
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-500"></span>
                  Livre
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500"></span>
                  Ocupada
                </span>
              </div>
            </div>

            <div class="p-3">
              <div
                v-if="!loading && filteredVacancies.length"
                class="grid gap-2"
                style="grid-template-columns: repeat(auto-fill, minmax(84px, 1fr))"
              >
                <button
                  v-for="v in filteredVacancies"
                  :key="v.id"
                  type="button"
                  class="relative rounded border flex flex-col justify-between min-h-[68px] p-2 transition-all duration-200 text-left"
                  :class="
                    v.status === 1
                      ? 'bg-red-500/5 border-red-500/30 border-l-2 border-l-red-600 dark:border-l-red-500 cursor-pointer'
                      : 'bg-surface border-line hover:border-green-600/60 dark:hover:border-green-500/60 cursor-pointer'
                  "
                  @click="v.status === 1 ? updateVacancy(v) : openCheckin(v.id)"
                >
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-mono text-xs font-bold text-ink truncate">V-{{ String(v.id).padStart(2, "0") }}</span>
                    <span
                      class="w-1.5 h-1.5 rounded-full shrink-0"
                      :class="v.status === 1 ? 'bg-red-600 dark:bg-red-500' : 'bg-green-600 dark:bg-green-500'"
                      :title="v.status === 1 ? 'Ocupado' : 'Livre'"
                    ></span>
                  </div>

                  <div v-if="v.status === 1 && v.vehicle?.plate" class="my-0.5 min-w-0">
                    <p class="font-mono text-[11px] font-bold text-ink tracking-wider truncate">{{ v.vehicle.plate.toUpperCase() }}</p>
                    <p v-if="v.activeVacancyLog?.entryTime" class="text-[10px] text-amber-600 dark:text-amber-500 font-mono mt-0.5 truncate">
                      {{ formatDwell(v.activeVacancyLog.entryTime) }}
                    </p>
                  </div>
                  <div v-else class="my-auto flex items-center justify-center py-1">
                    <Icon name="tabler:plus" size="0.85rem" class="text-ink-faint" />
                  </div>
                </button>
              </div>

              <div
                v-else-if="!loading"
                class="flex flex-col items-center gap-2 text-ink-muted py-8"
              >
                <Icon name="tabler:car-off" size="1.75rem" class="text-ink-faint" />
                Nenhuma vaga encontrada.
              </div>

              <div v-else class="flex justify-center py-8">
                <SharedTSpinner size="6" border="2" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <UModal v-model:open="infoDialog" :ui="{ content: 'max-w-2xl w-full rounded' }">
      <template #body>
        <DashboardCheckModal
          :info-props="currentVacancy"
          :target-vacancy-id="targetVacancyId"
          @update="
            infoDialog = false;
            getVacanciesLogs();
          "
        />
      </template>
    </UModal>

    <UButton
      class="lg:hidden fixed bottom-5 right-5 rounded-full"
      color="primary"
      size="xl"
      icon="i-tabler-plus"
      @click="openCheckin()"
    />
  </div>
</template>

<script setup>
import { useDebounceFn } from "@vueuse/core";

const HOURLY_RATE = 7;

const http = useApi();
const organizationId = useCurrentOrganizationId();

const loading = ref(false);
const infoDialog = ref(false);
const targetVacancyId = ref(null);
const now = ref(new Date());

const columns = [
  { accessorKey: "id", header: "Vaga" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "vehicle", header: "Veículo" },
  { id: "customer", header: "Cliente" },
  { id: "arrival", header: "Entrada" },
  { id: "tariff", header: "Tarifa" },
  { id: "actions", header: "" },
];

const vacancies = ref([]);
const occupancy = ref({});
const todayStats = ref(null);
const currentVacancy = ref(null);
const search = ref("");
const statusFilter = ref("all");
const typeFilter = ref("all");

const statusFilters = computed(() => [
  { value: "all", label: "Todas", count: vacancies.value.length },
  { value: "available", label: "Disponíveis", count: occupancy.value?.available ?? 0 },
  { value: "occupied", label: "Ocupadas", count: occupancy.value?.occupied ?? 0 },
]);

const vehicleTypeOptions = [
  { label: "Todos os tipos", value: "all" },
  { label: "Carro", value: 0 },
  { label: "Moto", value: 1 },
  { label: "Caminhão", value: 2 },
  { label: "Ônibus", value: 3 },
  { label: "Bicicleta", value: 4 },
];

const formattedToday = computed(() =>
  now.value.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
);

const formattedClock = computed(() =>
  now.value.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
);

const filteredVacancies = computed(() => {
  let list = vacancies.value;

  if (statusFilter.value === "available") list = list.filter((v) => v.status === 0);
  if (statusFilter.value === "occupied") list = list.filter((v) => v.status === 1);

  if (typeFilter.value !== "all") {
    list = list.filter((v) => v.vehicle?.type === typeFilter.value);
  }

  return list;
});

const formattedRevenueValue = (value) =>
  (value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formattedRevenue = computed(() => formattedRevenueValue(todayStats.value?.totalRevenue));

const dwellMinutes = (entryTime) => {
  if (!entryTime) return 0;
  return Math.max(0, (now.value - new Date(entryTime)) / 1000 / 60);
};

const formatDwell = (entryTime) => {
  const minutes = dwellMinutes(entryTime);
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${String(hours).padStart(2, "0")}h${String(mins).padStart(2, "0")}m`;
};

const liveTariff = (entryTime) => (dwellMinutes(entryTime) / 60) * HOURLY_RATE;

const debouncedSearch = useDebounceFn(() => {
  getVacanciesLogs();
}, 550);

const getVacanciesLogs = async (silent = false) => {
  try {
    if (!silent) loading.value = true;

    const { data, error } = await http.get(
      `/vacancy/dash/${organizationId.value}`,
      { params: { plate: search.value } }
    );

    if (error.value) {
      console.error("Error fetching vacancies logs:", error.value);
      loading.value = false;
      return;
    }

    vacancies.value = data.value.content.vacancies;
    occupancy.value = data.value.content.occupancy;

    loading.value = false;
  } catch (error) {
    console.error("Error fetching vacancies logs:", error);
    loading.value = false;
  }
};

const getTodayStats = async () => {
  const { data, error } = await http.get(`/metric/average-daily-stay/${organizationId.value}`);
  if (!error.value) todayStats.value = data.value.content;
};

const openCheckin = (vacancyId = null) => {
  currentVacancy.value = null;
  targetVacancyId.value = vacancyId;
  infoDialog.value = true;
};

const updateVacancy = (row) => {
  targetVacancyId.value = null;
  currentVacancy.value = row;
  currentVacancy.value.observation = row.activeVacancyLog?.observation || "";
  infoDialog.value = true;
};

watch(
  () => infoDialog.value,
  (newValue) => {
    if (!newValue) {
      currentVacancy.value = null;
      targetVacancyId.value = null;
    }
  }
);

let clockInterval;
let pollInterval;

onMounted(() => {
  clockInterval = setInterval(() => {
    now.value = new Date();
  }, 1000);

  pollInterval = setInterval(() => {
    getVacanciesLogs(true);
    getTodayStats();
  }, 25000);
});

onUnmounted(() => {
  clearInterval(clockInterval);
  clearInterval(pollInterval);
});

getVacanciesLogs();
getTodayStats();
</script>

<style scoped lang="postcss"></style>
