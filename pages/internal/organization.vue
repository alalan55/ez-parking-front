<template>
  <div class="min-h-full p-4 md:p-6 overflow-y-auto">
    <div class="mx-auto flex flex-col gap-4 md:gap-5 pb-10">
      <LayoutPageHeader
        title="Organização"
        subtitle="Gerencie os dados cadastrais e de contato da sua organização."
      />

      <form class="flex flex-col gap-4 md:gap-5" @submit.prevent="updateOrg">
        <section class="bg-surface border border-line rounded p-4 md:p-6 flex flex-col gap-4">
          <div>
            <h2 class="text-sm font-semibold text-ink flex items-center gap-1.5">
              <Icon name="tabler:building" size="1rem" class="text-ink-faint" />
              Informações da organização
            </h2>
            <p class="text-xs text-ink-muted mt-0.5">
              Dados principais usados para identificar sua organização no Ez-parking.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
            <div class="md:col-span-4 flex flex-col gap-3 bg-surface-2 border border-line rounded p-4">
              <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Emblema</p>
              <div class="flex items-center gap-3">
                <div
                  class="w-[72px] h-[72px] shrink-0 rounded bg-surface border border-line overflow-hidden flex items-center justify-center text-ink text-lg font-semibold"
                >
                  <img
                    v-if="organization.logo && !logoFailed"
                    :src="organization.logo"
                    alt="Logo da organização"
                    class="w-full h-full object-cover"
                    @error="logoFailed = true"
                  />
                  <span v-else class="font-mono">{{ initials }}</span>
                </div>
                <p class="text-xs text-ink-faint">
                  Cole a URL de uma imagem no campo "Logo" ao lado. Sem imagem, mostramos as iniciais do nome.
                </p>
              </div>
            </div>

            <div class="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField
                label="Nome da organização"
                class="sm:col-span-2"
                :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }"
              >
                <UInput v-model="organization.name" placeholder="Nome" class="w-full" :ui="{ base: 'rounded' }" />
              </UFormField>

              <UFormField
                label="ID do registro"
                :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }"
              >
                <UInput
                  :model-value="`ORG-${String(organization.id).padStart(4, '0')}`"
                  disabled
                  class="w-full"
                  :ui="{ base: 'rounded font-mono' }"
                />
              </UFormField>

              <UFormField
                label="Quantidade de vagas"
                :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }"
              >
                <UInput
                  v-model="organization.vacanciesQuantity"
                  type="number"
                  placeholder="Qtd. vagas"
                  class="w-full"
                  :ui="{ base: 'rounded font-mono' }"
                />
              </UFormField>

              <UFormField
                label="Logo (URL)"
                class="sm:col-span-2"
                :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }"
              >
                <UInput
                  v-model="organization.logo"
                  placeholder="https://exemplo.com/logo.png"
                  class="w-full"
                  :ui="{ base: 'rounded' }"
                />
              </UFormField>
            </div>
          </div>
        </section>

        <section class="bg-surface border border-line rounded p-4 md:p-6 flex flex-col gap-4">
          <div>
            <h2 class="text-sm font-semibold text-ink flex items-center gap-1.5">
              <Icon name="tabler:address-book" size="1rem" class="text-ink-faint" />
              Informações de contato
            </h2>
            <p class="text-xs text-ink-muted mt-0.5">
              Usadas para notificações e comunicação com sua organização.
            </p>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <UFormField
              label="Endereço"
              :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }"
            >
              <UInput v-model="organization.address" placeholder="Endereço" class="w-full" :ui="{ base: 'rounded' }" />
            </UFormField>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField
                label="Telefone"
                :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }"
              >
                <UInput
                  v-model="organization.phone"
                  placeholder="Telefone"
                  icon="i-tabler-phone"
                  class="w-full"
                  :ui="{ base: 'rounded font-mono' }"
                />
              </UFormField>

              <UFormField
                label="E-mail"
                :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }"
              >
                <UInput
                  v-model="organization.email"
                  placeholder="E-mail"
                  type="email"
                  icon="i-tabler-at"
                  class="w-full"
                  :ui="{ base: 'rounded font-mono' }"
                />
              </UFormField>
            </div>
          </div>
        </section>

        <section class="bg-surface border border-line rounded p-4 flex items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-ink-muted text-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-500 shrink-0"></span>
            <span v-if="organization.updatedAt">
              Última atualização em <span class="font-mono text-ink">{{ formatDateTime(organization.updatedAt) }}</span>
            </span>
            <span v-else>Sem alterações registradas ainda.</span>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <UButton color="neutral" variant="ghost" class="rounded" label="Cancelar" @click="getOrgInfo" />
            <UButton
              type="submit"
              color="primary"
              class="rounded"
              icon="i-tabler-device-floppy"
              :loading="loading"
              label="Salvar alterações"
            />
          </div>
        </section>
      </form>

      <section class="bg-surface border border-line rounded p-4 md:p-6 flex flex-col gap-4">
        <div>
          <h2 class="text-sm font-semibold text-ink flex items-center gap-1.5">
            <Icon name="tabler:currency-real" size="1rem" class="text-ink-faint" />
            Tarifação
          </h2>
          <p class="text-xs text-ink-muted mt-0.5">
            Valor cobrado por hora, por tipo de veículo. Um tipo sem tarifa definida não gera receita nos relatórios.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField
            v-for="type in vehicleTypes"
            :key="type.value"
            :label="type.label"
            :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }"
          >
            <UInput
              v-model="tariffRates[type.value]"
              type="number"
              step="0.01"
              min="0"
              placeholder="Não definida"
              icon="i-tabler-currency-real"
              class="w-full"
              :ui="{ base: 'rounded font-mono' }"
            />
          </UFormField>
        </div>

        <div class="flex items-center justify-end pt-2 border-t border-line">
          <UButton
            color="primary"
            class="rounded"
            icon="i-tabler-device-floppy"
            :loading="loadingTariff"
            label="Salvar tarifas"
            @click="saveTariffs"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const http = useApi();
