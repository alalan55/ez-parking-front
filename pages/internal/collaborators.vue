<template>
  <div class="min-h-full p-4 md:p-6 overflow-y-auto">
    <div class="max-w-[1400px] mx-auto flex flex-col gap-4 md:gap-5 pb-24">
      <LayoutPageHeader
        title="Colaboradores"
        subtitle="Gerencie as pessoas que têm acesso ao Ez-parking na sua organização."
      >
        <template #actions>
          <UButton
            icon="i-tabler-user-plus"
            color="primary"
            class="rounded"
            @click="openCreateCollaborator"
          >
            Novo colaborador
          </UButton>
        </template>
      </LayoutPageHeader>

      <section>
        <div
          class="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line bg-surface border border-line rounded overflow-hidden"
        >
          <div class="p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between gap-2">
              <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Cadastrados</p>
              <Icon name="tabler:users-group" size="1rem" class="text-ink-faint" />
            </div>
            <p class="text-2xl font-semibold text-ink mt-1">{{ collaborators.length }}</p>
            <p class="text-xs text-ink-muted mt-2">no ecossistema Ez-parking</p>
          </div>

          <div class="p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between gap-2">
              <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Ativos</p>
              <span class="font-mono text-[11px] text-green-700 dark:text-green-500 font-semibold">{{ activePct }}%</span>
            </div>
            <p class="text-2xl font-semibold text-green-700 dark:text-green-500 mt-1">{{ activeCount }}</p>
            <p class="text-xs text-ink-muted mt-2">com acesso liberado</p>
            <div class="h-1 mt-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full rounded-full bg-green-600 dark:bg-green-500 transition-all duration-300"
                :style="{ width: `${activePct}%` }"
              ></div>
            </div>
          </div>

          <div class="p-4 flex flex-col justify-between">
            <div class="flex items-center justify-between gap-2">
              <p class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Inativos</p>
              <span v-if="inactiveCount > 0" class="font-mono text-[11px] text-amber-600 dark:text-amber-500 font-semibold">
                atenção
              </span>
            </div>
            <p class="text-2xl font-semibold text-ink mt-1">{{ inactiveCount }}</p>
            <p class="text-xs text-ink-muted mt-2">acesso desativado</p>
          </div>
        </div>
      </section>

      <section>
        <div
          class="bg-surface border border-line rounded p-3 flex flex-wrap items-center justify-between gap-3 mb-3"
        >
          <div class="flex flex-wrap items-center gap-2">
            <div class="flex items-center gap-1 bg-surface-2 border border-line rounded p-0.5">
              <UButton
                v-for="tab in statusTabs"
                :key="tab.value"
                size="sm"
                color="neutral"
                :variant="statusFilter === tab.value ? 'solid' : 'ghost'"
                class="rounded"
                @click="statusFilter = tab.value"
              >
                {{ tab.label }} ({{ tab.count }})
              </UButton>
            </div>
            <USelect
              v-model="roleFilter"
              :items="roleFilterOptions"
              class="w-[170px]"
              :ui="{ base: 'rounded' }"
            />
          </div>

          <UInput
            v-model="search"
            icon="i-tabler-search"
            placeholder="Pesquisar por nome ou e-mail"
            class="w-full sm:w-[260px]"
            :ui="{ base: 'rounded' }"
          />
        </div>

        <div class="bg-surface border border-line rounded overflow-hidden">
          <UTable
            :data="filteredCollaborators"
            :columns="columns"
            :loading="loading"
            :ui="{ thead: 'bg-surface-2' }"
          >
            <template #name-cell="{ row }">
              <div class="flex items-center gap-2.5">
                <span
                  class="w-7 h-7 shrink-0 rounded bg-surface-2 border border-line flex items-center justify-center font-mono text-[11px] font-semibold text-ink"
                >
                  {{ initials(row.original.name) }}
                </span>
                <div class="min-w-0">
                  <p class="font-semibold text-ink truncate">{{ row.original.name }}</p>
                  <p class="font-mono text-[10px] text-ink-faint truncate">{{ row.original.email }}</p>
                </div>
              </div>
            </template>

            <template #role-cell="{ row }">
              <span class="inline-flex items-center px-2 py-0.5 rounded border border-line bg-surface-2 text-ink font-mono text-[11px]">
                {{ roleLabel(row.original.role) }}
              </span>
            </template>

            <template #active-cell="{ row }">
              <span
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono"
                :class="row.original.active
                  ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
                  : 'border-line bg-surface-2 text-ink-faint'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="row.original.active ? 'bg-green-500' : 'bg-ink-faint'"></span>
                {{ row.original.active ? "Ativo" : "Inativo" }}
              </span>
            </template>

            <template #createdAt-cell="{ row }">
              <span class="font-mono text-xs text-ink-muted">
                {{ formatDate(row.original.createdAt) }}
              </span>
            </template>

            <template #actions-cell="{ row }">
              <div class="flex items-center justify-end gap-1">
                <UButton
                  :icon="row.original.active ? 'i-tabler-lock' : 'i-tabler-lock-open'"
                  :color="row.original.active ? 'neutral' : 'primary'"
                  variant="ghost"
                  size="sm"
                  square
                  class="rounded"
                  :title="row.original.active ? 'Desativar acesso' : 'Ativar acesso'"
                  @click="toggleActive(row.original)"
                />
                <UButton
                  icon="i-tabler-pencil"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  square
                  class="rounded"
                  @click="openEditCollaborator(row.original)"
                />
                <UButton
                  icon="i-tabler-trash"
                  color="error"
                  variant="ghost"
                  size="sm"
                  square
                  class="rounded"
                  @click="openRemoveCollaborator(row.original)"
                />
              </div>
            </template>

            <template #empty>
              <div class="flex flex-col items-center gap-2 text-ink-muted py-8">
                <Icon name="tabler:users-group" size="1.75rem" class="text-ink-faint" />
                Nenhum colaborador encontrado.
              </div>
            </template>
          </UTable>

          <div class="px-3 py-2 border-t border-line flex items-center justify-between text-xs text-ink-faint">
            <span class="font-mono">Mostrando {{ filteredCollaborators.length }} de {{ collaborators.length }} colaboradores</span>
          </div>
        </div>
      </section>
    </div>

    <UModal v-model:open="collaboratorDialog" :ui="{ content: 'max-w-lg w-full rounded' }">
      <template #body>
        <section class="space-y-5">
          <div>
            <h2 class="text-lg font-semibold text-ink">
              {{ isEditing ? "Atualizar colaborador" : "Novo colaborador" }}
            </h2>
            <p class="text-sm text-ink-muted mt-0.5">
              {{
                isEditing
                  ? "Edite os dados de acesso do colaborador."
                  : "Cadastre um novo colaborador na sua organização. Ele não poderá se autocadastrar."
              }}
            </p>
          </div>

          <div class="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Nome" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
              <UInput v-model="collaborator.name" placeholder="Nome do colaborador" class="w-full" :ui="{ base: 'rounded' }" />
            </UFormField>

            <UFormField label="E-mail" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
              <UInput v-model="collaborator.email" type="email" placeholder="nome@empresa.com" class="w-full" :ui="{ base: 'rounded' }" />
            </UFormField>

            <UFormField label="Perfil de acesso" :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }">
              <USelect v-model="collaborator.role" :items="roleOptions" class="w-full" :ui="{ base: 'rounded' }" />
            </UFormField>

            <UFormField
              :label="isEditing ? 'Nova senha (opcional)' : 'Senha'"
              :ui="{ label: 'font-mono text-[11px] uppercase tracking-wide text-ink-faint' }"
            >
              <UInput
                v-model="collaborator.password"
                type="password"
                :placeholder="isEditing ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'"
                class="w-full"
                :ui="{ base: 'rounded' }"
              />
            </UFormField>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-line">
            <UButton color="neutral" variant="ghost" class="rounded" label="Cancelar" @click="collaboratorDialog = false" />
            <UButton
              color="primary"
              class="rounded"
              :loading="loadingCollaborator"
              :label="isEditing ? 'Atualizar' : 'Adicionar'"
              @click="isEditing ? updateCollaborator() : createCollaborator()"
            />
          </div>
        </section>
      </template>
    </UModal>

    <UModal v-model:open="removeCollaboratorDialog" :ui="{ content: 'max-w-md w-full rounded' }">
      <template #body>
        <section class="space-y-4">
          <div>
            <h2 class="text-base font-semibold text-ink">Remover colaborador</h2>
            <p class="text-sm text-ink-muted mt-1">
              Tem certeza que deseja remover
              <strong class="text-ink">{{ collaboratorToRemove?.name }}</strong>? O acesso dele ao
              sistema será removido permanentemente.
            </p>
          </div>
          <div class="flex items-center justify-end gap-2">
            <UButton color="neutral" variant="ghost" class="rounded" label="Cancelar" @click="removeCollaboratorDialog = false" />
            <UButton color="error" class="rounded" :loading="loadingRemoveCollaborator" label="Remover" @click="confirmRemoveCollaborator" />
          </div>
        </section>
      </template>
    </UModal>

    <UButton
      class="lg:hidden fixed bottom-5 right-5 rounded-full"
      color="primary"
      size="xl"
      icon="i-tabler-user-plus"
      @click="openCreateCollaborator"
    />
  </div>
