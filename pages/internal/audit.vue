<template>
  <div class="min-h-full p-4 md:p-6 overflow-y-auto">
    <div class="max-w-[1400px] mx-auto flex flex-col gap-4 md:gap-5 pb-10">
      <LayoutPageHeader
        title="Auditoria"
        subtitle="Histórico das ações realizadas na organização, com rastreabilidade real."
      >
        <template #actions>
          <div class="flex items-center gap-1 bg-surface-2 border border-line rounded p-0.5">
            <UButton
              v-for="option in periodOptions"
              :key="option.value"
              size="sm"
              color="neutral"
              :variant="days === option.value ? 'solid' : 'ghost'"
              class="rounded"
              @click="days = option.value"
            >
              {{ option.label }}
            </UButton>
          </div>
        </template>
      </LayoutPageHeader>

      <section
        class="bg-surface border border-line rounded p-3 flex flex-wrap items-center justify-between gap-3"
      >
        <div class="flex flex-wrap items-center gap-2">
          <USelect
            v-model="actionFilter"
            :items="actionOptions"
            class="w-[150px]"
            :ui="{ base: 'rounded' }"
          />
          <USelect
            v-model="resourceFilter"
            :items="resourceOptions"
            class="w-[150px]"
            :ui="{ base: 'rounded' }"
          />
          <USelect
            v-model="collaboratorFilter"
            :items="collaboratorOptions"
            class="w-[190px]"
            :ui="{ base: 'rounded' }"
          />
        </div>

        <div class="flex items-center gap-2">
          <UInput
            v-model="search"
            icon="i-tabler-search"
            placeholder="Pesquisar na descrição"
            class="w-full sm:w-[240px]"
            :ui="{ base: 'rounded' }"
            @input="debouncedSearch"
          />
          <UButton
            icon="i-tabler-refresh"
            color="neutral"
            variant="outline"
            class="rounded"
            :loading="loading"
            @click="fetchAuditLog()"
          />
        </div>
      </section>

      <section>
        <div class="flex items-center justify-between px-1 mb-3 flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <h2 class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Registros</h2>
            <span class="font-mono text-[11px] text-ink-faint border border-line rounded px-1.5 py-0.5">
              {{ total }} evento{{ total === 1 ? "" : "s" }} encontrado{{ total === 1 ? "" : "s" }}
            </span>
          </div>
          <ClientOnly>
            <span v-if="lastUpdated" class="font-mono text-[11px] text-ink-faint">
              Última atualização: {{ lastUpdated }}
            </span>
          </ClientOnly>
        </div>

        <div class="bg-surface border border-line rounded overflow-hidden">
          <UTable
            :data="events"
            :columns="columns"
            :loading="loading"
            :ui="{ thead: 'bg-surface-2' }"
          >
            <template #createdAt-cell="{ row }">
              <span class="font-mono text-xs text-ink">
                {{ formatDateTime(row.original.createdAt) }}
              </span>
            </template>

            <template #collaborator-cell="{ row }">
              <div class="flex items-center gap-2">
                <span
                  class="w-6 h-6 shrink-0 rounded bg-surface-2 border border-line flex items-center justify-center font-mono text-[10px] font-semibold text-ink"
                >
                  {{ row.original.collaborator ? initials(row.original.collaborator.name) : "SYS" }}
                </span>
                <span :class="row.original.collaborator ? 'text-ink font-medium' : 'text-ink-faint'">
                  {{ row.original.collaborator?.name || "Sistema" }}
                </span>
              </div>
            </template>

            <template #action-cell="{ row }">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border"
                :class="actionBadgeClass(row.original.action)"
              >
                {{ actionLabel(row.original.action) }}
              </span>
            </template>

            <template #resource-cell="{ row }">
              <span class="font-mono text-xs text-ink-muted">
                {{ row.original.resource }}
                <span v-if="row.original.resourceId" class="text-ink-faint">#{{ row.original.resourceId }}</span>
              </span>
            </template>

            <template #description-cell="{ row }">
              <span class="text-ink text-sm truncate block max-w-xs" :title="row.original.description">
                {{ row.original.description }}
              </span>
            </template>

            <template #actions-cell="{ row }">
              <div class="flex items-center justify-end">
                <UButton
                  icon="i-tabler-eye"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  class="rounded"
                  @click="openDetails(row.original)"
                >
                  Ver detalhes
                </UButton>
              </div>
            </template>

            <template #empty>
              <div class="flex flex-col items-center gap-2 text-ink-muted py-8">
                <Icon name="tabler:history-off" size="1.75rem" class="text-ink-faint" />
                Nenhum evento encontrado para este filtro.
              </div>
            </template>
          </UTable>

          <div
            class="px-3 py-2 border-t border-line flex items-center justify-between text-xs text-ink-faint flex-wrap gap-2"
          >
            <span class="font-mono">
              Mostrando {{ rangeStart }}–{{ rangeEnd }} de {{ total }} eventos
            </span>
            <div class="flex items-center gap-2">
              <UButton
                icon="i-tabler-chevron-left"
                size="xs"
                variant="outline"
                color="neutral"
                class="rounded"
                :disabled="page <= 1"
                @click="page--"
              />
              <span class="font-mono">Página {{ page }} de {{ totalPages }}</span>
              <UButton
                icon="i-tabler-chevron-right"
                size="xs"
                variant="outline"
                color="neutral"
                class="rounded"
                :disabled="page >= totalPages"
                @click="page++"
              />
            </div>
          </div>
        </div>
      </section>
    </div>

    <UModal v-model:open="detailsOpen" :ui="{ content: 'max-w-lg w-full rounded' }">
      <template #body>
        <section v-if="selectedEvent" class="space-y-4">
          <div class="flex items-center gap-2">
            <Icon name="tabler:shield-check" size="1.1rem" class="text-green-600 dark:text-green-500" />
            <h2 class="text-base font-semibold text-ink">Detalhes da auditoria</h2>
          </div>

          <div class="flex flex-col gap-2.5 text-sm">
            <div class="flex items-center justify-between gap-3">
              <span class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Ação</span>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border"
                :class="actionBadgeClass(selectedEvent.action)"
              >
                {{ actionLabel(selectedEvent.action) }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-3">
              <span class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Usuário</span>
              <span class="text-ink font-medium text-right">
                {{ selectedEvent.collaborator?.name || "Sistema" }}
                <span v-if="selectedEvent.collaborator" class="text-ink-faint font-normal">
                  ({{ roleLabel(selectedEvent.collaborator.role) }})
                </span>
              </span>
            </div>
            <div class="flex items-center justify-between gap-3">
              <span class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Data e hora</span>
              <span class="font-mono text-xs text-ink">{{ formatDateTime(selectedEvent.createdAt) }}</span>
            </div>
            <div class="flex items-center justify-between gap-3">
              <span class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Recurso</span>
              <span class="text-ink text-right">
                {{ selectedEvent.resource }}
                <span v-if="selectedEvent.resourceId" class="font-mono text-xs text-ink-faint">#{{ selectedEvent.resourceId }}</span>
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Descrição</span>
              <p class="text-ink">{{ selectedEvent.description }}</p>
            </div>
          </div>

          <div v-if="selectedDiff.length" class="pt-3 border-t border-line space-y-2">
            <span class="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              Alterações registradas
            </span>
            <div
              v-for="change in selectedDiff"
              :key="change.field"
              class="bg-surface-2 border border-line rounded p-2.5 flex flex-col gap-1.5"
            >
              <span class="font-mono text-[11px] font-semibold text-ink">{{ change.field }}</span>
              <div class="flex items-center justify-between text-xs">
                <span class="text-ink-faint uppercase font-mono text-[10px]">Antes:</span>
                <span class="font-mono text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                  {{ change.before ?? "—" }}
                </span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-ink-faint uppercase font-mono text-[10px]">Depois:</span>
                <span class="font-mono text-green-700 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                  {{ change.after ?? "—" }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end pt-3 border-t border-line">
            <UButton color="neutral" variant="ghost" class="rounded" label="Fechar" @click="detailsOpen = false" />
          </div>
        </section>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { useDebounceFn } from "@vueuse/core";

const http = useApi();
const toast = useToast();
const organizationId = useCurrentOrganizationId();

const events = ref([]);
const total = ref(0);
const loading = ref(false);
const lastUpdated = ref("");

const days = ref(7);
const actionFilter = ref(null);
const resourceFilter = ref(null);
const collaboratorFilter = ref(null);
const search = ref("");
const page = ref(1);
const pageSize = 20;

const collaborators = ref([]);

const detailsOpen = ref(false);
const selectedEvent = ref(null);

const periodOptions = [
  { value: 1, label: "Hoje" },
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
];

const actionOptions = [
  { label: "Todas as ações", value: null },
  { label: "Criou", value: "created" },
  { label: "Alterou", value: "updated" },
  { label: "Excluiu", value: "deleted" },
  { label: "Check-in", value: "checkin" },
  { label: "Check-out", value: "checkout" },
];

const resourceOptions = [
  { label: "Todos os recursos", value: null },
  { label: "Cliente", value: "Cliente" },
  { label: "Veículo", value: "Veículo" },
  { label: "Organização", value: "Organização" },
  { label: "Vaga", value: "Vaga" },
  { label: "Colaborador", value: "Colaborador" },
];

const collaboratorOptions = computed(() => [
  { label: "Todos os usuários", value: null },
  ...collaborators.value.map((c) => ({ label: c.name, value: String(c.id) })),
]);

const columns = [
  { accessorKey: "createdAt", header: "Data e Hora" },
  { id: "collaborator", header: "Usuário" },
  { id: "action", header: "Ação" },
  { id: "resource", header: "Recurso" },
  { id: "description", header: "Descrição" },
  { id: "actions", header: "" },
];

const actionLabelMap = {
  created: "Criou",
  updated: "Alterou",
  deleted: "Excluiu",
  checkin: "Check-in",
  checkout: "Check-out",
};

const actionLabel = (action) => actionLabelMap[action] || action;

const actionBadgeClass = (action) => {
  if (action === "created" || action === "checkin")
    return "bg-surface-2 border-green-500/30 text-green-700 dark:text-green-400";
  if (action === "deleted")
    return "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400";
  if (action === "updated" || action === "checkout")
    return "bg-surface-2 border-sky-500/30 text-sky-700 dark:text-sky-400";
  return "bg-surface-2 border-line text-ink-muted";
};

const roleLabelMap = { 0: "Super admin", 1: "Administrador", 2: "Operador" };
const roleLabel = (role) => roleLabelMap[role] ?? "—";

const initials = (name) => {
  const words = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join("");
};

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
const rangeStart = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize + 1));
const rangeEnd = computed(() => Math.min(page.value * pageSize, total.value));

