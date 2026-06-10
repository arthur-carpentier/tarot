<template>
  <AppShell>
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h1 class="text-4xl font-bold">Règles</h1>
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
      Les barèmes viennent de l'onglet « Données » du Google Sheet : pour les changer,
      modifiez directement la feuille.
    </p>

    <div v-if="loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="h-32 rounded-lg bg-watergreen dark:bg-navy animate-pulse"></div>
    </div>

    <p v-else-if="error" class="text-center text-red-600 dark:text-red-400 text-lg">{{ error }}</p>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div class="rounded-lg shadow-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <h2 class="text-2xl font-bold mb-4">Annonces</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-left">
              <td class="py-2.5 px-3">Annonce</td>
              <td class="py-2.5 px-3 text-right">Score</td>
              <td class="py-2.5 px-3 text-right">Multiplicateur</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="annonce in annonces" :key="annonce.name">
              <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10">{{ annonce.name }}</td>
              <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                {{ annonce.score }}
              </td>
              <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                ×{{ annonce.multiplicateur }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rounded-lg shadow-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <h2 class="text-2xl font-bold mb-4">Bonus</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-left">
              <td class="py-2.5 px-3">Bonus</td>
              <td class="py-2.5 px-3 text-right">Points</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bonus in bonuses" :key="bonus.name">
              <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10">{{ bonus.name }}</td>
              <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                +{{ bonus.points }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rounded-lg shadow-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <h2 class="text-2xl font-bold mb-4">Poignées</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-left">
              <td class="py-2.5 px-3">Atouts</td>
              <td class="py-2.5 px-3 text-right">Points</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="poignee in poignees" :key="poignee.atouts">
              <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10">
                {{ poignee.atouts }} atouts
              </td>
              <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                +{{ poignee.points }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import AppShell from "@/Components/AppShell.vue";
import { useTarotData } from "@/composables/useTarotData";
import { SHEET_URL } from "@/config";

const { annonces, bonuses, poignees, loading, error } = useTarotData();
const sheetUrl = SHEET_URL;
</script>