</template>

<script setup>
const http = useApi();
const toast = useToast();
const organizationId = useCurrentOrganizationId();

const loading = ref(false);
const search = ref("");
const statusFilter = ref("all");
const roleFilter = ref(null);
const collaborators = ref([]);

const collaboratorDialog = ref(false);
const isEditing = ref(false);
const loadingCollaborator = ref(false);
const currentCollaborator = ref(null);
const collaborator = ref({ name: "", email: "", password: "", role: 2 });

const removeCollaboratorDialog = ref(false);
const collaboratorToRemove = ref(null);
const loadingRemoveCollaborator = ref(false);

const roleLabelMap = { 0: "Super admin", 1: "Administrador", 2: "Operador" };
const roleLabel = (role) => roleLabelMap[role] ?? "—";

const roleOptions = [
  { label: "Operador", value: 2 },
  { label: "Administrador", value: 1 },
  { label: "Super admin", value: 0 },
];

const roleFilterOptions = computed(() => [
  { label: "Perfil: Todos", value: null },
  ...roleOptions,
]);

const columns = [
  { accessorKey: "name", header: "Colaborador" },
  { id: "role", header: "Perfil" },
  { id: "active", header: "Status" },
  { accessorKey: "createdAt", header: "Cadastrado em" },
  { id: "actions", header: "" },
];

