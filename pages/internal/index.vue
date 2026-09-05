<template>
  <div class="min-h-full lg:h-full lg:overflow-hidden flex flex-col p-4 md:p-6">
    <div class="w-full max-w-[1400px] mx-auto flex flex-col flex-1 lg:min-h-0 gap-4 md:gap-5">
      <div class="shrink-0 flex items-end justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-ink-muted">{{ greeting }}</p>
          <h1 class="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight mt-0.5">
            Vagas
          </h1>
        </div>
        <p class="text-sm text-ink-faint capitalize hidden sm:block">{{ formattedToday }}</p>
      </div>

      <section class="shrink-0">
        <div
          class="flex flex-wrap items-stretch bg-surface border border-line rounded-2xl divide-x divide-line shadow-sm overflow-hidden"
        >
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="flex items-center gap-3 px-4 sm:px-5 py-3.5 flex-1 min-w-[45%] sm:min-w-[160px]"
          >
            <span
              class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white"
              :class="stat.badgeClass"
            >
              <Icon :name="stat.icon" size="1.15rem" />
            </span>
            <div class="min-w-0">
              <p class="text-xs text-ink-muted font-medium truncate">{{ stat.label }}</p>
              <p class="text-lg font-bold text-ink leading-tight truncate">
                {{ stat.value }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div class="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-line rounded-full p-1">
          <UButton
            v-for="filter in statusFilters"
            :key="filter.value"
            size="sm"
            color="neutral"
            :variant="statusFilter === filter.value ? 'solid' : 'ghost'"
            class="rounded-full flex-1 justify-center"
            @click="statusFilter = filter.value"
          >
            {{ filter.label }}
          </UButton>
        </div>

        <UInput
          v-model="search"
          icon="i-tabler-search"
          placeholder="Pesquisar por placa"
          class="w-full sm:w-[220px]"
          @input="debouncedSearch"
        />
      </div>

      <div
        class="flex-1 lg:min-h-0 pb-20 lg:pb-0 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 md:gap-5"
      >
        <section class="flex flex-col lg:min-h-0">
          <h2 class="shrink-0 text-sm font-semibold text-ink-muted mb-2">
            Registros
            <span class="text-ink-faint font-normal">({{ filteredVacancies.length }})</span>
          </h2>

          <div
            class="h-full bg-surface border border-line rounded-2xl shadow-sm lg:overflow-hidden"
          >
            <UTable
              :data="filteredVacancies"
              :columns="columns"
              :loading="loading"
              sticky="header"
              class="h-full lg:overflow-y-auto"
              :ui="{ thead: 'bg-slate-50 dark:bg-slate-800/60' }"
            >
              <template #id-cell="{ row }">
                <span
                  class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-ink text-xs font-bold"
                >
                  {{ row.original.id }}
                </span>
              </template>

              <template #status-cell="{ row }">
                <UBadge
                  :color="row.original.status == 0 ? 'success' : 'error'"
                  variant="subtle"
                  class="gap-1.5"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="row.original.status == 0 ? 'bg-emerald-500' : 'bg-rose-500'"
                  ></span>
                  {{ row.original.status == 0 ? "Disponível" : "Ocupado" }}
                </UBadge>
              </template>

              <template #vehicle-cell="{ row }">
                <UBadge
                  v-if="row.original.vehicle?.plate"
                  color="neutral"
                  variant="subtle"
                  class="font-mono"
                >
                  {{ row.original.vehicle.plate.toUpperCase() }}
                </UBadge>
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
                <span
                  :class="{
                    'text-ink-faint': !row.original.activeVacancyLog?.entryTime,
                  }"
                >
                  {{
                    row.original.activeVacancyLog?.entryTime
                      ? new Date(
                          row.original.activeVacancyLog.entryTime
                        ).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"
                  }}
                </span>
              </template>

              <template #actions-cell="{ row }">
                <div v-show="row.original.status === 1" class="flex items-center justify-center">
                  <UButton
                    icon="i-tabler-pencil"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    square
                    @click="updateVacancy(row.original)"
                  />
                </div>
              </template>

              <template #empty>
                <div class="flex flex-col items-center gap-2 text-ink-muted py-4">
                  <Icon name="tabler:car-off" size="1.75rem" class="text-ink-faint" />
                  Nenhuma vaga encontrada.
                </div>
              </template>
            </UTable>
          </div>
        </section>

        <section class="flex flex-col lg:min-h-0">
          <div class="shrink-0 flex items-center justify-between mb-2">
            <h2 class="text-sm font-semibold text-ink-muted">Mapa de vagas</h2>
            <div class="flex items-center gap-3 text-xs font-medium text-ink-muted">
              <span class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Livre
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                Ocupada
              </span>
            </div>
          </div>

          <div
            class="lg:max-h-full lg:overflow-y-auto bg-surface border border-line rounded-2xl p-4 shadow-sm"
          >
            <div
              v-if="!loading && filteredVacancies.length"
              class="grid grid-cols-4 xs:grid-cols-5 gap-2.5"
            >
              <button
                v-for="v in filteredVacancies"
                :key="v.id"
                type="button"
                class="relative aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 p-1.5 transition-all duration-200"
                :class="
                  v.status === 1
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 shadow-sm shadow-rose-500/10 hover:shadow-md hover:shadow-rose-500/15 hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-surface border-line hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm cursor-default'
                "
                @click="v.status === 1 && updateVacancy(v)"
              >
                <span
                  class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  :class="v.status === 1 ? 'bg-rose-500' : 'bg-emerald-500'"
                ></span>
                <span
                  class="text-sm font-bold"
                  :class="v.status === 1 ? 'text-rose-700 dark:text-rose-300' : 'text-ink'"
                >
                  {{ v.id }}
                </span>
                <span
                  v-if="v.status === 1 && v.vehicle?.plate"
                  class="font-mono text-[9px] font-semibold text-rose-600 dark:text-rose-400 truncate max-w-full"
                >
                  {{ v.vehicle.plate.toUpperCase() }}
                </span>
                <span v-else-if="v.status !== 1" class="text-[9px] text-ink-faint">
                  Livre
                </span>
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
        </section>
      </div>
    </div>

    <UModal v-model:open="infoDialog" :ui="{ content: 'max-w-2xl w-full' }">
      <template #body>
        <DashboardCheckModal
          :info-props="currentVacancy"
          @update="
            infoDialog = false;
            getVacanciesLogs();
          "
        />
      </template>
    </UModal>

    <UButton
      class="fixed bottom-5 right-5 md:bottom-10 md:right-10 rounded-full shadow-lg shadow-slate-900/15"
      color="neutral"
      size="xl"
      icon="i-tabler-plus"
      @click="infoDialog = true"
    >
      <span class="hidden sm:inline">Novo check-in</span>
    </UButton>
  </div>
