<template>
  <div class="min-h-full p-4 md:p-6 overflow-y-auto">
    <div class="max-w-[1400px] mx-auto flex flex-col gap-4 md:gap-5 pb-10">
      <div>
        <h1 class="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">
          Métricas
        </h1>
        <p class="text-ink-muted mt-1">
          Ocupação, receita e permanência da sua organização.
        </p>
      </div>

      <section>
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

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <div class="bg-surface border border-line rounded-2xl p-4 md:p-5 shadow-sm">
          <h2 class="text-sm font-semibold text-ink-muted mb-1">
            Utilização por dia da semana
          </h2>
          <p class="text-xs text-ink-faint mb-4">Check-ins nos últimos 30 dias</p>
          <ClientOnly>
            <apexchart
              type="bar"
              height="260"
              :options="utilizationOptions"
              :series="utilizationSeries"
            />
            <template #fallback>
              <div class="h-[260px] flex items-center justify-center">
                <SharedTSpinner size="6" border="2" />
              </div>
            </template>
          </ClientOnly>
        </div>

        <div class="bg-surface border border-line rounded-2xl p-4 md:p-5 shadow-sm">
          <h2 class="text-sm font-semibold text-ink-muted mb-1">
            Tendência de receita
          </h2>
          <p class="text-xs text-ink-faint mb-4">Últimos 7 dias</p>
          <ClientOnly>
            <apexchart
              type="area"
              height="260"
              :options="revenueOptions"
              :series="revenueSeries"
            />
            <template #fallback>
              <div class="h-[260px] flex items-center justify-center">
                <SharedTSpinner size="6" border="2" />
              </div>
            </template>
          </ClientOnly>
        </div>
      </section>

      <section>
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3"
        >
          <div>
            <h2 class="text-lg font-semibold text-ink">Registros</h2>
            <p class="text-sm text-ink-muted">
              {{ filteredLogs.length }} de {{ logs.length }} check-ins
            </p>
          </div>

          <UInput
            v-model="search"
            icon="i-tabler-search"
            placeholder="Pesquisar por placa"
            class="w-full sm:w-[240px]"
          />
        </div>

        <div class="bg-surface border border-line rounded-2xl shadow-sm overflow-hidden">
          <UTable
            :data="filteredLogs"
            :columns="columns"
            :loading="loading"
            :ui="{ thead: 'bg-slate-50 dark:bg-slate-800/60' }"
          >
            <template #vacancyId-cell="{ row }">
              <span
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-ink text-xs font-bold"
              >
                {{ row.original.vacancyId }}
              </span>
            </template>

            <template #vehicle-cell="{ row }">
              <div class="flex items-center gap-2">
                <UBadge color="neutral" variant="subtle" class="font-mono">
                  {{ row.original.vehicle?.plate?.toUpperCase() }}
                </UBadge>
                <span class="text-ink-faint text-xs">
                  {{ vehicleType[row.original.vehicle?.type] }}
                </span>
              </div>
            </template>

            <template #collaborator-cell="{ row }">
              <span :class="{ 'text-ink-faint': !row.original.collaborator?.name }">
                {{ row.original.collaborator?.name || "—" }}
              </span>
            </template>

            <template #entryTime-cell="{ row }">
              <span :class="{ 'text-ink-faint': !row.original.entryTime }">
                {{ formatDateTime(row.original.entryTime) }}
              </span>
            </template>

            <template #exitTime-cell="{ row }">
              <UBadge v-if="row.original.exitTime" color="success" variant="subtle">
                {{ formatDateTime(row.original.exitTime) }}
              </UBadge>
              <UBadge v-else color="warning" variant="subtle">Em andamento</UBadge>
            </template>

            <template #empty>
              <div class="flex flex-col items-center gap-2 text-ink-muted py-8">
                <Icon name="tabler:chart-bar-off" size="1.75rem" class="text-ink-faint" />
                Nenhum registro encontrado.
              </div>
            </template>
          </UTable>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const http = useApi();
const toast = useToast();
const colorMode = useColorMode();

const logs = ref([]);
const loading = ref(false);
const search = ref("");
const dailyStay = ref(null);
const utilizationVacancy = ref([]);
const revenueTrend = ref([]);

const vehicleType = {
  0: "Carro",
  1: "Moto",
  2: "Caminhão",
  3: "Ônibus",
  4: "Bicicleta",
};

const columns = [
  { accessorKey: "vacancyId", header: "Vaga" },
  { id: "vehicle", header: "Veículo" },
  { id: "collaborator", header: "Colaborador" },
  { accessorKey: "entryTime", header: "Check-in" },
  { accessorKey: "exitTime", header: "Check-out" },
];

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const filteredLogs = computed(() => {
  if (!search.value) return logs.value;
  const term = search.value.toLowerCase();
  return logs.value.filter((log) =>
    log.vehicle?.plate?.toLowerCase().includes(term)
  );
});

