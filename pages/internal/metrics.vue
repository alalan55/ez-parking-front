<template>
  <div class="min-h-full p-4 md:p-6 overflow-y-auto">
    <div class="max-w-[1400px] mx-auto flex flex-col gap-4 md:gap-5 pb-10">
      <LayoutPageHeader
        title="Métricas"
        subtitle="Acompanhe ocupação, receita e comportamento do estacionamento."
      >
        <template #actions>
          <div class="flex items-center gap-1 bg-surface-2 border border-line rounded p-0.5">
            <UButton
              v-for="option in periodOptions"
              :key="option.value"
              size="sm"
              color="neutral"
              :variant="period === option.value ? 'solid' : 'ghost'"
              class="rounded"
              @click="period = option.value"
            >
              {{ option.label }}
            </UButton>
          </div>
          <UButton
            icon="i-tabler-download"
            color="neutral"
            variant="outline"
            class="rounded"
            @click="exportCsv"
          >
            <span class="hidden sm:inline">Exportar CSV</span>
          </UButton>
        </template>
      </LayoutPageHeader>

      <section>
        <div
          class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-line bg-surface border border-line rounded overflow-hidden"
        >
          <div class="p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between gap-2">
              <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Ocupação média</p>
              <SharedTrendBadge :value="periodSummary?.occupancy?.changePct" />
            </div>
            <div class="flex items-baseline gap-2 mt-1">
              <p class="text-2xl font-semibold text-ink">
                {{ periodSummary?.occupancy?.current !== null && periodSummary?.occupancy?.current !== undefined ? Math.round(periodSummary.occupancy.current) + "%" : "—" }}
              </p>
              <span class="text-xs text-ink-muted">/ cap. {{ dailyStay?.capacity ?? "—" }} vagas</span>
            </div>
            <div class="h-1 mt-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full rounded-full bg-green-600 dark:bg-green-500 transition-all duration-300"
                :style="{ width: `${Math.round(periodSummary?.occupancy?.current || 0)}%` }"
              ></div>
            </div>
          </div>

          <div class="p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between gap-2">
              <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Receita acumulada</p>
              <SharedTrendBadge :value="periodSummary?.revenue?.changePct" />
            </div>
            <p class="text-2xl font-semibold text-ink mt-1">{{ formattedRevenue(periodSummary?.revenue?.current) }}</p>
            <p class="text-xs text-ink-muted mt-2">{{ periodLabelLong }}</p>
          </div>

          <div class="p-4 flex flex-col justify-between">
            <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Permanência média</p>
            <p class="text-2xl font-semibold text-ink mt-1">{{ dailyStay?.averageStay || "0h" }}</p>
            <p class="text-xs text-ink-muted mt-2">
              <span v-if="dailyStay?.maxStay">Pico: {{ dailyStay.maxStay }}</span>
              <span v-if="dailyStay?.maxStay && dailyStay?.minStay"> · </span>
              <span v-if="dailyStay?.minStay">Mín: {{ dailyStay.minStay }}</span>
              <span v-if="!dailyStay?.maxStay && !dailyStay?.minStay">Sem check-ins concluídos no período</span>
            </p>
          </div>

          <div class="p-4 flex flex-col justify-between">
            <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Total de check-ins</p>
            <p class="text-2xl font-semibold text-ink mt-1">{{ totalLogsPeriod }}</p>
            <p class="text-xs mt-2">
              <span class="text-green-700 dark:text-green-500 font-medium">{{ dailyStay?.totalLogs ?? 0 }} finalizados</span>
              <span class="text-ink-faint"> · </span>
              <span class="text-amber-600 dark:text-amber-500 font-medium">{{ dailyStay?.openLogs ?? 0 }} em aberto</span>
            </p>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <div class="bg-surface border border-line rounded p-4 md:p-5">
          <div class="flex items-start justify-between mb-1">
            <div>
              <h2 class="text-sm font-semibold text-ink">Taxa de ocupação</h2>
              <p class="text-xs text-ink-muted">Ocupação média ao longo do período (%)</p>
            </div>
          </div>
          <ClientOnly>
            <apexchart
              v-if="hasOccupancySamples"
              type="line"
              height="240"
              :options="occupancyOptions"
              :series="occupancySeries"
            />
            <div v-else class="h-[240px] flex flex-col items-center justify-center gap-1.5 text-ink-muted text-sm">
              <Icon name="tabler:chart-line" size="1.5rem" class="text-ink-faint" />
              Ainda sem histórico de ocupação neste período.
            </div>
            <template #fallback>
              <div class="h-[240px] flex items-center justify-center">
                <SharedTSpinner size="6" border="2" />
              </div>
            </template>
          </ClientOnly>
        </div>

        <div class="bg-surface border border-line rounded p-4 md:p-5">
          <h2 class="text-sm font-semibold text-ink mb-0.5">Receita</h2>
          <p class="text-xs text-ink-muted mb-4">Receita acumulada no período (R$)</p>
          <ClientOnly>
            <apexchart
              type="area"
              height="240"
              :options="revenueOptions"
              :series="revenueSeries"
            />
            <template #fallback>
              <div class="h-[240px] flex items-center justify-center">
                <SharedTSpinner size="6" border="2" />
              </div>
            </template>
          </ClientOnly>
        </div>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <div class="bg-surface border border-line rounded p-4 md:p-5">
          <h2 class="text-sm font-semibold text-ink mb-0.5">
            Check-ins por dia da semana
          </h2>
          <p class="text-xs text-ink-muted mb-4">Distribuição volumétrica no período</p>
          <ClientOnly>
            <apexchart
              type="bar"
              height="240"
              :options="utilizationOptions"
              :series="utilizationSeries"
            />
            <template #fallback>
              <div class="h-[240px] flex items-center justify-center">
                <SharedTSpinner size="6" border="2" />
              </div>
            </template>
          </ClientOnly>
        </div>

        <div class="bg-surface border border-line rounded p-4 md:p-5">
          <h2 class="text-sm font-semibold text-ink mb-0.5">
            Horários de maior movimento
          </h2>
          <p class="text-xs text-ink-muted mb-4">Picos de entrada ao longo do dia</p>
          <ClientOnly>
            <apexchart
              v-if="hasHourlyCheckins"
              type="area"
              height="240"
              :options="hourlyOptions"
              :series="hourlySeries"
            />
            <div v-else class="h-[240px] flex flex-col items-center justify-center gap-1.5 text-ink-muted text-sm">
              <Icon name="tabler:chart-line" size="1.5rem" class="text-ink-faint" />
              Nenhum check-in no período.
            </div>
            <template #fallback>
              <div class="h-[240px] flex items-center justify-center">
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
            <h2 class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Registros operacionais</h2>
            <p class="text-sm text-ink-muted mt-0.5">
              {{ filteredLogs.length }} de {{ logs.length }} check-ins
            </p>
          </div>

          <UInput
            v-model="search"
            icon="i-tabler-search"
            placeholder="Pesquisar por placa"
            class="w-full sm:w-[240px]"
            :ui="{ base: 'rounded' }"
          />
        </div>

        <div class="bg-surface border border-line rounded overflow-hidden">
          <UTable
            :data="filteredLogs"
            :columns="columns"
            :loading="loading"
            :ui="{ thead: 'bg-surface-2' }"
          >
            <template #vacancyId-cell="{ row }">
              <span
                class="inline-flex items-center justify-center w-7 h-6 rounded bg-surface-2 border border-line text-ink text-xs font-bold font-mono"
              >
                {{ String(row.original.vacancyId).padStart(2, "0") }}
              </span>
            </template>

            <template #vehicle-cell="{ row }">
              <div class="flex items-center gap-2">
                <span class="text-ink font-medium">{{ row.original.vehicle?.mark || vehicleType[row.original.vehicle?.type] || "—" }}</span>
                <span class="font-mono text-xs px-1.5 py-0.5 rounded bg-surface-2 border border-line text-ink-muted tracking-wider">
                  {{ row.original.vehicle?.plate?.toUpperCase() }}
                </span>
              </div>
            </template>

            <template #collaborator-cell="{ row }">
              <span :class="{ 'text-ink-faint': !row.original.collaborator?.name }">
                {{ row.original.collaborator?.name || "—" }}
              </span>
            </template>

            <template #entryTime-cell="{ row }">
              <span class="font-mono text-xs" :class="{ 'text-ink-faint': !row.original.entryTime }">
                {{ formatDateTime(row.original.entryTime) }}
              </span>
            </template>

            <template #exitTime-cell="{ row }">
              <span
                v-if="row.original.exitTime"
                class="font-mono text-xs text-ink"
              >
                {{ formatDateTime(row.original.exitTime) }}
              </span>
              <span v-else class="font-mono text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Em aberto
              </span>
            </template>

            <template #tariff-cell="{ row }">
              <span class="font-mono text-ink">
                {{ formattedRevenue(logTariff(row.original)) }}
              </span>
            </template>

            <template #status-cell="{ row }">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold uppercase"
                :class="
                  row.original.exitTime
                    ? 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-500'
                "
              >
                {{ row.original.exitTime ? "Finalizado" : "Em aberto" }}
              </span>
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
const organizationId = useCurrentOrganizationId();

