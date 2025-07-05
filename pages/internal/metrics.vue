<template>
  <div class="h-full p-4">
    <div class="content max-w-[1100px] mx-auto mt-10">
      <h1 class="text-3xl font-bold">Métricas</h1>
      <span class="text-[#4A739C]">
        Gerencie as métricas da sua organização.
      </span>

      <div class="mt-8">
        <div class="flex items-center gap-3">
          <SharedTInput
            v-model="search"
            placeholder="Buscar clientes"
          />

          <Icon name="tabler:search" size="1.5rem" class="text-[#5c748a]" />
        </div>
      </div>

      <section class="mt-8">
        <SharedTTable :columns="columnsTable" :rows="logs" :loading="loading">
          <template #cell-createdAt="{ row }">
            {{ new Date(row.createdAt).toLocaleDateString("pt-BR") }}
          </template>

          <template #cell-updatedAt="{ row }">
            {{ new Date(row.updatedAt).toLocaleDateString("pt-BR") }}
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

<script setup>
import { useDebounceFn } from "@vueuse/core";

const http = useApi();
const toast = useToast();

const logs = ref([]);

const loading = ref(false);
const loadingRemove = ref(false);
const handleClientDialog = ref(false);
const loadingAddClient = ref(false);
const loadingAddVehicle = ref(false);
const isEditing = ref(false);

const currentModalView = ref(0);

const removeDialog = ref(false);
const clients = ref([]);
const clientVehicles = ref([]);
const currentClient = ref(null);
const search = ref("");
const client = ref({
  name: "",
  phone: "",
});

const isAddingVehicle = ref(false);

const newVehicle = ref({
  plate: "",
  mark: "",
  model: "",
  year: "",
  color: "",
  type: 0, // Default to Carro
});

const vehicleType = {
  0: "Carro",
  1: "Moto",
  2: "Caminhão",
  3: "Ônibus",
  4: "Bicicleta",
};

const vehicleTypesOptions = [
  { label: "Carro", value: 0 },
  { label: "Moto", value: 1 },
  { label: "Caminhão", value: 2 },
  { label: "Ônibus", value: 3 },
  { label: "Bicicleta", value: 4 },
];

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
    key: "createdAt",
    label: "Check-in",
    thClass: "w-20",
    tdClass: "text-[#49749c]",
  },

  {
    key: "updatedAt",
    label: "Check-out",
    thClass: "w-20",
    tdClass: "text-[#49749c]",
  },
];

const debouncedSearch = useDebounceFn(() => {
  getClients();
}, 550);

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

const updateClient = (row) => {
  currentClient.value = row;
  client.value = row;

  getVehiclesFromClient(row.id);

  isEditing.value = true;
  handleClientDialog.value = true;
};

const removeClient = (row) => {
  currentClient.value = row;
  removeDialog.value = true;
};

const confirmRemoveClient = async () => {
  loadingRemove.value = true;

  const { error } = await http.delete(
    `/client/delete-from-organization/1/${currentClient.value.id}`
  );

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao remover cliente.",
    });
    loadingRemove.value = false;
    return;
  }

  removeDialog.value = false;
  currentClient.value = null;

  toast.success({
    title: "Sucesso",
    message: "Cliente removido com sucesso.",
  });

  loadingRemove.value = false;
  getClients();
};

const createClient = async () => {
  loadingAddClient.value = true;

  const { error } = await http.post("/client", {
    ...client.value,
    organizationId: 1,
  });

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao cadastrar cliente.",
    });
    loadingAddClient.value = false;
    return;
  }

  handleClientDialog.value = false;

  toast.success({
    title: "Sucesso",
    message: "Cliente cadastrado com sucesso.",
  });

  client.value = {
    name: "",
    phone: "",
  };

  getClients();

  loadingAddClient.value = false;
};

const confirmUpdateClient = async () => {
  loadingAddClient.value = true;

  const { error } = await http.put("/client", {
    ...client.value,
  });

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao atualizar cliente.",
    });
    loadingAddClient.value = false;
    return;
  }

  handleClientDialog.value = false;

  toast.success({
    title: "Sucesso",
    message: "Cliente atualizado com sucesso.",
  });

  client.value = {
    name: "",
    phone: "",
  };

  getClients();

  loadingAddClient.value = false;
};

const getVehiclesFromClient = async (clientId) => {
  try {
    loading.value = true;

    const { data, error } = await http.get(
      `/vehicle/get-all-by-client/${clientId}/1`
    );

    if (error.value) {
      toast.error({
        title: "Erro",
        message: error.value.message || "Erro ao buscar veículos do cliente.",
      });
      loading.value = false;
      return;
    }

    clientVehicles.value = data.value.content;

    loading.value = false;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
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

const addNewVehicle = async () => {
  const obj = {
    ...newVehicle.value,
    userId: currentClient.value.id,
    organizationId: 1, // mocado
  };

  loadingAddVehicle.value = true;

  const { data, error } = await http.post("/client/add-vehicle", obj);

  if (error.value) {
    toast.error({
      title: "Erro",
      message: error.value.message || "Erro ao adicionar veículo.",
    });

    loadingAddVehicle.value = false;
    return;
  }

  clientVehicles.value.push({ ...data.value.content.vehicle });

  toast.success({
    title: "Sucesso",
    message: "Veículo adicionado com sucesso.",
  });

  resetAddVehicle();

  loadingAddVehicle.value = false;
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
// watch(
//   () => [handleClientDialog.value, removeDialog.value],
//   (newValue) => {
//     console.log("Dialog state changed:", newValue);
//     if (newValue.some((v) => v === false)) {
//       console.log('entrei')

//       currentClient.value = null;
//       isEditing.value = false;

//       client.value = {
//         name: "",
//         phone: "",
//       };
//     }
//   }
// );

getClients();
getLogsFromOrganization();
</script>

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
