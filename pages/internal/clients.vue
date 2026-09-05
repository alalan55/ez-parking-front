<template>
  <div class="min-h-full p-4 md:p-6 overflow-y-auto">
    <div class="max-w-[1400px] mx-auto flex flex-col gap-4 md:gap-5 pb-24">
      <div>
        <h1 class="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">
          Clientes
        </h1>
        <p class="text-ink-muted mt-1">
          Gerencie os clientes e veículos cadastrados na sua organização.
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

      <section>
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3"
        >
          <div>
            <h2 class="text-lg font-semibold text-ink">Registros</h2>
            <p class="text-sm text-ink-muted">
              {{ clients.length }} cliente{{ clients.length === 1 ? "" : "s" }}
            </p>
          </div>

          <UInput
            v-model="search"
            icon="i-tabler-search"
            placeholder="Pesquisar por nome"
            class="w-full sm:w-[240px]"
            @input="debouncedSearch"
          />
        </div>

        <div class="bg-surface border border-line rounded-2xl shadow-sm overflow-hidden">
          <UTable
            :data="clients"
            :columns="columns"
            :loading="loading"
            :ui="{ thead: 'bg-slate-50 dark:bg-slate-800/60' }"
          >
            <template #name-cell="{ row }">
              <span class="font-semibold text-ink">{{ row.original.name }}</span>
            </template>

            <template #phone-cell="{ row }">
              <span :class="{ 'text-ink-faint': !row.original.phone }">
                {{ row.original.phone || "—" }}
              </span>
            </template>

            <template #vehicles-cell="{ row }">
              <UBadge
                v-if="row.original.vehicles?.length"
                color="neutral"
                variant="subtle"
              >
                {{ row.original.vehicles.length }}
                veículo{{ row.original.vehicles.length === 1 ? "" : "s" }}
              </UBadge>
              <span v-else class="text-ink-faint">—</span>
            </template>

            <template #createdAt-cell="{ row }">
              <span class="text-ink-muted">
                {{ formatDate(row.original.createdAt) }}
              </span>
            </template>

            <template #actions-cell="{ row }">
              <div class="flex items-center justify-end gap-1">
                <UButton
                  icon="i-tabler-pencil"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  square
                  @click="openEditClient(row.original)"
                />
                <UButton
                  icon="i-tabler-trash"
                  color="error"
                  variant="ghost"
                  size="sm"
                  square
                  @click="openRemoveClient(row.original)"
                />
              </div>
            </template>

            <template #empty>
              <div class="flex flex-col items-center gap-2 text-ink-muted py-8">
                <Icon name="tabler:users" size="1.75rem" class="text-ink-faint" />
                Nenhum cliente encontrado.
              </div>
            </template>
          </UTable>
        </div>
      </section>
    </div>

    <UModal v-model:open="clientDialog" :ui="{ content: 'max-w-3xl w-full' }">
      <template #body>
        <section class="space-y-5">
          <div>
            <h2 class="font-display text-xl font-bold text-ink">
              {{ isEditing ? "Atualizar cliente" : "Adicionar cliente" }}
            </h2>
            <p class="text-sm text-ink-muted mt-0.5">
              {{
                isEditing
                  ? "Edite os dados do cliente e gerencie seus veículos."
                  : "Cadastre um novo cliente na sua organização."
              }}
            </p>
          </div>

          <div
            v-if="isEditing"
            class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-line rounded-full p-1 w-fit"
          >
            <UButton
              size="sm"
              color="neutral"
              :variant="modalTab === 0 ? 'solid' : 'ghost'"
              class="rounded-full"
              @click="modalTab = 0"
            >
              Cliente
            </UButton>
            <UButton
              size="sm"
              color="neutral"
              :variant="modalTab === 1 ? 'solid' : 'ghost'"
              class="rounded-full"
              @click="modalTab = 1"
            >
              Veículos
            </UButton>
          </div>

          <section v-show="modalTab === 0" class="space-y-5">
            <div class="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Nome">
                <UInput v-model="client.name" placeholder="Nome do cliente" class="w-full" />
              </UFormField>

              <UFormField label="Telefone">
                <UInput v-model="client.phone" placeholder="(11) 98888-7777" class="w-full" />
              </UFormField>
            </div>

            <div class="flex items-center justify-end gap-2 pt-4 border-t border-line">
              <UButton color="neutral" variant="ghost" label="Cancelar" @click="clientDialog = false" />
              <UButton
                color="neutral"
                :loading="loadingClient"
                :label="isEditing ? 'Atualizar' : 'Adicionar'"
                @click="isEditing ? updateClient() : createClient()"
              />
            </div>
          </section>

          <section v-show="modalTab === 1" class="space-y-4">
            <div v-show="!isAddingVehicle && !isUpdatingVehicle">
              <div
                v-if="clientVehicles.length"
                class="grid sm:grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1"
              >
                <div
                  v-for="vehicle in clientVehicles"
                  :key="vehicle.id"
                  class="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-line rounded-xl"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="font-mono font-bold text-ink">
                        {{ vehicle.plate?.toUpperCase() }}
                      </p>
                      <p class="text-xs text-ink-muted mt-1">
                        {{ [vehicle.mark, vehicle.model, vehicle.year, vehicle.color].filter(Boolean).join(" · ") }}
                      </p>
                      <UBadge color="neutral" variant="subtle" class="mt-2">
                        {{ vehicleType[vehicle.type] }}
                      </UBadge>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <UButton
                        icon="i-tabler-pencil"
                        color="neutral"
                        variant="ghost"
                        size="xs"
                        square
                        @click="setVehicleToUpdate(vehicle)"
                      />
                      <UButton
                        icon="i-tabler-trash"
                        color="error"
                        variant="ghost"
                        size="xs"
                        square
                        @click="setVehicleToRemove(vehicle)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="h-[120px] flex flex-col items-center justify-center gap-1.5 text-ink-muted"
              >
                <Icon name="tabler:car-off" size="1.5rem" class="text-ink-faint" />
                Nenhum veículo cadastrado para este cliente.
              </div>

              <div class="flex items-center justify-end gap-2 pt-4 border-t border-line mt-4">
                <UButton color="neutral" variant="ghost" label="Fechar" @click="clientDialog = false" />
                <UButton color="neutral" icon="i-tabler-plus" label="Novo veículo" @click="isAddingVehicle = true" />
              </div>
            </div>

            <div v-show="isAddingVehicle || isUpdatingVehicle" class="space-y-5">
              <div class="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Placa">
                  <UInput v-model="newVehicle.plate" placeholder="ABC1D23" class="w-full" />
                </UFormField>
                <UFormField label="Marca">
                  <UInput v-model="newVehicle.mark" placeholder="Marca" class="w-full" />
                </UFormField>
                <UFormField label="Modelo">
                  <UInput v-model="newVehicle.model" placeholder="Modelo" class="w-full" />
                </UFormField>
                <UFormField label="Ano">
                  <UInput v-model="newVehicle.year" type="number" placeholder="Ano" class="w-full" />
                </UFormField>
                <UFormField label="Cor">
                  <UInput v-model="newVehicle.color" placeholder="Cor" class="w-full" />
                </UFormField>
                <UFormField label="Tipo">
                  <USelect
                    v-model="newVehicle.type"
                    :items="vehicleTypesOptions"
                    placeholder="Selecione o tipo"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <div class="flex items-center justify-end gap-2 pt-4 border-t border-line">
                <UButton color="neutral" variant="ghost" label="Cancelar" @click="resetAddVehicle" />
                <UButton
                  color="neutral"
                  :loading="loadingVehicle"
                  :label="isUpdatingVehicle ? 'Atualizar' : 'Adicionar'"
                  @click="isUpdatingVehicle ? updateVehicle() : addNewVehicle()"
                />
              </div>
            </div>
          </section>
        </section>
      </template>
    </UModal>

    <UModal v-model:open="removeClientDialog" :ui="{ content: 'max-w-md w-full' }">
      <template #body>
        <section class="space-y-4">
          <div>
            <h2 class="font-display text-lg font-bold text-ink">Remover cliente</h2>
            <p class="text-sm text-ink-muted mt-1">
              Tem certeza que deseja remover
              <strong class="text-ink">{{ clientToRemove?.name }}</strong>? Esta ação não
              pode ser desfeita.
            </p>
          </div>
          <div class="flex items-center justify-end gap-2">
            <UButton color="neutral" variant="ghost" label="Cancelar" @click="removeClientDialog = false" />
            <UButton color="error" :loading="loadingRemoveClient" label="Remover" @click="confirmRemoveClient" />
          </div>
        </section>
      </template>
    </UModal>

    <UModal v-model:open="removeVehicleDialog" :ui="{ content: 'max-w-md w-full' }">
      <template #body>
        <section class="space-y-4">
          <div>
            <h2 class="font-display text-lg font-bold text-ink">Remover veículo</h2>
            <p class="text-sm text-ink-muted mt-1">
              Tem certeza que deseja remover o veículo
              <strong class="font-mono text-ink">{{ vehicleToRemove?.plate?.toUpperCase() }}</strong>?
            </p>
          </div>
          <div class="flex items-center justify-end gap-2">
            <UButton color="neutral" variant="ghost" label="Cancelar" @click="removeVehicleDialog = false" />
            <UButton color="error" :loading="loadingRemoveVehicle" label="Remover" @click="confirmRemoveVehicle" />
          </div>
        </section>
      </template>
    </UModal>

    <UButton
      class="fixed bottom-5 right-5 md:bottom-10 md:right-10 rounded-full shadow-lg shadow-slate-900/15"
      color="neutral"
      size="xl"
      icon="i-tabler-plus"
      @click="openCreateClient"
    >
      <span class="hidden sm:inline">Novo cliente</span>
    </UButton>
  </div>