const formattedRevenue = (value) =>
  (value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const stats = computed(() => [
  {
    label: "Taxa de ocupação",
    value: `${Math.round(dailyStay.value?.occupancyRate || 0)}%`,
    icon: "iconoir:car",
    badgeClass: "bg-gradient-to-br from-violet-500 to-violet-600 shadow-sm shadow-violet-500/30",
  },
  {
    label: "Receita hoje",
    value: formattedRevenue(dailyStay.value?.totalRevenue),
    icon: "tabler:coin",
    badgeClass: "bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm shadow-amber-500/30",
  },
  {
    label: "Permanência média",
    value: dailyStay.value?.averageStay || "0h",
    icon: "tabler:clock-hour-4",
    badgeClass: "bg-gradient-to-br from-teal-500 to-teal-600 shadow-sm shadow-teal-500/30",
  },
  {
    label: "Check-ins hoje",
    value: dailyStay.value?.totalLogs ?? 0,
    icon: "tabler:list-check",
    badgeClass: "bg-gradient-to-br from-slate-500 to-slate-600 shadow-sm shadow-slate-500/30",
  },
]);

const isDark = computed(() => colorMode.value === "dark");
const chartForeColor = computed(() => (isDark.value ? "#94a3b8" : "#5c748a"));
const chartGridColor = computed(() => (isDark.value ? "#2a3344" : "#e5e9ef"));

const baseChartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    fontFamily: "Geist, sans-serif",
    foreColor: chartForeColor.value,
  },
  grid: {
    borderColor: chartGridColor.value,
    strokeDashArray: 4,
  },
  dataLabels: { enabled: false },
  tooltip: { theme: isDark.value ? "dark" : "light" },
}));

const utilizationOptions = computed(() => ({
  ...baseChartOptions.value,
  colors: ["#8b5cf6"],
  plotOptions: {
    bar: { borderRadius: 6, columnWidth: "45%" },
  },
  xaxis: {
    categories: utilizationVacancy.value.map((e) => e.weekday),
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { labels: { formatter: (v) => Math.round(v) } },
}));

const utilizationSeries = computed(() => [
  {
    name: "Check-ins",
    data: utilizationVacancy.value.map((e) => Number(e.count)),
  },
]);

const revenueOptions = computed(() => ({
  ...baseChartOptions.value,
  colors: ["#14b8a6"],
  stroke: { curve: "smooth", width: 3 },
  fill: {
    type: "gradient",
    gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02 },
  },
  xaxis: {
    categories: revenueTrend.value.map((e) => e.label),
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      formatter: (v) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }),
    },
  },
  tooltip: {
    ...baseChartOptions.value.tooltip,
    y: { formatter: (v) => formattedRevenue(v) },
  },
}));

const revenueSeries = computed(() => [
  {
    name: "Receita",
    data: revenueTrend.value.map((e) => e.revenue),
  },
]);

const getUtilizationGraph = async () => {
  const { data, error } = await http.get("/metric/vacancy-usage-graph/1");

  if (error.value) {
    console.error("Error fetching utilization graph:", error.value);
    toast.error({
      title: "Falha",
      message: "Não foi possível buscar o gráfico de utilização.",
    });
    return;
  }

  utilizationVacancy.value = data.value.content;
};

const getRevenueTrend = async () => {
  const { data, error } = await http.get("/metric/revenue-trend/1");

  if (error.value) {
    console.error("Error fetching revenue trend:", error.value);
    toast.error({
      title: "Falha",
      message: "Não foi possível buscar a tendência de receita.",
    });
    return;
  }

  revenueTrend.value = data.value.content;
};

const getDailyAverageStay = async () => {
  const { data, error } = await http.get("/metric/average-daily-stay/1");

  if (error.value) {
    console.error("Error fetching daily average stay:", error.value);
    toast.error({
      title: "Falha",
      message: "Não foi possível buscar a média de permanência diária.",
    });
    return;
  }

  dailyStay.value = data.value.content;
};

const getLogsFromOrganization = async () => {
  loading.value = true;

  const { data, error } = await http.get("/parking-log/1");

  if (error.value) {
    console.error("Error fetching organization logs:", error.value);
    loading.value = false;
    return;
  }

  logs.value = data.value.content;
  loading.value = false;
};

Promise.all([
  getLogsFromOrganization(),
  getDailyAverageStay(),
  getUtilizationGraph(),
  getRevenueTrend(),
]).catch((error) => {
  console.error("Error fetching initial data:", error);
});
</script>

<style scoped lang="postcss"></style>