const activeCount = computed(() => collaborators.value.filter((c) => c.active).length);
const inactiveCount = computed(() => collaborators.value.length - activeCount.value);
const activePct = computed(() =>
  collaborators.value.length ? Math.round((activeCount.value / collaborators.value.length) * 100) : 0
);

const statusTabs = computed(() => [
  { label: "Todos", value: "all", count: collaborators.value.length },
  { label: "Ativos", value: "active", count: activeCount.value },
  { label: "Inativos", value: "inactive", count: inactiveCount.value },
]);

const filteredCollaborators = computed(() => {
  let list = collaborators.value;

  if (statusFilter.value === "active") list = list.filter((c) => c.active);
  if (statusFilter.value === "inactive") list = list.filter((c) => !c.active);
  if (roleFilter.value !== null) list = list.filter((c) => c.role === roleFilter.value);

  if (search.value) {
    const term = search.value.toLowerCase();
    list = list.filter(
      (c) => c.name?.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term)
    );
  }

  return list;
});

const initials = (name) => {
  const words = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("pt-BR") : "—");

const getCollaborators = async () => {
  loading.value = true;

  const { data, error } = await http.get(`/collaborator/organization/${organizationId.value}`);

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao buscar colaboradores.",
    });
    loading.value = false;
    return;
  }

  collaborators.value = data.value.content;
  loading.value = false;
};