const tariffRates = ref({});
const logs = ref([]);
const loading = ref(false);
const search = ref("");
const dailyStay = ref(null);
const periodSummary = ref(null);
const utilizationVacancy = ref([]);
const revenueTrend = ref([]);
const occupancyTrend = ref([]);
const hourlyCheckins = ref([]);
const now = ref(new Date());
const period = ref(7);

const periodOptions = [
  { value: 1, label: "Hoje" },
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
];

const periodLabelLong = computed(() =>
  period.value === 1 ? "Hoje" : `Últimos ${period.value} dias`
);

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
  { id: "tariff", header: "Tarifa" },
  { id: "status", header: "Status" },
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

const totalLogsPeriod = computed(
  () => (dailyStay.value?.totalLogs ?? 0) + (dailyStay.value?.openLogs ?? 0)
);

const hasOccupancySamples = computed(() =>
  occupancyTrend.value.some((e) => e.samples > 0)
);

const hasHourlyCheckins = computed(() =>
  hourlyCheckins.value.some((e) => e.count > 0)
);

const formattedRevenue = (value) =>
  (value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const logTariff = (log) => {
  if (!log.entryTime) return 0;
  const rate = tariffRates.value[log.vehicle?.type] ?? 0;
  const entry = new Date(log.entryTime);
  const end = log.exitTime ? new Date(log.exitTime) : now.value;
  const minutes = Math.max(0, (end - entry) / 1000 / 60);
  return (minutes / 60) * rate;
};

const isDark = computed(() => colorMode.value === "dark");
const chartForeColor = computed(() => "#64748b");
const chartGridColor = computed(() => (isDark.value ? "#1e293b" : "#e2e8f0"));

// ApexCharts token config, per the Ez-parking Chart System spec: no toolbar,
// no zoom, smooth 2px strokes, near-flat area fills, monospace axis labels,
// dashed horizontal grid only (no vertical "cage" lines).
const baseChartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "Inter, sans-serif",
    foreColor: chartForeColor.value,
    animations: { enabled: true, easing: "easeinout", speed: 400 },
  },
  grid: {
    borderColor: chartGridColor.value,
    strokeDashArray: 3,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  markers: { size: 0, hover: { size: 4 } },
  dataLabels: { enabled: false },
  xaxis: {
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: chartForeColor.value, fontSize: "11px" } },
  },
  yaxis: {
    labels: { style: { colors: chartForeColor.value, fontSize: "11px", fontFamily: "JetBrains Mono, monospace" } },
  },
  tooltip: {
    theme: isDark.value ? "dark" : "light",
    style: { fontSize: "12px", fontFamily: "Inter" },
  },
}));

