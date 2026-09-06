<template>
  <div class="w-full max-w-[380px]">
    <div class="flex flex-col items-center gap-3 mb-8">
      <SharedLogoMark size="lg" />
      <div class="text-center">
        <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint flex items-center gap-1.5 justify-center">
          <span class="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-500"></span>
          Ez-parking · Terminal Operacional
        </p>
        <h1 class="font-display text-2xl font-bold text-ink tracking-tight mt-2">Entrar</h1>
        <p class="text-sm text-ink-muted mt-1">Acesse o painel de operação da sua organização.</p>
      </div>
    </div>

    <div class="bg-surface border border-line rounded p-6">
      <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
        <UFormField label="E-mail" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
          <UInput
            v-model="infos.email"
            placeholder="voce@empresa.com"
            type="email"
            icon="i-tabler-mail"
            class="w-full"
            :ui="{ base: 'rounded' }"
          />
        </UFormField>

        <UFormField label="Senha" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
          <UInput
            v-model="infos.password"
            placeholder="••••••••"
            :type="showPassword ? 'text' : 'password'"
            icon="i-tabler-lock"
            class="w-full"
            :ui="{ base: 'rounded' }"
          >
            <template #trailing>
              <UButton
                :icon="showPassword ? 'i-tabler-eye-off' : 'i-tabler-eye'"
                color="neutral"
                variant="link"
                size="sm"
                square
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
          class="rounded"
          :loading="loading"
          label="Entrar"
        />
      </form>
    </div>

    <p class="text-center text-sm text-ink-muted mt-6">
      Ainda não tem uma organização cadastrada?
      <NuxtLink to="/auth/register" class="font-semibold text-ink hover:underline">
        Criar organização
      </NuxtLink>
    </p>
  </div>
</template>

<script setup>
definePageMeta({ layout: "auth" });

const toast = useToast();
const { login } = useAuth();

const infos = ref({ email: "", password: "" });
const showPassword = ref(false);
const loading = ref(false);

const handleLogin = async () => {
  if (!infos.value.email || !infos.value.password) {
    toast.warning({ title: "Atenção", message: "Informe e-mail e senha." });
    return;
  }

  loading.value = true;
  const { error } = await login(infos.value);
  loading.value = false;

  if (error) {
    toast.error({
      title: "Falha ao entrar",
      message: error.message || "E-mail ou senha inválidos.",
    });
    return;
  }

  await navigateTo("/internal");
};
</script>