</template>

<script setup>
import { useDebounceFn } from "@vueuse/core";

const http = useApi();
const toast = useToast();

const loading = ref(false);
const search = ref("");
const clients = ref([]);

const clientDialog = ref(false);
const isEditing = ref(false);
const loadingClient = ref(false);
const modalTab = ref(0);

const currentClient = ref(null);
const client = ref({ name: "", phone: "" });

const clientVehicles = ref([]);
const isAddingVehicle = ref(false);
const isUpdatingVehicle = ref(false);
const loadingVehicle = ref(false);
const newVehicle = ref({
  plate: "",
  mark: "",
  model: "",
  year: "",
  color: "",
  type: 0,
});

const removeClientDialog = ref(false);
const clientToRemove = ref(null);
const loadingRemoveClient = ref(false);

const removeVehicleDialog = ref(false);
const vehicleToRemove = ref(null);
const loadingRemoveVehicle = ref(false);

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

const columns = [
  { accessorKey: "name", header: "Nome" },
  { accessorKey: "phone", header: "Telefone" },
  { id: "vehicles", header: "Veículos" },
  { accessorKey: "createdAt", header: "Registrado em" },
  { id: "actions", header: "" },
];

const stats = computed(() => {
  const totalVehicles = clients.value.reduce(
    (acc, c) => acc + (c.vehicles?.length || 0),
    0
  );
  return [
    {
      label: "Total de clientes",
      value: clients.value.length,
      icon: "tabler:users",
      badgeClass: "bg-gradient-to-br from-violet-500 to-violet-600 shadow-sm shadow-violet-500/30",
    },
    {
      label: "Veículos cadastrados",
      value: totalVehicles,
      icon: "iconoir:car",
      badgeClass: "bg-gradient-to-br from-teal-500 to-teal-600 shadow-sm shadow-teal-500/30",
    },
    {
      label: "Sem veículo",
      value: clients.value.filter((c) => !c.vehicles?.length).length,
      icon: "tabler:car-off",
      badgeClass: "bg-gradient-to-br from-slate-500 to-slate-600 shadow-sm shadow-slate-500/30",
    },
  ];
});

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("pt-BR") : "—";

