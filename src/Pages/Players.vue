<template>
  <AppShell>
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h1 class="text-4xl font-bold">Joueurs</h1>
      <a
        :href="sheetUrl"
        target="_blank"
        rel="noopener"
        class="bg-watergreen dark:bg-navy border border-navy/10 dark:border-white/10 px-4 py-2 rounded text-navy dark:text-white font-semibold shadow-md hover:bg-periwinkle/40 dark:hover:bg-white/10 transition"
      >
        <i class="fa-solid fa-arrow-up-right-from-square mr-2"></i>Modifier dans le Sheet
      </a>
    </div>

    <p class="text-navy/60 dark:text-periwinkle/80 mb-6">
      La liste des joueurs vient de l'onglet « Données » du Google Sheet. Pour ajouter ou
      renommer un joueur, modifiez directement la feuille.
    </p>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="n in 6"
        :key="n"
        class="h-24 rounded-lg bg-watergreen dark:bg-navy animate-pulse"
      ></div>
    </div>

    <p v-else-if="error" class="text-center text-red-600 dark:text-red-400 text-lg">{{ error }}</p>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="entry in standings"
        :key="entry.name"
        class="rounded-lg p-4 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy flex items-center space-x-4"
      >
        <PlayerAvatar :name="entry.name" size="lg" />
        <div class="flex-1 min-w-0">
          <div class="font-bold text-lg truncate">{{ entry.name }}</div>
          <div class="text-sm text-navy/60 dark:text-periwinkle/80">
            {{ entry.participations }} partie{{ entry.participations > 1 ? "s" : "" }}
            · {{ entry.victoires }} victoire{{ entry.victoires > 1 ? "s" : "" }}
          </div>
        </div>
        <div
          class="text-xl font-bold"
          :class="entry.score >= 0 ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
        >
          {{ entry.score.toFixed(1) }}
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import AppShell from "@/Components/AppShell.vue";
import PlayerAvatar from "@/Components/PlayerAvatar.vue";
import { useTarotData } from "@/composables/useTarotData";
import { SHEET_URL } from "@/config";

const { standings, loading, error } = useTarotData();
const sheetUrl = SHEET_URL;
</script>
