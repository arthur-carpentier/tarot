<template>
  <AppShell>
    <div
      class="flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[80vh]"
    >
      <div
        class="absolute inset-0 bg-cover bg-center opacity-20"
        :style="{
          backgroundImage: `url(${textureUrl})`,
          backgroundRepeat: 'repeat',
        }"
      ></div>
      <div class="relative z-10">
        <h1 class="text-5xl font-extrabold">Bienvenue sur Tarot</h1>
        <p class="text-lg text-navy/70 dark:text-periwinkle/80 mt-4">
          Les parties, les scores et les statistiques, directement depuis le Google
          Sheet.
        </p>
        <div class="mt-6">
          <router-link
            to="/games"
            class="px-6 py-3 bg-chartreuse text-navy font-semibold rounded-lg shadow-lg hover:brightness-95 transition"
          >
            Commencer
          </router-link>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import AppShell from "@/Components/AppShell.vue";

const textureUrl = `${import.meta.env.BASE_URL}images/card_table_texture.jpg`;
</script>