const toast = useToast();
const organizationId = useCurrentOrganizationId();

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
  createdAt: null,
  updatedAt: null,
});

const vehicleTypes = [
  { value: 0, label: "Carro (R$/h)" },
  { value: 1, label: "Moto (R$/h)" },
  { value: 2, label: "Caminhão (R$/h)" },
  { value: 3, label: "Ônibus (R$/h)" },
  { value: 4, label: "Bicicleta (R$/h)" },
];

const loadingTariff = ref(false);
const tariffRates = ref(Object.fromEntries(vehicleTypes.map((t) => [t.value, ""])));

const initials = computed(() =>
  (organization.value.name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?"
);

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const getOrgInfo = async () => {
  const { data, error } = await http.get(`/organization/get-by-id/${organizationId.value}`);

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

const getTariffRates = async () => {
  const { data, error } = await http.get(`/tariff/${organizationId.value}`);
  if (error.value) return;

  const fresh = Object.fromEntries(vehicleTypes.map((t) => [t.value, ""]));
  data.value.content.forEach((rate) => {
    fresh[rate.vehicleType] = rate.hourlyRate;
  });
  tariffRates.value = fresh;
};

const saveTariffs = async () => {
  const rates = Object.entries(tariffRates.value)
    .filter(([, rate]) => rate !== "" && rate !== null && !isNaN(Number(rate)))
    .map(([vehicleType, hourlyRate]) => ({
      vehicleType: Number(vehicleType),
      hourlyRate: Number(hourlyRate),
    }));

  if (!rates.length) {
    toast.warning({ title: "Atenção", message: "Defina ao menos uma tarifa." });
    return;
  }

  loadingTariff.value = true;
  const { error } = await http.put("/tariff", { rates });
  loadingTariff.value = false;

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao salvar tarifas.",
    });
    return;
  }

  toast.success({ title: "Sucesso", message: "Tarifas atualizadas com sucesso." });
};

onMounted(() => {
  getOrgInfo();
  getTariffRates();
});
</script>