const debouncedSearch = useDebounceFn(() => {
  getClients();
}, 550);

const getClients = async () => {
  loading.value = true;

  const { data, error } = await http.get("/client/get-all-by-organization/1", {
    params: { name: search.value },
  });

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao buscar clientes.",
    });
    loading.value = false;
    return;
  }

  clients.value = data.value.content;
  loading.value = false;
};

const resetAddVehicle = () => {
  isAddingVehicle.value = false;
  isUpdatingVehicle.value = false;
  newVehicle.value = { plate: "", mark: "", model: "", year: "", color: "", type: 0 };
};

const resetClientModal = () => {
  isEditing.value = false;
  modalTab.value = 0;
  client.value = { name: "", phone: "" };
  currentClient.value = null;
  clientVehicles.value = [];
  loadingClient.value = false;
  resetAddVehicle();
};

const openCreateClient = () => {
  resetClientModal();
  clientDialog.value = true;
};

const getVehiclesFromClient = async (clientId) => {
  const { data, error } = await http.get(`/vehicle/get-all-by-client/${clientId}/1`);

  if (error.value) {
    toast.error({
      title: "Erro",
      message: error.value.message || "Erro ao buscar veículos do cliente.",
    });
    return;
  }

  clientVehicles.value = data.value.content;
};

