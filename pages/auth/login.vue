<template>
  <div
    class="wrapper min-h-[calc(100dvh - 70px)] flex flex-col items-center justify-center bg-[#fafafa] h-full"
  >
    <div class="text-center">
      <h1 class="text-2xl font-bold">Bem-vindo de volta</h1>
    </div>

    <div class="rounded-lg p-4 w-full max-w-[600px] mt-4">
      <form class="flex flex-col gap-4" @submit.prevent>
        <SharedTInput v-model="infos.email" placeholder="E-mail" type="email" />

        <SharedTInput
          v-model="infos.password"
          placeholder="Senha"
          type="password"
        />

        <SharedTButton class="mt-4" type="primary" title="Entrar" />

        <div class="text-center text-sm text-[#5c748a]">
          Não tem uma conta?
          <NuxtLink to="/auth/register" class="font-bold">Registre-se</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const infos = ref({
  email: "",
  password: "",
});
</script>