const occupancyOptions = computed(() => ({
  ...baseChartOptions.value,
  colors: [isDark.value ? "#3fb950" : "#15803d"],
  stroke: { curve: "smooth", width: 2 },
  fill: { type: "solid", opacity: 0.08 },
  xaxis: {
    ...baseChartOptions.value.xaxis,
    categories: occupancyTrend.value.map((e) => e.label),
  },
  yaxis: {
    min: 0,
    max: 100,
    labels: { ...baseChartOptions.value.yaxis.labels, formatter: (v) => `${Math.round(v)}%` },
  },
  tooltip: {
    ...baseChartOptions.value.tooltip,
    y: {
      formatter: (v, opts) => {
        const point = occupancyTrend.value[opts.dataPointIndex];
        return point?.samples ? `${v}%` : "Sem dados";
      },
    },
  },
}));

const occupancySeries = computed(() => [
  {
    name: "Ocupação",
    data: occupancyTrend.value.map((e) => e.occupancyRate ?? 0),
  },
]);

const utilizationOptions = computed(() => {
  // Counts are small integers — let ApexCharts' default nice-scale pick
  // fractional ticks (0, 0.2, 0.4...) when the max is tiny. Force one tick
  // per unit instead so the axis never shows a fraction of a check-in.
  const maxCount = Math.max(1, ...utilizationVacancy.value.map((e) => Number(e.count) || 0));

  return {
    ...baseChartOptions.value,
    colors: [isDark.value ? "#3fb950" : "#15803d"],
    plotOptions: {
      bar: { borderRadius: 2, columnWidth: "45%" },
    },
    xaxis: {
      ...baseChartOptions.value.xaxis,
      categories: utilizationVacancy.value.map((e) => e.weekday),
    },
    yaxis: {
      min: 0,
      max: maxCount,
      tickAmount: Math.min(maxCount, 5),
      forceNiceScale: false,
      labels: { ...baseChartOptions.value.yaxis.labels, formatter: (v) => Math.round(v) },
    },
  };
});

