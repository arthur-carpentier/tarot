<template>
  <AppShell>
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h1 class="text-4xl font-bold">Règles</h1>
      <a
        :href="sheetUrl"
        target="_blank"
        rel="noopener"
        class="bg-dark-lighter border border-dark-lightest px-4 py-2 rounded text-light font-semibold shadow-md hover:bg-dark-lightest transition"
      >
        <i class="fa-solid fa-arrow-up-right-from-square mr-2"></i>Modifier dans le Sheet
      </a>
    </div>

    <p class="text-light-darker mb-6">
      Les barèmes viennent de l'onglet « Données » du Google Sheet : pour les changer,
      modifiez directement la feuille.
    </p>

    <div v-if="loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="h-32 rounded-lg bg-dark-lighter animate-pulse"></div>
    </div>

    <p v-else-if="error" class="text-center text-red-400 text-lg">{{ error }}</p>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div class="rounded-lg shadow-lg p-6 border border-dark-lightest bg-dark-lighter">
        <h2 class="text-2xl font-bold mb-4">Annonces</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-left">
              <td class="p-3">Annonce</td>
              <td class="p-3 text-right">Score</td>
              <td class="p-3 text-right">Multiplicateur</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="annonce in annonces" :key="annonce.name">
              <td class="p-3 border-t border-t-dark-lightest">{{ annonce.name }}</td>
              <td class="p-3 border-t border-t-dark-lightest text-right">
                {{ annonce.score }}
              </td>
              <td class="p-3 border-t border-t-dark-lightest text-right">
                ×{{ annonce.multiplicateur }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rounded-lg shadow-lg p-6 border border-dark-lightest bg-dark-lighter">
        <h2 class="text-2xl font-bold mb-4">Bonus</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-left">
              <td class="p-3">Bonus</td>
              <td class="p-3 text-right">Points</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bonus in bonuses" :key="bonus.name">
              <td class="p-3 border-t border-t-dark-lightest">{{ bonus.name }}</td>
              <td class="p-3 border-t border-t-dark-lightest text-right">
                +{{ bonus.points }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rounded-lg shadow-lg p-6 border border-dark-lightest bg-dark-lighter">
        <h2 class="text-2xl font-bold mb-4">Poignées</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-left">
              <td class="p-3">Atouts</td>
              <td class="p-3 text-right">Points</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="poignee in poignees" :key="poignee.atouts">
              <td class="p-3 border-t border-t-dark-lightest">
                {{ poignee.atouts }} atouts
              </td>
              <td class="p-3 border-t border-t-dark-lightest text-right">
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