const resetCollaboratorModal = () => {
  isEditing.value = false;
  collaborator.value = { name: "", email: "", password: "", role: 2 };
  currentCollaborator.value = null;
  loadingCollaborator.value = false;
};

const openCreateCollaborator = () => {
  resetCollaboratorModal();
  collaboratorDialog.value = true;
};

const openEditCollaborator = (row) => {
  resetCollaboratorModal();
  currentCollaborator.value = row;
  collaborator.value = { name: row.name, email: row.email, password: "", role: row.role };
  isEditing.value = true;
  collaboratorDialog.value = true;
};

const createCollaborator = async () => {
  if (!collaborator.value.name || !collaborator.value.email) {
    toast.warning({ title: "Atenção", message: "Informe nome e e-mail do colaborador." });
    return;
  }
  if (!collaborator.value.password || collaborator.value.password.length < 6) {
    toast.warning({ title: "Atenção", message: "A senha deve ter pelo menos 6 caracteres." });
    return;
  }

  loadingCollaborator.value = true;

  // organizationId is set server-side from the caller's own token, so it
  // isn't sent here.
  const { error } = await http.post("/collaborator", { ...collaborator.value });

  loadingCollaborator.value = false;

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao cadastrar colaborador.",
    });
    return;
  }

  toast.success({ title: "Sucesso", message: "Colaborador cadastrado com sucesso." });
  collaboratorDialog.value = false;
  getCollaborators();
};

const updateCollaborator = async () => {
  if (!collaborator.value.name || !collaborator.value.email) {
    toast.warning({ title: "Atenção", message: "Informe nome e e-mail do colaborador." });
    return;
  }
  if (collaborator.value.password && collaborator.value.password.length < 6) {
    toast.warning({ title: "Atenção", message: "A senha deve ter pelo menos 6 caracteres." });
    return;
  }

  loadingCollaborator.value = true;

  const payload = {
    name: collaborator.value.name,
    email: collaborator.value.email,
    role: collaborator.value.role,
  };
  if (collaborator.value.password) payload.password = collaborator.value.password;

  const { error } = await http.put(`/collaborator/${currentCollaborator.value.id}`, payload);

  loadingCollaborator.value = false;

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao atualizar colaborador.",
    });
    return;
  }

  toast.success({ title: "Sucesso", message: "Colaborador atualizado com sucesso." });
  collaboratorDialog.value = false;
  getCollaborators();
};

const toggleActive = async (row) => {
  const nextActive = !row.active;

  const { error } = await http.patch(`/collaborator/${row.id}/active`, { active: nextActive });

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao alterar o acesso do colaborador.",
    });
    return;
  }

  row.active = nextActive;
  toast.success({
    title: "Sucesso",
    message: nextActive ? "Acesso ativado." : "Acesso desativado.",
  });
};

const openRemoveCollaborator = (row) => {
  collaboratorToRemove.value = row;
  removeCollaboratorDialog.value = true;
};

const confirmRemoveCollaborator = async () => {
  loadingRemoveCollaborator.value = true;

  const { error } = await http.delete(`/collaborator/${collaboratorToRemove.value.id}`);

  loadingRemoveCollaborator.value = false;

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Erro ao remover colaborador.",
    });
    return;
  }

  toast.success({ title: "Sucesso", message: "Colaborador removido com sucesso." });
  removeCollaboratorDialog.value = false;
  collaboratorToRemove.value = null;
  getCollaborators();
};

watch(collaboratorDialog, (open) => {
  if (!open) resetCollaboratorModal();
});

getCollaborators();
</script>

<style scoped lang="postcss"></style>
