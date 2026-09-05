<template>
  <div class="w-full" :class="currentOption === null ? 'max-w-[560px]' : 'max-w-[720px]'">
    <div class="text-center mb-8">
      <h1 class="font-display text-2xl font-bold text-ink">Criar conta</h1>
      <p class="text-sm text-ink-muted mt-1">
        Selecione uma das opções abaixo para se registrar.
      </p>
    </div>

    <div ref="optionsSection">
      <section
        v-if="currentOption === null"
        class="grid sm:grid-cols-1 md:grid-cols-2 gap-4"
      >
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          class="text-left bg-surface border border-line rounded-2xl p-5 hover:border-violet-300 dark:hover:border-violet-800 hover:shadow-sm transition-all"
          @click="currentOption = option.value"
        >
          <span
            class="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 bg-gradient-to-br from-violet-500 to-teal-500 shadow-sm shadow-violet-500/30"
          >
            <Icon :name="option.icon" size="1.1rem" />
          </span>
          <p class="font-semibold text-ink">{{ option.title }}</p>
          <p class="text-sm text-ink-muted mt-1">{{ option.description }}</p>
        </button>
      </section>

      <section v-else class="bg-surface border border-line rounded-2xl shadow-sm p-6">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-5"
          @click="currentOption = null"
        >
          <Icon name="tabler:arrow-left" size="1rem" />
          Voltar
        </button>

        <form v-if="currentOption === 0" class="flex flex-col gap-4" @submit.prevent="handleRegister">
          <UFormField label="Nome">
            <UInput v-model="infos.name" placeholder="Nome completo" class="w-full" />
          </UFormField>
          <UFormField label="E-mail">
            <UInput v-model="infos.email" placeholder="voce@empresa.com" type="email" class="w-full" />
          </UFormField>
          <UFormField label="ID da organização">
            <UInput v-model="infos.organizationId" type="number" placeholder="Ex: 1" class="w-full" />
          </UFormField>
          <UFormField label="Senha">
            <UInput v-model="infos.password" placeholder="••••••••" type="password" class="w-full" />
          </UFormField>

          <UButton type="submit" color="neutral" size="lg" block :loading="loading" label="Registrar" />
        </form>

        <div v-else class="flex flex-col gap-6">
          <div class="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
            <form class="flex flex-col gap-4" @submit.prevent>
              <h2 class="text-sm font-semibold text-ink-muted">Seus dados</h2>
              <UFormField label="Nome">
                <UInput v-model="infosAndCompany.name" placeholder="Nome completo" class="w-full" />
              </UFormField>
              <UFormField label="E-mail">
                <UInput v-model="infosAndCompany.email" placeholder="voce@empresa.com" type="email" class="w-full" />
              </UFormField>
              <UFormField label="Senha">
                <UInput v-model="infosAndCompany.password" placeholder="••••••••" type="password" class="w-full" />
              </UFormField>
            </form>

            <form class="flex flex-col gap-4" @submit.prevent>
              <h2 class="text-sm font-semibold text-ink-muted">Dados da organização</h2>
              <UFormField label="Nome da organização">
                <UInput v-model="infosAndCompany.organizationName" placeholder="Nome" class="w-full" />
              </UFormField>
              <UFormField label="E-mail da organização">
                <UInput v-model="infosAndCompany.organizationEmail" placeholder="contato@empresa.com" type="email" class="w-full" />
              </UFormField>
              <UFormField label="Endereço">
                <UInput v-model="infosAndCompany.organizationAddress" placeholder="Endereço" class="w-full" />
              </UFormField>
              <UFormField label="Telefone">
                <UInput v-model="infosAndCompany.organizationPhone" placeholder="Telefone" class="w-full" />
              </UFormField>
              <UFormField label="Quantidade de vagas">
                <UInput v-model="infosAndCompany.organizationVacanciesQuantity" type="number" placeholder="Ex: 20" class="w-full" />
              </UFormField>
            </form>
          </div>

          <UButton color="neutral" size="lg" block :loading="loading" label="Cadastrar" @click="handleRegister" />
        </div>
      </section>
    </div>

    <p class="text-center text-sm text-ink-muted mt-6">
      Já tem uma conta?
      <NuxtLink to="/auth/login" class="font-semibold text-ink hover:underline">Entrar</NuxtLink>
    </p>
  </div>
</template>

<script setup>
import autoAnimate from "@formkit/auto-animate";

definePageMeta({ layout: "auth" });

const toast = useToast();

const infos = ref({
  name: "",
  email: "",
  password: "",
  organizationId: null,
});

const infosAndCompany = ref({
  name: "",
  email: "",
  password: "",
  organizationName: "",
  organizationEmail: "",
  organizationAddress: "",
  organizationPhone: "",
  organizationVacanciesQuantity: "",
});

const currentOption = ref(null);
const optionsSection = ref(null);
const loading = ref(false);

const options = [
  {
    value: 0,
    icon: "tabler:user-plus",
    title: "Registrar usuário em empresa",
    description: "Se você deseja registrar um usuário em uma empresa já existente.",
  },
  {
    value: 1,
    icon: "tabler:building-plus",
    title: "Registrar usuário e empresa",
    description: "Se você deseja registrar um usuário e criar uma nova empresa ao mesmo tempo.",
  },
];

const handleRegister = () => {
  toast.warning({
    title: "Em breve",
    message: "A autenticação real ainda não está disponível nesta versão.",
  });
};

onMounted(() => {
  if (optionsSection.value) autoAnimate(optionsSection.value);
});
</script>
