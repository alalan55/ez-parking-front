<template>
  <div class="h-full p-4">
    <div class="content max-w-[1100px] mx-auto mt-10">
      <h1 class="text-3xl font-bold">Dashboard</h1>

      <section class="grid sm:grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div class="border border-[#e3e3e3] rounded-lg p-4">
          <p class="text-sm">Ocupação</p>
          <span class="font-bold text-lg">75%</span>
        </div>

        <div class="border border-[#e3e3e3] rounded-lg p-4">
          <p class="text-sm">Espaços disponíveis</p>
          <span class="font-bold text-lg">25</span>
        </div>

        <div class="border border-[#e3e3e3] rounded-lg p-4">
          <p class="text-sm">Receita total</p>
          <span class="font-bold text-lg">R$ 12,500</span>
        </div>
      </section>

      <section class="mt-8">
        <SharedTTable
          :columns="columnsTable"
          :rows="logsList"
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
            {{ row?.Vehicle?.plate }}
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
    </div>
  </div>
</template>

<script setup>
const loading = ref(false);

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

const logsList = ref([]);

const getVacanciesLogs = async () => {
  try {
    loading.value = true;
    // const req = await fetch("http://localhost:8080/parking-log/vacancies/1");
    const req = await fetch("http://localhost:8080/vacancy/dash/1");

    const res = await req.json();

    logsList.value = res.content;

    loading.value = false;
  } catch (error) {
    console.error("Error fetching vacancies logs:", error);
    loading.value = false;
  }
};

const updateVacancy = (row) => {
  console.log("Update vacancy:", row);
  // Implement the logic to update the vacancy
};

getVacanciesLogs();
</script>

<style scoped lang="postcss"></style>
