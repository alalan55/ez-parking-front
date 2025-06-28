<template>
  <div class="h-full p-4">
    <div class="content max-w-[1100px] mx-auto mt-10">
      <h1 class="text-3xl font-bold">Dashboard</h1>

      <section class="grid sm:grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div
          class="border border-[#e3e3e3] rounded-lg p-4 hover:shadow-md cursor-pointer transition-all transform animate-fade-in duration-200"
        >
          <p class="text-sm">Ocupação</p>
          <span class="font-bold text-lg">
            {{ occupancy?.occupiedPercentage || 0 }}%
          </span>
        </div>

        <div
          class="border border-[#e3e3e3] rounded-lg p-4 hover:shadow-md cursor-pointer transition-all transform animate-fade-in duration-200"
        >
          <p class="text-sm">Espaços disponíveis</p>
          <span class="font-bold text-lg">{{ occupancy?.available || 0 }}</span>
        </div>

        <div
          class="border border-[#e3e3e3] rounded-lg p-4 hover:shadow-md cursor-pointer transition-all transform animate-fade-in duration-200"
        >
          <p class="text-sm">Receita total</p>
          <span class="font-bold text-lg">R$ 12,500</span>
        </div>
      </section>

      <div class="mt-8">
        <div class="flex items-center gap-3 max-w-[395px]">
          <SharedTInput
            v-model="search"
            placeholder="Pesquisar por placa"
            @input="debouncedSearch"
          />

          <Icon name="tabler:search" size="1.5rem" class="text-[#5c748a]" />
        </div>
      </div>

      <section class="mt-8">
        <SharedTTable
          :columns="columnsTable"
          :rows="vacancies"
          :loading="loading"
        >
          <template #cell-vacancy="{ row }"> # {{ row?.id }} </template>

          <template #cell-status="{ row }">
            <div
              class="rounded-lg px-2 py-1 flex items-center justify-center"
              :class="{
                'bg-[#d4f0c1]': row?.status == 0,
                'bg-[#f8d7da]': row?.status == 1,
              }"
            >
              <span class="font-bold text-sm text-[#0d151c]">
                {{ row?.status == 0 ? "Disponível" : "Ocupado" }}
              </span>
            </div>
          </template>

          <template #cell-vehicle="{ row }">
            {{ row?.Vehicle?.plate?.toUpperCase() }}
          </template>

          <template #cell-customer="{ row }">
            {{
              row?.Vehicle?.Clients.length > 0
                ? row?.Vehicle?.Clients[0]?.name
                : "N/A"
            }}
          </template>

          <template #cell-arrival="{ row }">
            {{
              row?.activeVacancyLog?.createdAt
                ? new Date(row?.activeVacancyLog?.createdAt).toLocaleTimeString(
                    "pt-BR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "N/A"
            }}
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center justify-center">
              <Icon
                name="tabler:pencil"
                size="1.3rem"
                class="cursor-pointer"
                @click="updateVacancy(row)"
              />
            </div>
          </template>
        </SharedTTable>
      </section>

      <SharedTModal
        v-model="infoDialog"
        :show-close-button="false"
        width="max-w-4xl"
      >
        <DashboardCheckModal :info-props="currentVacancy" />
      </SharedTModal>

      <button
        class="rounded-full fixed bottom-4 right-4 md:bottom-14 md:right-14 flex items-center justify-center p-3 bg-[#000] text-white shadow-lg hover:bg-[#2e2e2e] transition-colors duration-200 cursor-pointer"
        @click="infoDialog = true"
      >
        <Icon
          name="tabler:plus"
          size="1.5rem"
          class="bg-[#fff] text-white rounded-full p-3 shadow-lg transition-colors duration-200"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { useDebounceFn } from "@vueuse/core";

const http = useApi();

const loading = ref(false);
const infoDialog = ref(false);

const columnsTable = [
  {
    key: "vacancy",
    label: "Vaga",
    thClass: "w-20",
    tdClass: "text-[#0d151c]",
  },
  { key: "status", label: "Status", thClass: "w-40", tdClass: "" },
  {
    key: "vehicle",
    label: "Veículo",
    thClass: "w-30",
    tdClass: "text-[#49749c]",
  },
  {
    key: "customer",
    label: "Cliente",
    thClass: "w-30",
    tdClass: "text-[#49749c]",
  },
  {
    key: "arrival",
    label: "Entrada",
    thClass: "w-40",
    tdClass: "text-[#49749c]",
  },
  // {
  //   key: "departure",
  //   label: "Partida",
  //   thClass: "w-40",
  //   tdClass: "text-[#49749c]",
  // },
  {
    key: "actions",
    label: "Actions",
    thClass: "w-20",
    tdClass: "text-[#49749c]",
  },
];

const vacancies = ref([]);
const occupancy = ref({});
const currentVacancy = ref(null);
const search = ref("");

const debouncedSearch = useDebounceFn(() => {
  getVacanciesLogs();
}, 500);

const getVacanciesLogs = async () => {
  try {
    loading.value = true;

    const { data } = await http.get("/dash/vacancies-by-organization/1", {
      params: { plate: search.value },
    });

    vacancies.value = data.value.content.vacancies;
    occupancy.value = data.value.content.occupancy;

    loading.value = false;
  } catch (error) {
    console.error("Error fetching vacancies logs:", error);
    loading.value = false;
  }
};

const updateVacancy = (row) => {
  console.log("Update vacancy:", row);
  // Implement the logic to update the vacancy
  currentVacancy.value = row;
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