const utilizationSeries = computed(() => [
  {
    name: "Check-ins",
    data: utilizationVacancy.value.map((e) => Number(e.count)),
  },
]);

const hourlyOptions = computed(() => {
  const maxCount = Math.max(1, ...hourlyCheckins.value.map((e) => e.count || 0));

  return {
    ...baseChartOptions.value,
    colors: [isDark.value ? "#fabc45" : "#d97706"],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "solid", opacity: 0.1 },
    xaxis: {
      ...baseChartOptions.value.xaxis,
      categories: hourlyCheckins.value.map((e) => e.label),
      tickAmount: 8,
    },
    yaxis: {
      min: 0,
      max: maxCount,
      tickAmount: Math.min(maxCount, 5),
      forceNiceScale: false,
      labels: { ...baseChartOptions.value.yaxis.labels, formatter: (v) => Math.round(v) },
    },
  };
});

const hourlySeries = computed(() => [
  {
    name: "Check-ins",
    data: hourlyCheckins.value.map((e) => e.count),
  },
]);

const revenueOptions = computed(() => {
  // Same nice-scale issue as the utilization chart: with all-zero revenue
  // (no completed logs yet), ApexCharts invents an arbitrary max and shows
  // meaningless fractional ticks (0.5, 1.5, ...). Pin a clean 0–10 scale
  // whenever there's no real revenue to chart yet.
  const maxRevenue = Math.max(...revenueTrend.value.map((e) => e.revenue || 0), 0);
  const flat = maxRevenue === 0;

  return {
    ...baseChartOptions.value,
    colors: [isDark.value ? "#3fb950" : "#15803d"],
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "solid",
      opacity: 0.1,
    },
    xaxis: {
      ...baseChartOptions.value.xaxis,
      categories: revenueTrend.value.map((e) => e.label),
    },
    yaxis: {
      min: 0,
      ...(flat ? { max: 10, tickAmount: 2 } : {}),
      labels: {
        ...baseChartOptions.value.yaxis.labels,
        formatter: (v) =>
          v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }),
      },
    },
    tooltip: {
      ...baseChartOptions.value.tooltip,
      y: { formatter: (v) => formattedRevenue(v) },
    },
  };
});

const revenueSeries = computed(() => [
  {
    name: "Receita",
    data: revenueTrend.value.map((e) => e.revenue),
  },
]);