const selectedDiff = computed(() => {
  const raw = selectedEvent.value?.metadata;
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
});

const openDetails = (event) => {
  selectedEvent.value = event;
  detailsOpen.value = true;
};

const fetchAuditLog = async () => {
  loading.value = true;

  const params = { days: days.value, page: page.value, pageSize };
  if (actionFilter.value) params.action = actionFilter.value;
  if (resourceFilter.value) params.resource = resourceFilter.value;
  if (collaboratorFilter.value) params.collaboratorId = collaboratorFilter.value;
  if (search.value) params.search = search.value;

  const { data, error } = await http.get(`/audit-log/${organizationId.value}`, { params });

  loading.value = false;

  if (error.value) {
    toast.error({
      title: "Falha",
      message: error.value.message || "Não foi possível buscar o histórico de auditoria.",
    });
    return;
  }

  events.value = data.value.content.events;
  total.value = data.value.content.total;
  lastUpdated.value = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const getCollaborators = async () => {
  const { data, error } = await http.get(`/collaborator/organization/${organizationId.value}`);
  if (error.value) return;
  collaborators.value = data.value.content;
};

const debouncedSearch = useDebounceFn(() => {
  const wasFirstPage = page.value === 1;
  page.value = 1;
  if (wasFirstPage) fetchAuditLog();
}, 550);

watch([days, actionFilter, resourceFilter, collaboratorFilter], () => {
  // Reset to page 1 whenever a filter changes. If we were already on page 1
  // the `watch(page, ...)` below won't fire (no actual change), so fetch
  // explicitly here too — but only when that's the case, to avoid firing
  // the request twice when page did change.
  const wasFirstPage = page.value === 1;
  page.value = 1;
  if (wasFirstPage) fetchAuditLog();
});

watch(page, fetchAuditLog);

getCollaborators();
fetchAuditLog();
</script>

<style scoped lang="postcss"></style>
