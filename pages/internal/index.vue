<template>
  <div class="h-full p-4">
    <div class="content max-w-[1100px] mx-auto mt-10">
      <h1 class="text-3xl font-bold">Dashboard</h1>

      <section class="grid sm:grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div class="border border-[#e3e3e3] rounded-lg p-4">
          <p class="text-sm">Ocupação</p>
          <span class="font-bold text-lg">75%</span>
        </div>

        <div class="border border-[#e3e3e3] rounded-lg p-4">
          <p class="text-sm">Espaços disponíveis</p>
          <span class="font-bold text-lg">25</span>
        </div>

        <div class="border border-[#e3e3e3] rounded-lg p-4">
          <p class="text-sm">Receita total</p>
          <span class="font-bold text-lg">R$ 12,500</span>
        </div>
      </section>

      <section class="mt-8">
        <SharedTTable/>
      </section>
    </div>
  </div>
</template>

<script setup></script>

<style scoped lang="postcss"></style>
