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
        v-model="handleClientDialog"
        :show-close-button="false"
        :title="isEditing ? 'Atualizar cliente' : 'Adicionar cliente'"
        width="max-w-4xl"
      >
        <div class="mt-5">
          <form @submit.prevent>
            <section class="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-[#5c748a] mb-1">
                  Nome
                </label>
                <SharedTInput
                  v-model="client.name"
                  placeholder="Nome"
                  type="text"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-[#5c748a] mb-1">
                  Telefone
                </label>
                <SharedTInput
                  v-model="client.phone"
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
const isEditing = ref(false);

const removeDialog = ref(false);
const clients = ref([]);
const currentClient = ref(null);
const search = ref("");
const client = ref({
  name: "",
  phone: "",
});

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

watch(handleClientDialog, (newValue) => {
  if (!newValue) {
    isEditing.value = false;

    client.value = {
      name: "",
      phone: "",
    };
  }
});

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
</script>

<style scoped lang="postcss"></style>
