<template>
  <AppShell>
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h1 class="text-4xl font-bold">Liste des parties</h1>
      <router-link
        to="/new-game"
        class="bg-green-dark px-4 py-2 rounded text-light font-semibold shadow-md hover:bg-green-bright hover:text-dark transition"
      >
        + Ajouter une partie
      </router-link>
    </div>

    <!-- Skeleton Loader -->
    <div
      v-if="loading"
      class="rounded-lg shadow-lg p-6 border border-dark-lightest bg-dark-lighter"
    >
      <div
        v-for="n in 5"
        :key="n"
        class="animate-pulse flex items-center space-x-4 py-2"
      >
        <div class="bg-dark-lightest h-12 w-12 rounded-full"></div>
        <div class="flex-1">
          <div class="bg-dark-lightest h-4 w-1/3 mb-2"></div>
          <div class="bg-dark-lightest h-4 w-1/4"></div>
        </div>
      </div>
    </div>

    <p
      v-else-if="error"
      class="text-center text-red-400 text-lg p-6 border border-dark-lightest bg-dark-lighter rounded-lg"
    >
      {{ error }}
    </p>

    <p
      v-else-if="games.length === 0"
      class="text-center text-gray-300 text-lg p-6 border border-dark-lightest bg-dark-lighter rounded-lg"
    >
      Aucune partie enregistrée pour le moment.
    </p>

    <div
      v-else
      class="rounded-lg shadow-lg overflow-x-auto p-6 border border-dark-lightest bg-dark-lighter"
    >
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-dark-lighter text-left">
            <td class="p-3">N°</td>
            <td class="p-3">Attaque</td>
            <td class="p-3">Défense</td>
            <td class="p-3 text-center">Annonce</td>
            <td class="p-3 text-center">Bouts</td>
            <td class="p-3 text-center">Bonus</td>
            <td class="p-3 text-right">Points attaque</td>
            <td class="p-3 text-center">Faite</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="game in sortedGames" :key="game.numero">
            <td class="p-3 border-t border-t-dark-lightest font-semibold">
              {{ game.numero }}
            </td>

            <!-- Attaque : preneur (rouge) + appelé (jaune) -->
            <td class="p-3 border-t border-t-dark-lightest">
              <div class="flex space-x-2">
                <PlayerAvatar
                  :name="game.preneur"
                  class="outline outline-2 outline-red-500"
                />
                <PlayerAvatar
                  v-if="game.appele && game.appele !== game.preneur"
                  :name="game.appele"
                  class="outline outline-2 outline-yellow-500"
                />
              </div>
            </td>

            <td class="p-3 border-t border-t-dark-lightest">
              <div class="flex space-x-2">
                <PlayerAvatar
                  v-for="defenseur in game.defenseurs"
                  :key="defenseur"
                  :name="defenseur"
                  class="outline outline-2 outline-blue-500"
                />
              </div>
            </td>

            <td class="p-3 border-t border-t-dark-lightest text-center">
              <span
                class="px-3 py-1 rounded-lg text-light shadow whitespace-nowrap"
                :style="{ backgroundColor: annonceColor(game.annonce) }"
              >
                {{ game.annonce }}
              </span>
            </td>

            <!-- Bouts de l'attaque -->
            <td class="p-3 border-t border-t-dark-lightest font-semibold text-center whitespace-nowrap">
              <i
                v-for="n in 3"
                :key="n"
                :class="game.boutsAttaque >= n ? 'fa-solid' : 'fa-regular'"
                class="fa-square text-green-bright text-2xl mx-1"
              ></i>
            </td>

            <td class="p-3 border-t border-t-dark-lightest text-center">
              <span
                v-for="bonus in gameBonuses(game)"
                :key="bonus"
                class="inline-block px-2 py-0.5 m-0.5 rounded-full bg-dark text-xs font-semibold whitespace-nowrap"
              >
                {{ bonus }}
              </span>
            </td>

            <td class="p-3 border-t border-t-dark-lightest font-semibold text-right whitespace-nowrap">
              {{ game.pointsAttaque.toFixed(1) }} / {{ game.pointsAFaire }}
            </td>

            <!-- Écart (PRIS/CHUTÉ DE) -->
            <td class="p-3 border-t border-t-dark-lightest font-semibold text-center">
              <span
                class="rounded-full px-3 py-2 whitespace-nowrap"
                :class="game.fait ? 'bg-green-bright text-dark' : 'bg-red-500'"
              >
                {{ (game.prisChuteDe >= 0 ? "+" : "") + game.prisChuteDe.toFixed(1) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AppShell>
</template>

<script setup>
import { computed } from "vue";
import AppShell from "@/Components/AppShell.vue";
import PlayerAvatar from "@/Components/PlayerAvatar.vue";
import { useTarotData } from "@/composables/useTarotData";

const { games, loading, error } = useTarotData();

// Les plus récentes en premier
const sortedGames = computed(() => [...games.value].sort((a, b) => b.numero - a.numero));

const ANNONCE_COLORS = {
  Petite: "#2563eb",
  Garde: "#007700",
  "Garde sans": "#d97706",
  "Garde contre": "#dc2626",
  "Petit chelem": "#7c3aed",
  "Grand chelem": "#be185d",
};

const annonceColor = (name) => ANNONCE_COLORS[name] || "#555";

const gameBonuses = (game) => {
  const labels = [];
  if (game.petitAuBout) labels.push("Petit au bout");
  if (game.misereTetes) labels.push("Misère de têtes");
  if (game.misereAtouts) labels.push("Misère d'atouts");
  if (game.simplePoignee) labels.push("Poignée");
  if (game.doublePoignee) labels.push("Double poignée");
  if (game.triplePoignee) labels.push("Triple poignée");
  return labels;
};
</script>
