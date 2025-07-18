<script setup>
const http = useApi();
const toast = useToast();

const utilizationChart = ref(null);
const revenueTrendChart = ref(null);

const logs = ref([]);

const loading = ref(false);
const handleClientDialog = ref(false);
const isEditing = ref(false);

const currentModalView = ref(0);

const clients = ref([]);
const search = ref("");

const client = ref({
  name: "",
  phone: "",
});

const dailyStay = ref(null);

const isAddingVehicle = ref(false);

const newVehicle = ref({
  plate: "",
  mark: "",
  model: "",
  year: "",
  color: "",
  type: 0, // Default to Carro
});

const utilizationVacancy = ref([]);

const optionUtilization = computed(() => ({
  title: { text: "Utilização do Espaço (Seg-Sex)" },
  tooltip: {},
  legend: { data: ["Vagas Ocupadas"] },
  xAxis: {
    type: "category",
    data: utilizationVacancy.value.map((e) => e.weekday),
  },
  yAxis: { type: "value", name: "Vagas" },
  series: [
    {
      name: "Vagas Ocupadas",
      type: "bar",
      data: utilizationVacancy.value.map((e) => e.count),
      itemStyle: { color: "#4A739C" },
      barMaxWidth: 40,
    },
  ],
  grid: {
    left: 0,
    right: 0,
    top: 40,
    bottom: 0,
    containLabel: true,
  },
}));

const optionRevenueTrend = ref({
  title: { text: "Tendência de Receita (Seg-Sex)" },
  tooltip: { trigger: "axis" },
  xAxis: {
    type: "category",
    data: ["Seg", "Ter", "Qua", "Qui", "Sex"],
  },
  yAxis: { type: "value", name: "R$" },
  grid: {
    left: 0,
    right: 0,
    top: 40,
    bottom: 0,
    containLabel: true,
  },
  series: [
    {
      name: "Receita",
      type: "line",
      data: [120, 180, 150, 200, 250], // mock: receita por dia
      smooth: true,
      lineStyle: { color: "#4A739C", width: 3 },
      areaStyle: { color: "rgba(74,115,156,0.15)" },
      symbol: "circle",
      symbolSize: 10,
    },
  ],
});

const vehicleType = {
  0: "Carro",
  1: "Moto",
  2: "Caminhão",
  3: "Ônibus",
  4: "Bicicleta",
};

const columnsTable = [
  {
    key: "id",
    label: "ID",
    thClass: "w-10",
    tdClass: "text-[#0d151c]",
  },

  {
    key: "vacancyId",
    label: "Vaga ID",
    thClass: "w-10",
    tdClass: "text-[#0d151c]",
  },
  { key: "collaborator", label: "Colaborador", thClass: "w-30", tdClass: "" },
  {
    key: "vehicle",
    label: "Veículo",
    thClass: "w-30",
    tdClass: "",
  },

  {
    key: "entryTime",
    label: "Check-in",
    thClass: "w-20",
    tdClass: "text-[#49749c]",
  },

  {
    key: "exitTime",
    label: "Check-out",
    thClass: "w-20",
    tdClass: "text-[#49749c]",
  },
];

onMounted(() => {
  const container = document.querySelector(".charts-container");

  if (optionUtilization.value != null) {
    new ResizeObserver(() => utilizationChart.value?.resize()).observe(
      container
    );
  }

  if (optionRevenueTrend.value != null) {
    new ResizeObserver(() => revenueTrendChart.value?.resize()).observe(
      container
    );
  }
});

// FUNCTIONS
const getUtilizationGraph = async () => {
  const { data, error } = await http.get("/metric/vacancy-usage-graph/1");

  if (error.value) {
    console.error("Error fetching utilization graph:", error.value);
    toast.error({
      title: "Falha",
      description: "Não foi possível buscar o gráfico de utilização.",
    });
    return;
  }

  utilizationVacancy.value = data.value.content;
};

const getDailyAverageStay = async () => {
  const { data, error } = await http.get("/metric/average-daily-stay/1");

  if (error.value) {
    console.error("Error fetching daily average stay:", error.value);
    toast.error({
      title: "Falha",
      description: "Não foi possível buscar a média de permanência diária.",
    });
    return;
  }

  dailyStay.value = data.value.content;
};

const getLogsFromOrganization = async () => {
  try {
    const { data } = await http.get("/parking-log/1");

    logs.value = data.value.content;
  } catch (error) {
    console.error("Error fetching organization logs:", error);
  }
};

const getClients = async () => {
  try {
    loading.value = true;

    const { data } = await http.get("/client/get-all-by-organization/1", {
      params: {
        name: search.value,
      },
    });

    clients.value = data.value.content;

    loading.value = false;
  } catch (error) {
    console.error("Error fetching clients logs:", error);
    loading.value = false;
  }
};