const openEditClient = (row) => {
  resetClientModal();
  currentClient.value = row;
  client.value = { id: row.id, name: row.name, phone: row.phone };
  isEditing.value = true;
  clientDialog.value = true;
  getVehiclesFromClient(row.id);
};

const createClient = async () => {
  if (!client.value.name) {
    toast.warning({ title: "Atenção", message: "Informe o nome do cliente." });
    return;
  }

  loadingClient.value = true;

  const { error } = await http.post("/client", {
    ...client.value,
    organizationId: 1,
  });

  loadingClient.value = false;

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao cadastrar cliente.",
    });
    return;
  }

  toast.success({ title: "Sucesso", message: "Cliente cadastrado com sucesso." });
  clientDialog.value = false;
  getClients();
};

const updateClient = async () => {
  if (!client.value.name) {
    toast.warning({ title: "Atenção", message: "Informe o nome do cliente." });
    return;
  }

  loadingClient.value = true;

  const { error } = await http.patch("/client", { ...client.value });

  loadingClient.value = false;

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao atualizar cliente.",
    });
    return;
  }

  toast.success({ title: "Sucesso", message: "Cliente atualizado com sucesso." });
  clientDialog.value = false;
  getClients();
};

const openRemoveClient = (row) => {
  clientToRemove.value = row;
  removeClientDialog.value = true;
};

const confirmRemoveClient = async () => {
  loadingRemoveClient.value = true;

  const { error } = await http.delete(
    `/client/delete-from-organization/1/${clientToRemove.value.id}`
  );

  loadingRemoveClient.value = false;

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao remover cliente.",
    });
    return;
  }

  toast.success({ title: "Sucesso", message: "Cliente removido com sucesso." });
  removeClientDialog.value = false;
  clientToRemove.value = null;
  getClients();
};

const setVehicleToUpdate = (vehicle) => {
  newVehicle.value = { ...vehicle };
  isUpdatingVehicle.value = true;
};

const addNewVehicle = async () => {
  if (!newVehicle.value.plate) {
    toast.warning({ title: "Atenção", message: "Informe a placa do veículo." });
    return;
  }

  loadingVehicle.value = true;

  const { data, error } = await http.post("/client/add-vehicle", {
    ...newVehicle.value,
    userId: currentClient.value.id,
    organizationId: 1,
  });

  loadingVehicle.value = false;

  if (error.value) {
    toast.error({
      title: "Erro",
      message: error.value.message || "Erro ao adicionar veículo.",
    });
    return;
  }

  clientVehicles.value.push({ ...data.value.content.vehicle });
  toast.success({ title: "Sucesso", message: "Veículo adicionado com sucesso." });
  resetAddVehicle();
};

const updateVehicle = async () => {
  loadingVehicle.value = true;

  const { error } = await http.put(`/vehicle/${newVehicle.value.id}`, {
    ...newVehicle.value,
    userId: currentClient.value.id,
  });

  loadingVehicle.value = false;

  if (error.value) {
    toast.error({
      title: "Erro",
      message: error.value.message || "Erro ao atualizar veículo.",
    });
    return;
  }

  const index = clientVehicles.value.findIndex((v) => v.id === newVehicle.value.id);
  if (index !== -1) clientVehicles.value[index] = { ...newVehicle.value };

  toast.success({ title: "Sucesso", message: "Veículo atualizado com sucesso." });
  resetAddVehicle();
};

const setVehicleToRemove = (vehicle) => {
  vehicleToRemove.value = vehicle;
  removeVehicleDialog.value = true;
};

const confirmRemoveVehicle = async () => {
  loadingRemoveVehicle.value = true;

  const { error } = await http.post("/client/remove-vehicle", {
    userId: currentClient.value.id,
    vehicleId: vehicleToRemove.value.id,
  });

  loadingRemoveVehicle.value = false;

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao remover veículo.",
    });
    return;
  }

  clientVehicles.value = clientVehicles.value.filter(
    (v) => v.id !== vehicleToRemove.value.id
  );
  toast.success({ title: "Sucesso", message: "Veículo removido com sucesso." });
  removeVehicleDialog.value = false;
  vehicleToRemove.value = null;
};

watch(clientDialog, (open) => {
  if (!open) resetClientModal();
});

getClients();
</script>
