<template>
  <div
    class="wrapper min-h-[calc(100dvh - 70px)] flex flex-col items-center sm:justify-start md:justify-center bg-[#fafafa] p-4"
  >
    <section class="text-center">
      <h1 class="text-2xl font-bold">Criar conta</h1>

      <span class="text-sm text-[#5c748a]">
        Selecione uma das opções abaixo para se registrar:
      </span>
    </section>

    <section
      v-if="currentOption === null"
      ref="optionsSection"
      class="flex items-center justify-center gap-6 mt-14 flex-wrap max-w-[800px]"
    >
      <div
        v-for="option in options"
        :key="option.value"
        class="bg-[#f5f5f5] hover:bg-[#e8e8e8] rounded-lg p-4 flex-[1_1_300px] text-center transition-all cursor-pointer"
        @click="currentOption = option.value"
      >
        <span class="font-semibold">{{ option.title }}</span>
        <p class="text-sm text-[#5c748a] mt-2">
          {{ option.description }}
        </p>
      </div>
    </section>

    <section
      v-show="currentOption == 0"
      ref="optionOne"
      class="rounded-lg p-4 w-full max-w-[600px] mt-14"
    >
      <form class="flex flex-col gap-4" @submit.prevent>
        <SharedTInput v-model="infos.name" placeholder="Nome" />

        <SharedTInput v-model="infos.email" placeholder="E-mail" type="email" />

        <SharedTInput v-model="infos.photo" placeholder="Foto" />

        <SharedTInput
          v-model="infos.organizationId"
          placeholder="Organização ID"
          type="number"
        />

        <SharedTInput
          v-model="infos.password"
          placeholder="Senha"
          type="password"
        />

        <SharedTButton class="mt-4" type="primary" title="Entrar" />

        <div
          class="text-sm text-[#5c748a] flex items-center justify-center gap-2"
        >
          <span
            class="inline-flex items-center gap-2 cursor-pointer"
            @click="currentOption = null"
          >
            <b to="/auth/register" class="font-bold">Voltar</b>
            <Icon name="tabler:arrow-back" />
          </span>
        </div>
      </form>
    </section>

    <section
      v-show="currentOption == 1"
      ref="optionTwo"
      class="max-w-[1000px] w-full mt-14"
    >
      <div class="w-full flex flex-wrap gap-4 mb-6">
        <div class="flex-[1_1_200px]">
          <form class="flex flex-col gap-4" @submit.prevent>
            <SharedTInput v-model="infosAndCompany.name" placeholder="Nome" />

            <SharedTInput
              v-model="infosAndCompany.email"
              placeholder="E-mail"
              type="email"
            />

            <SharedTInput v-model="infos.photo" placeholder="Foto" />

            <SharedTInput
              v-model="infos.password"
              placeholder="Senha"
              type="password"
            />
          </form>
        </div>

        <div class="flex-[1_1_200px]">
          <form class="flex flex-col gap-4" @submit.prevent>
            <SharedTInput
              v-model="infosAndCompany.organizationName"
              placeholder="Nome da organização"
            />

            <SharedTInput
              v-model="infosAndCompany.organizationEmail"
              placeholder="E-mail da organização"
              type="email"
            />

            <SharedTInput
              v-model="infosAndCompany.organizatioAddress"
              placeholder="Endereço"
            />

            <SharedTInput
              v-model="infosAndCompany.organizatioPhone"
              placeholder="Telefone"
            />

            <SharedTInput
              v-model="infosAndCompany.organizationLogo"
              placeholder="Logo"
            />

            <SharedTInput
              v-model="infosAndCompany.organizationVacanciesQuatity"
              placeholder="Quantidade de vagas"
            />
          </form>
        </div>
      </div>

      <div class="max-w-[300px] mx-auto">
        <SharedTButton class="mt-4" type="primary" title="Cadastrar" />

        <div
          class="text-sm text-[#5c748a] flex items-center justify-center gap-2"
        >
          <span
            class="inline-flex items-center gap-2 cursor-pointer"
            @click="currentOption = null"
          >
            <b to="/auth/register" class="font-bold">Voltar</b>
            <Icon name="tabler:arrow-back" />
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import autoAnimate from "@formkit/auto-animate";

const infos = ref({
  name: "",
  email: "",
  password: "",
  photo: "",
  organizationId: null,
});

const infosAndCompany = ref({
  name: "",
  email: "",
  password: "",
  photo: "",
  organizationName: "",
  organizationId: null,
});

const currentOption = ref(null);
const optionOne = ref(null);
const optionTwo = ref(null);
const optionsSection = ref(null);

const options = [
  {
    value: 0,
    title: "Registrar usuário em empresa",
    description:
      "Se você deseja registrar um usuário em uma empresa já existente.",
  },

  {
    value: 1,
    title: "Registrar usuário e empresa",
    description:
      "Se você deseja registrar um usuário e criar uma nova empresa ao mesmo tempo.",
  },
];

onMounted(() => {
  if (optionOne.value) autoAnimate(optionOne.value);
  if (optionTwo.value) autoAnimate(optionTwo.value);
  if (optionsSection.value) autoAnimate(optionsSection.value);
});
</script>

<style scoped lang="postcss">
.wrapper {
  min-height: calc(100dvh - 70px);
}
</style>
