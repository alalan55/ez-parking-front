<template>
  <div class="w-full max-w-[640px]">
    <div class="flex flex-col items-center gap-3 mb-8">
      <SharedLogoMark size="lg" />
      <div class="text-center">
        <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint flex items-center gap-1.5 justify-center">
          <span class="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-500"></span>
          Ez-parking · Terminal Operacional
        </p>
        <h1 class="font-display text-2xl font-bold text-ink tracking-tight mt-2">Criar organização</h1>
        <p class="text-sm text-ink-muted mt-1">
          Cadastre sua organização e o primeiro acesso de administrador.
        </p>
      </div>
    </div>

    <div class="bg-surface border border-line rounded p-6">
      <form class="flex flex-col gap-6" @submit.prevent="handleRegister">
        <div class="flex flex-col gap-4">
          <h2 class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Seus dados</h2>
          <div class="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Nome" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
              <UInput v-model="infos.name" placeholder="Nome completo" class="w-full" :ui="{ base: 'rounded' }" />
            </UFormField>
            <UFormField label="E-mail" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
              <UInput v-model="infos.email" placeholder="voce@empresa.com" type="email" class="w-full" :ui="{ base: 'rounded' }" />
            </UFormField>
            <UFormField label="Senha" class="md:col-span-2" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
              <UInput v-model="infos.password" placeholder="Mínimo 6 caracteres" type="password" class="w-full" :ui="{ base: 'rounded' }" />
            </UFormField>
          </div>
        </div>

        <div class="h-px bg-line"></div>

        <div class="flex flex-col gap-4">
          <h2 class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Dados da organização</h2>
          <div class="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Nome da organização" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
              <UInput v-model="infos.organizationName" placeholder="Nome" class="w-full" :ui="{ base: 'rounded' }" />
            </UFormField>
            <UFormField label="E-mail da organização" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
              <UInput v-model="infos.organizationEmail" placeholder="contato@empresa.com" type="email" class="w-full" :ui="{ base: 'rounded' }" />
            </UFormField>
            <UFormField label="Endereço" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
              <UInput v-model="infos.organizationAddress" placeholder="Endereço" class="w-full" :ui="{ base: 'rounded' }" />
            </UFormField>
            <UFormField label="Telefone" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
              <UInput v-model="infos.organizationPhone" placeholder="Telefone" class="w-full" :ui="{ base: 'rounded' }" />
            </UFormField>
            <UFormField label="Quantidade de vagas" class="md:col-span-2" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
              <UInput v-model="infos.organizationVacanciesQuantity" type="number" placeholder="Ex: 20" class="w-full" :ui="{ base: 'font-mono rounded' }" />
            </UFormField>
          </div>
        </div>

        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
          class="rounded"
          :loading="loading"
          label="Criar organização"
        />
      </form>
    </div>

    <p class="text-center text-sm text-ink-muted mt-6">
      Já tem uma conta?
      <NuxtLink to="/auth/login" class="font-semibold text-ink hover:underline">Entrar</NuxtLink>
    </p>
  </div>
</template>

<script setup>
definePageMeta({ layout: "auth" });

const toast = useToast();
const { register } = useAuth();

const infos = ref({
  name: "",
  email: "",
  password: "",
  organizationName: "",
  organizationEmail: "",
  organizationAddress: "",
  organizationPhone: "",
  organizationVacanciesQuantity: "",
});

const loading = ref(false);

const handleRegister = async () => {
  if (!infos.value.name || !infos.value.email || !infos.value.password) {
    toast.warning({ title: "Atenção", message: "Preencha seus dados de acesso." });
    return;
  }
  if (infos.value.password.length < 6) {
    toast.warning({ title: "Atenção", message: "A senha deve ter pelo menos 6 caracteres." });
    return;
  }
  if (!infos.value.organizationName) {
    toast.warning({ title: "Atenção", message: "Informe o nome da organização." });
    return;
  }

  loading.value = true;
  const { error } = await register({
    ...infos.value,
    organizationVacanciesQuantity: Number(infos.value.organizationVacanciesQuantity) || 0,
  });
  loading.value = false;

  if (error) {
    toast.error({
      title: "Falha ao criar organização",
      message: error.message || "Não foi possível concluir o cadastro.",
    });
    return;
  }

  toast.success({ title: "Sucesso", message: "Organização criada com sucesso." });
  await navigateTo("/internal");
};
</script>
