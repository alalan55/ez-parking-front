<template>
  <div class="min-h-full p-4 md:p-6 overflow-y-auto">
    <div class="max-w-[900px] mx-auto flex flex-col gap-4 md:gap-5 pb-10">
      <div>
        <h1 class="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">
          Organização
        </h1>
        <p class="text-ink-muted mt-1">
          Gerencie as informações e configurações da sua organização.
        </p>
      </div>

      <section class="bg-surface border border-line rounded-2xl shadow-sm p-5 md:p-6">
        <div class="flex flex-col sm:flex-row gap-6">
          <div class="flex sm:flex-col items-center gap-3 shrink-0">
            <div
              class="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center text-white text-2xl font-display font-bold shrink-0 bg-gradient-to-br from-violet-500 to-teal-500 shadow-sm shadow-violet-500/30"
            >
              <img
                v-if="organization.logo && !logoFailed"
                :src="organization.logo"
                alt="Logo da organização"
                class="w-full h-full object-cover"
                @error="logoFailed = true"
              />
              <span v-else>{{ initials }}</span>
            </div>
            <p class="text-xs text-ink-faint text-center sm:max-w-[120px]">
              Cole a URL de uma imagem no campo "Logo" para exibi-la aqui.
            </p>
          </div>

          <form class="flex-1 grid sm:grid-cols-1 md:grid-cols-2 gap-4" @submit.prevent>
            <UFormField label="Nome da organização" class="md:col-span-2">
              <UInput v-model="organization.name" placeholder="Nome" class="w-full" />
            </UFormField>

            <UFormField label="ID da organização">
              <UInput :model-value="organization.id" disabled class="w-full" />
            </UFormField>

            <UFormField label="Quantidade de vagas">
              <UInput
                v-model="organization.vacanciesQuantity"
                type="number"
                placeholder="Qtd. vagas"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Endereço" class="md:col-span-2">
              <UInput v-model="organization.address" placeholder="Endereço" class="w-full" />
            </UFormField>

            <UFormField label="Telefone de contato">
              <UInput v-model="organization.phone" placeholder="Telefone" class="w-full" />
            </UFormField>

            <UFormField label="E-mail">
              <UInput v-model="organization.email" placeholder="E-mail" type="email" class="w-full" />
            </UFormField>

            <UFormField label="Logo (URL)" class="md:col-span-2">
              <UInput
                v-model="organization.logo"
                placeholder="https://exemplo.com/logo.png"
                class="w-full"
              />
            </UFormField>
          </form>
        </div>

        <div class="flex items-center justify-end gap-2 pt-5 mt-5 border-t border-line">
          <UButton
            color="neutral"
            :loading="loading"
            label="Salvar alterações"
            @click="updateOrg"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const http = useApi();
const toast = useToast();

const loading = ref(false);
const logoFailed = ref(false);

const organization = ref({
  id: "",
  name: "",
  address: "",
  phone: "",
  email: "",
  logo: "",
  vacanciesQuantity: 0,
});

const initials = computed(() =>
  (organization.value.name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "OZ"
);

const getOrgInfo = async () => {
  const { data, error } = await http.get("/organization/get-by-id/1");

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao buscar informações da organização.",
    });
    return;
  }

  Object.assign(organization.value, data.value.content);
};

watch(
  () => organization.value.logo,
  () => {
    logoFailed.value = false;
  }
);

const updateOrg = async () => {
  if (!organization.value.name) {
    toast.warning({ title: "Atenção", message: "Informe o nome da organização." });
    return;
  }

  loading.value = true;

  const { data, error } = await http.put("/organization", organization.value);

  loading.value = false;

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao atualizar organização.",
    });
    return;
  }

  toast.success({ title: "Sucesso", message: "Organização atualizada com sucesso." });
  Object.assign(organization.value, data.value.content);
};

onMounted(() => {
  getOrgInfo();
});
</script>