const resetAddVehicle = () => {
  isAddingVehicle.value = false;
  newVehicle.value = {
    plate: "",
    mark: "",
    model: "",
    year: "",
    color: "",
    type: 0,
  };
};

const getInitialDatas = () => {
  Promise.all([
    getClients(),
    getLogsFromOrganization(),
    getDailyAverageStay(),
    getUtilizationGraph(),
  ]).catch((error) => {
    console.error("Error fetching initial data:", error);
  });
};

watch(handleClientDialog, (newValue) => {
  if (!newValue) {
    isEditing.value = false;

    currentModalView.value = 0;

    client.value = {
      name: "",
      phone: "",
    };

    resetAddVehicle();
  }
});

watch(
  () => currentModalView.value,
  (nv) => {
    console.log("Current modal view changed:", nv);
    if (nv === 1) resetAddVehicle();
  }
);

getInitialDatas();
</script>

<template>
  <div class="h-full p-4 overflow-y-auto">
    <div class="content max-w-[1100px] mx-auto mt-10">
      <h1 class="text-3xl font-bold">Métricas</h1>
      <span class="text-[#4A739C]">
        Gerencie as métricas da sua organização.
      </span>

      <section class="grid sm:grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div class="bg-[#ebedf2] p-6 flex flex-col rounded-lg">
          <small>Taxa de ocupação</small>
          <strong class="text-2xl">
            {{ dailyStay?.occupancyRate || 0 }}%
          </strong>
        </div>

        <div class="bg-[#ebedf2] p-6 flex flex-col rounded-lg">
          <small>Receita total diária</small>
          <strong class="text-2xl">
            {{
              dailyStay?.totalRevenue
                ? dailyStay.totalRevenue.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "R$ 0,00"
            }}
          </strong>
        </div>

        <div class="bg-[#ebedf2] p-6 flex flex-col rounded-lg">
          <small>Média de permanência diária</small>
          <strong class="text-2xl">{{ dailyStay?.averageStay || "0h" }}</strong>
        </div>
      </section>

      <section class="charts-container mt-8 flex gap-4 flex-wrap">
        <div class="flex-[1_1_300px]">
          <strong>Utilização das vagas</strong>
          <div
            class="h-[300px] mt-4 w-full border border-[#E0E7F1] rounded-xl p-6 flex flex-col w-full"
          >
            <div class="flex flex-col gap-1 mb-4">
              <small> Utilização das vagas </small>
              <strong class="text-3xl">85%</strong>

              <small class="text-[#4A739C]">Últimos 30 dias</small>
            </div>
            <div class="flex-1">
              <VChart ref="utilizationChart" :option="optionUtilization" />
            </div>
          </div>
        </div>

        <div class="flex-[1_1_300px]">
          <strong>Tendência de receita</strong>
          <div
            class="h-[300px] mt-4 w-full border border-[#E0E7F1] rounded-xl p-6 flex flex-col w-full"
          >
            <div class="flex flex-col gap1">
              <small> Tendência de Receita </small>
              <strong class="text-3xl">R$ 1300,00</strong>

              <small class="text-[#4A739C]">Últimos 30 dias</small>
            </div>

            <div class="flex-1">
              <VChart ref="revenueTrendChart" :option="optionRevenueTrend" />
            </div>
          </div>
        </div>
      </section>

      <section class="mt-8">
        <div class="flex items-center gap-3">
          <SharedTInput v-model="search" placeholder="Buscar clientes" />

          <Icon name="tabler:search" size="1.5rem" class="text-[#5c748a]" />
        </div>
      </section>

      <section class="mt-8">
        <SharedTTable :columns="columnsTable" :rows="logs" :loading="loading">
          <template #cell-entryTime="{ row }">
            {{
              row?.entryTime
                ? new Date(row?.entryTime)?.toLocaleDateString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"
            }}
          </template>

          <template #cell-exitTime="{ row }">
            {{
              row.exitTime
                ? new Date(row?.exitTime)?.toLocaleDateString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"
            }}
          </template>

          <template #cell-collaborator="{ row }">
            <span> {{ row.collaborator?.name }}</span>
          </template>

          <template #cell-vehicle="{ row }">
            <span
              >{{ vehicleType[row.vehicle.type] }} -
              {{ row.vehicle.plate?.toUpperCase() }}</span
            >
          </template>
        </SharedTTable>
      </section>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.header {
  span {
    position: relative;
    cursor: pointer;
    &.active-view {
      &::after {
        content: "";
        position: absolute;
        width: 100%;
        height: 2px;
        background-color: #4a739c;
        bottom: -2px;
        left: 0;
      }
    }
  }
}
</style>
