<template>
  <div class="h-full p-4 overflow-y-auto">
    <div class="content max-w-[1100px] mx-auto sm:mt-4 md:mt-10">
      <h1 class="text-3xl font-bold">Organização</h1>

      <span class="text-[#4A739C]"
        >Gerencie as informações e configurações da sua organização.</span
      >

      <section class="mt-8 flex flex-wrap gap-4">
        <form
          class="form flex-[1_1_300px] flex flex-col gap-4 max-w-[800px]"
          @submit.prevent
        >
          <section class="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex-[1_1_300px]">
              <label class="block text-xs font-medium text-[#5c748a] mb-1"
                >Nome da organização</label
              >
              <SharedTInput v-model="organization.name" placeholder="Nome" />
            </div>

            <div class="flex-[1_1_300px]">
              <label class="block text-xs font-medium text-[#5c748a] mb-1"
                >ID da organização</label
              >
              <SharedTInput
                v-model="organization.id"
                :readonly="true"
                placeholder="ID"
              />
            </div>

            <div class="flex-[1_1_300px]">
              <label class="block text-xs font-medium text-[#5c748a] mb-1"
                >Endereço</label
              >
              <SharedTInput
                v-model="organization.address"
                placeholder="Endereço"
              />
            </div>

            <div class="flex-[1_1_300px]">
              <label class="block text-xs font-medium text-[#5c748a] mb-1"
                >Telefone de contato</label
              >
              <SharedTInput
                v-model="organization.phone"
                placeholder="Telefone"
              />
            </div>

            <div class="flex-[1_1_300px]">
              <label class="block text-xs font-medium text-[#5c748a] mb-1"
                >E-mail</label
              >
              <SharedTInput v-model="organization.email" placeholder="E-mail" />
            </div>

            <div class="flex-[1_1_300px]">
              <label class="block text-xs font-medium text-[#5c748a] mb-1"
                >Quantidade de vagas</label
              >
              <SharedTInput
                v-model="organization.vacanciesQuantity"
                placeholder="Qtd. vagas"
                type="number"
              />
            </div>
          </section>
        </form>

        <div
          class="logo flex-1 flex flex-col items-center justify-center gap-4"
        >
          <figure
            class="w-[180px] h-[180px] rounded-full bg-[#cdcdcd] flex items-center justify-center"
          ></figure>
          <small class="text-sm text-grey">Alterar logo da organização</small>
        </div>
      </section>

      <div class="max-w-[300px] m-auto">
        <SharedTButton
          class="mt-18"
          title="Salvar alterações"
          :loading="loading"
          @click="updateOrg"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const http = useApi();
const toast = useToast();

const loading = ref(false);

const organization = ref({
  id: "",
  name: "",
  address: "",
  phone: "",
  email: "",
  logo: "",
  vacanciesQuantity: 0,
});

const getOrgInfo = async () => {
  try {
    const { data, error } = await http.get("/organization/get-by-id/1");

    if (error.value) {
      toast.error({
        title: "Falha",
        message:
          error.value.message || "Erro ao buscar informações da organização.",
      });
      return;
    }

    Object.assign(organization.value, data.value.content);
  } catch (error) {
    console.error("Error fetching vacancies logs:", error);
  }
};

const updateOrg = async () => {
  try {
    loading.value = true;

    const { data, error } = await http.put("/organization", organization.value);

    if (error.value) {
      toast.error({
        title: "Falha",
        message: error.value.message || "Erro ao atualizar organização.",
      });
      loading.value = false;
      return;
    }

    toast.success({
      title: "Sucesso",
      message: "Organização atualizada com sucesso.",
    });

    Object.assign(organization.value, data.value.content); // <-- aqui!

    loading.value = false;
  } catch (error) {
    console.error("Error updating organization:", error);
    loading.value = false;
  }
};

onMounted(() => {
  getOrgInfo();
});
</script>

<style scoped lang="postcss">
@media (max-width: 640px) {
  .form {
    order: 2;
  }
  .logo {
    order: 1;
  }
}
</style>