</template>

<script setup>
import { useDebounceFn } from "@vueuse/core";

const http = useApi();

const loading = ref(false);
const infoDialog = ref(false);

const columns = [
  { accessorKey: "id", header: "Vaga" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "vehicle", header: "Veículo" },
  { id: "customer", header: "Cliente" },
  { id: "arrival", header: "Entrada" },
  { id: "actions", header: "Ações" },
];

const vacancies = ref([]);
const occupancy = ref({});
const currentVacancy = ref(null);
const search = ref("");
const statusFilter = ref("all");

const statusFilters = [
  { value: "all", label: "Todas" },
  { value: "available", label: "Disponíveis" },
  { value: "occupied", label: "Ocupadas" },
];

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
});

const formattedToday = computed(() =>
  new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
);

const filteredVacancies = computed(() => {
  if (statusFilter.value === "available")
    return vacancies.value.filter((v) => v.status === 0);
  if (statusFilter.value === "occupied")
    return vacancies.value.filter((v) => v.status === 1);
  return vacancies.value;
});

const formattedRevenue = computed(() =>
  (12500).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
);

const stats = computed(() => [
  {
    label: "Ocupação",
    value: `${Math.round(occupancy.value?.occupiedPercentage || 0)}%`,
    icon: "iconoir:car",
    badgeClass: "bg-gradient-to-br from-violet-500 to-violet-600 shadow-sm shadow-violet-500/30",
  },
  {
    label: "Disponíveis",
    value: occupancy.value?.available ?? 0,
    icon: "mdi:garage-open",
    badgeClass: "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/30",
  },
  {
    label: "Total de vagas",
    value: occupancy.value?.organizationVacancies ?? 0,
    icon: "tabler:layout-grid",
    badgeClass: "bg-gradient-to-br from-slate-500 to-slate-600 shadow-sm shadow-slate-500/30",
  },
  {
    label: "Receita total",
    value: formattedRevenue.value,
    icon: "tabler:coin",
    badgeClass: "bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm shadow-amber-500/30",
  },
]);

const debouncedSearch = useDebounceFn(() => {
  getVacanciesLogs();
}, 550);

const getVacanciesLogs = async () => {
  try {
    loading.value = true;

    const { data, error } = await http.get(
      "/dash/vacancies-by-organization/1",
      {
        params: { plate: search.value },
      }
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

const updateVacancy = (row) => {
  if (row.status === 0) currentVacancy.value = null;
  else {
    currentVacancy.value = row;
    currentVacancy.value.observation = row.activeVacancyLog?.observation || "";
  }

  infoDialog.value = true;
};

watch(
  () => infoDialog.value,
  (newValue) => {
    if (!newValue) {
      currentVacancy.value = null;
    }
  }
);

getVacanciesLogs();
</script>

<style scoped lang="postcss"></style>
