<template>
  <div class="h-full p-4">
    <div class="content max-w-[1100px] mx-auto mt-10">
      <h1 class="text-3xl font-bold">Clientes</h1>
      <span class="text-[#4A739C]">
        Gerencie as informações dos seus clientes.
      </span>

      <div class="mt-8">
        <div class="flex items-center gap-3">
          <SharedTInput
            v-model="search"
            placeholder="Buscar clientes"
            @input="debouncedSearch"
          />

          <Icon name="tabler:search" size="1.5rem" class="text-[#5c748a]" />
        </div>
      </div>

      <section class="mt-8">
        <SharedTTable
          :columns="columnsTable"
          :rows="clients"
          :loading="loading"
        >
          <template #cell-createdAt="{ row }">
            {{ new Date(row.createdAt).toLocaleDateString("pt-BR") }}
          </template>

          <template #cell-name="{ row }">
            <span class="font-semibold">{{ row.name }}</span>
          </template>

          <template #cell-actions="{ row }">
            <div class="flex items-center gap-4">
              <Icon
                name="tabler:pencil"
                size="1.3rem"
                class="cursor-pointer"
                @click="updateClient(row)"
              />

              <Icon
                name="tabler:trash"
                size="1.3rem"
                class="cursor-pointer"
                @click="removeClient(row)"
              />
            </div>
          </template>
        </SharedTTable>
      </section>

      <SharedTModal
        v-model="confirmRemoveVehicleDialog"
        :show-close-button="false"
        :title="'Remover veículo'"
        width="max-w-lg"
      >
        <div>
          <span
            >Você tem certeza que deseja remover o veículo:
            <strong>"{{ vehicleToRemove?.plate || "" }}"</strong></span
          >

          <div
            class="m-[2rem_auto_0] max-w-[300px] flex items-center gap-4 justify-end"
          >
            <SharedTButton
              variant="outlined"
              title="Cancelar"
              @click="
                confirmRemoveVehicleDialog = false;
                vehicleToRemove = null;
              "
            />
            <SharedTButton
              :loading="confirmRemoveVehicleLoading"
              :disabled="confirmRemoveVehicleLoading"
              variant="primary"
              title="Remover"
              @click="confirmRemoveVehicle()"
            />
          </div>
        </div>
      </SharedTModal>

      <SharedTModal
        v-model="handleClientDialog"
        :show-close-button="false"
        :title="isEditing ? 'Atualizar cliente' : 'Adicionar cliente'"
        width="max-w-4xl"
      >
        <div>
          <div class="header flex gap-4 mb-4 mt-4">
            <span
              class="text-sm"
              :class="{ 'active-view': currentModalView === 0 }"
              @click="currentModalView = 0"
            >
              Cliente
            </span>
            <span
              class="text-sm"
              :class="{ 'active-view': currentModalView === 1 }"
              @click="currentModalView = 1"
            >
              Veículos do cliente
            </span>
          </div>

          <section v-show="currentModalView === 0">
            <div class="mt-5">
              <form @submit.prevent>
                <section class="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      class="block text-xs font-medium text-[#5c748a] mb-1"
                    >
                      Nome
                    </label>
                    <SharedTInput
                      v-model="client.name"
                      placeholder="Nome"
                      type="text"
                    />
                  </div>

                  <div>
                    <label
                      class="block text-xs font-medium text-[#5c748a] mb-1"
                    >
                      Telefone
                    </label>
                    <SharedTInput
                      v-model="client.phone"
                      mask="(##) # ####-####"
                      placeholder="Telefone"
                      type="text"
                    />
                  </div>
                </section>

                <div
                  class="m-[2rem_auto_0] max-w-[300px] flex items-center gap-4 justify-end"
                >
                  <SharedTButton
                    variant="outlined"
                    title="Cancelar"
                    @click="handleClientDialog = false"
                  />
                  <SharedTButton
                    :loading="loadingAddClient"
                    variant="primary"
                    :title="isEditing ? 'Atualizar' : 'Adicionar'"
                    @click="isEditing ? confirmUpdateClient() : createClient()"
                  />
                </div>
              </form>
            </div>
          </section>

          <section v-show="currentModalView === 1">
            <div class="mt-5">
              <div
                v-show="!isAddingVehicle && !isUpdatingVehicle"
                class="vehicle-list"
              >
                <div
                  class="grid sm:grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[300px]"
                >
                  <div
                    v-for="(vehicle, index) in clientVehicles"
                    :key="index"
                    class="p-4 bg-[#f0f4f8] rounded-lg shadow-sm"
                  >
                    <div
                      class="flex items-center justify-between sm:gap-2 md:gap-4"
                    >
                      <div>
                        <p class="font-semibold mb-2">
                          {{ vehicle?.plate?.toUpperCase() }}
                        </p>
                        <div class="grid sm:grid-cols-1 md:grid-cols-5 gap-4">
                          <p class="text-xs">{{ vehicle.mark }}</p>
                          <p class="text-xs">{{ vehicle.model }}</p>
                          <p class="text-xs">{{ vehicle.year }}</p>
                          <p class="text-xs">{{ vehicle.color }}</p>
                          <p class="text-xs">{{ vehicleType[vehicle.type] }}</p>
                        </div>
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <Icon
                            name="tabler:pencil"
                            size="1.1rem"
                            class="cursor-pointer"
                            @click="setVehicleToUpdate(vehicle)"
                          />

                          <Icon
                            name="tabler:trash"
                            size="1.1rem"
                            class="cursor-pointer"
                            @click="setVehicleToRemove(vehicle)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="!clientVehicles.length"
                  class="h-[100px] flex items-center justify-center"
                >
                  <p class="text-sm text-[#5c748a]">
                    Nenhum veículo cadastrado para este cliente.
                  </p>
                </div>
              </div>

              <div v-show="isAddingVehicle || isUpdatingVehicle">
                <form @submit.prevent>
                  <section class="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        class="block text-xs font-medium text-[#5c748a] mb-1"
                      >
                        Placa
                      </label>
                      <SharedTInput
                        v-model="newVehicle.plate"
                        placeholder="Placa"
                        type="text"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-xs font-medium text-[#5c748a] mb-1"
                      >
                        Marca
                      </label>
                      <SharedTInput
                        v-model="newVehicle.mark"
                        placeholder="Marca"
                        type="text"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-xs font-medium text-[#5c748a] mb-1"
                      >
                        Modelo
                      </label>
                      <SharedTInput
                        v-model="newVehicle.model"
                        placeholder="Modelo"
                        type="text"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-xs font-medium text-[#5c748a] mb-1"
                      >
                        Ano
                      </label>
                      <SharedTInput
                        v-model="newVehicle.year"
                        placeholder="Ano"
                        type="number"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-xs font-medium text-[#5c748a] mb-1"
                      >
                        Cor
                      </label>
                      <SharedTInput
                        v-model="newVehicle.color"
                        placeholder="Cor"
                        type="text"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-xs font-medium text-[#5c748a] mb-1"
                      >
                        Tipo
                      </label>

                      <SharedTSelect
                        v-model="newVehicle.type"
                        :options="vehicleTypesOptions"
                        placeholder="Selecione o tipo"
                      />
                    </div>
                  </section>
                </form>
              </div>

              <div
                class="m-[2rem_auto_0] max-w-[300px] flex items-center gap-4 justify-end"
              >
                <SharedTButton
                  variant="outlined"
                  title="Cancelar"
                  @click="handleClientDialog = false"
                />
                <SharedTButton
                  :loading="loadingAddVehicle"
                  variant="primary"
                  :title="
                    isAddingVehicle
                      ? 'Adicionar'
                      : isUpdatingVehicle
                      ? 'Atualizar'
                      : 'Novo veículo'
                  "
                  @click="
                    isAddingVehicle
                      ? addNewVehicle()
                      : isUpdatingVehicle
                      ? updateVehicle()
                      : (isAddingVehicle = true)
                  "
                />
              </div>
            </div>
          </section>
        </div>
      </SharedTModal>

      <SharedTRemoveDataCard
        v-model="removeDialog"
        :show-close-button="false"
        :loading="loadingRemove"
        title="Remover cliente"
        description="Tem certeza que deseja remover este cliente? Esta ação não pode ser  desfeita."
        width="max-w-lg"
        @confirm="confirmRemoveClient"
      />

      <button
        class="rounded-full fixed bottom-4 right-4 md:bottom-14 md:right-14 flex items-center justify-center p-3 bg-[#000] text-white shadow-lg hover:bg-[#2e2e2e] transition-colors duration-200 cursor-pointer"
        @click="handleClientDialog = true"
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
const toast = useToast();

const loading = ref(false);
const loadingRemove = ref(false);
const handleClientDialog = ref(false);
const loadingAddClient = ref(false);
const loadingAddVehicle = ref(false);
const isEditing = ref(false);

const confirmRemoveVehicleDialog = ref(false);
const confirmRemoveVehicleLoading = ref(false);
const vehicleToRemove = ref(null);

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
const isUpdatingVehicle = ref(false);

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
    key: "name",
    label: "Nome",
    thClass: "w-50",
    tdClass: "text-[#0d151c]",
  },
  { key: "phone", label: "Telefone", thClass: "w-40", tdClass: "" },
  {
    key: "createdAt",
    label: "Registrado em",
    thClass: "w-30",
    tdClass: "text-[#49749c]",
  },

  {
    key: "actions",
    label: "Actions",
    thClass: "w-20",
    tdClass: "text-[#49749c]",
  },
];

const debouncedSearch = useDebounceFn(() => {
  getClients();
}, 550);

// vehicles
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

const setVehicleToRemove = (vehicle) => {
  vehicleToRemove.value = vehicle;
  confirmRemoveVehicleDialog.value = true;
};

const setVehicleToUpdate = (vehicle) => {
  newVehicle.value = {
    ...vehicle,
  };

  isUpdatingVehicle.value = true;
};

const confirmRemoveVehicle = async () => {
  confirmRemoveVehicleLoading.value = true;

  const { error } = await http.post(`/client/remove-vehicle`, {
    userId: currentClient.value.id,
    vehicleId: vehicleToRemove.value.id,
  });

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao remover veículo.",
    });
    confirmRemoveVehicleLoading.value = false;
    return;
  }

  confirmRemoveVehicleDialog.value = false;

  toast.success({
    title: "Sucesso",
    message: "Veículo removido com sucesso.",
  });

  clientVehicles.value = clientVehicles.value.filter(
    (v) => v.id !== vehicleToRemove.value.id
  );

  confirmRemoveVehicleLoading.value = false;
  vehicleToRemove.value = null;
};

const resetAddVehicle = () => {
  isAddingVehicle.value = false;
  isUpdatingVehicle.value = false;
  newVehicle.value = {
    plate: "",
    mark: "",
    model: "",
    year: "",
    color: "",
    type: 0,
  };
};

const updateVehicle = async () => {
  loadingAddVehicle.value = true;

  const { error } = await http.put(`/vehicle/${newVehicle.value.id}`, {
    ...newVehicle.value,
    userId: currentClient.value.id,
  });

  if (error.value) {
    toast.error({
      title: "Erro",
      message: error.value.message || "Erro ao atualizar veículo.",
    });

    loadingAddVehicle.value = false;
    console.error("Error on update vehicle:", error.value);
    return;
  }

  toast.success({
    title: "Sucesso",
    message: "Veículo atualizado com sucesso.",
  });

  const index = clientVehicles.value.findIndex(
    (v) => v.id === newVehicle.value.id
  );

  if (index !== -1) clientVehicles.value[index] = { ...newVehicle.value };

  loadingAddVehicle.value = false;

  resetAddVehicle();
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

// clients
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

const resetClientModal = () => {
  isEditing.value = false;
  currentModalView.value = 0;
  client.value = { name: "", phone: "" };
  currentClient.value = null;
  clientVehicles.value = [];
  isAddingVehicle.value = false;
  isUpdatingVehicle.value = false;
  loadingAddClient.value = false;
  loadingAddVehicle.value = false;
  resetAddVehicle();
};

watch(handleClientDialog, (newValue) => {
  if (!newValue) resetClientModal();
});

watch(
  () => currentModalView.value,
  (nv) => {
    if (nv === 1) resetAddVehicle();
  }
);

getClients();
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