const getUtilizationGraph = async () => {
  const { data, error } = await http.get(`/metric/vacancy-usage-graph/${organizationId.value}`, {
    params: { days: period.value },
  });

  if (error.value) {
    console.error("Error fetching utilization graph:", error.value);
    toast.error({ title: "Falha", message: "Não foi possível buscar o gráfico de utilização." });
    return;
  }

  utilizationVacancy.value = data.value.content;
};

const getRevenueTrend = async () => {
  const { data, error } = await http.get(`/metric/revenue-trend/${organizationId.value}`, {
    params: { days: period.value },
  });

  if (error.value) {
    console.error("Error fetching revenue trend:", error.value);
    toast.error({ title: "Falha", message: "Não foi possível buscar a tendência de receita." });
    return;
  }

  revenueTrend.value = data.value.content;
};

const getOccupancyTrend = async () => {
  const { data, error } = await http.get(`/metric/occupancy-trend/${organizationId.value}`, {
    params: { days: period.value },
  });

  if (error.value) {
    console.error("Error fetching occupancy trend:", error.value);
    return;
  }

  occupancyTrend.value = data.value.content;
};

const getCheckinsByHour = async () => {
  const { data, error } = await http.get(`/metric/checkins-by-hour/${organizationId.value}`, {
    params: { days: period.value },
  });

  if (error.value) {
    console.error("Error fetching check-ins by hour:", error.value);
    return;
  }

  hourlyCheckins.value = data.value.content;
};

const getPeriodSummary = async () => {
  const { data, error } = await http.get(`/metric/period-summary/${organizationId.value}`, {
    params: { days: period.value },
  });

  if (error.value) {
    console.error("Error fetching period summary:", error.value);
    return;
  }

  periodSummary.value = data.value.content;
};

const getDailyAverageStay = async () => {
  const { data, error } = await http.get(`/metric/average-daily-stay/${organizationId.value}`, {
    params: { days: period.value },
  });

  if (error.value) {
    console.error("Error fetching daily average stay:", error.value);
    toast.error({ title: "Falha", message: "Não foi possível buscar a média de permanência." });
    return;
  }

  dailyStay.value = data.value.content;
};

const getTariffRates = async () => {
  const { data, error } = await http.get(`/tariff/${organizationId.value}`);
  if (error.value) return;

  tariffRates.value = Object.fromEntries(
    data.value.content.map((rate) => [rate.vehicleType, rate.hourlyRate])
  );
};

const getLogsFromOrganization = async () => {
  loading.value = true;

  const { data, error } = await http.get(`/parking-log/${organizationId.value}`);

  if (error.value) {
    console.error("Error fetching organization logs:", error.value);
    loading.value = false;
    return;
  }

  logs.value = data.value.content;
  loading.value = false;
};

const csvEscape = (value) => {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const exportCsv = () => {
  const header = ["Vaga", "Veículo", "Placa", "Colaborador", "Check-in", "Check-out", "Tarifa", "Status"];
  const rows = filteredLogs.value.map((log) => [
    log.vacancyId,
    log.vehicle?.mark || vehicleType[log.vehicle?.type] || "",
    log.vehicle?.plate?.toUpperCase() || "",
    log.collaborator?.name || "",
    formatDateTime(log.entryTime),
    log.exitTime ? formatDateTime(log.exitTime) : "Em aberto",
    formattedRevenue(logTariff(log)),
    log.exitTime ? "Finalizado" : "Em aberto",
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ez-parking-registros-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success({ title: "Sucesso", message: "CSV exportado com sucesso." });
};

const refreshPeriodData = () => {
  Promise.all([
    getDailyAverageStay(),
    getUtilizationGraph(),
    getRevenueTrend(),
    getOccupancyTrend(),
    getCheckinsByHour(),
    getPeriodSummary(),
  ]).catch((error) => {
    console.error("Error refreshing period data:", error);
  });
};

watch(period, refreshPeriodData);

let tickInterval;

onMounted(() => {
  tickInterval = setInterval(() => {
    now.value = new Date();
  }, 30000);
});

onUnmounted(() => {
  clearInterval(tickInterval);
});

getTariffRates();
getLogsFromOrganization();
refreshPeriodData();
</script>

<style scoped lang="postcss"></style>
