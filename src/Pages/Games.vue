<template>
  <AppShell>
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h1 class="text-4xl font-bold">Liste des parties</h1>
      <router-link
        to="/new-game"
        class="bg-chartreuse px-4 py-2 rounded text-navy font-semibold shadow-md hover:brightness-95 transition"
      >
        + Ajouter une partie
      </router-link>
    </div>

    <!-- Skeleton Loader -->
    <div
      v-if="loading"
      class="rounded-lg shadow-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy"
    >
      <div
        v-for="n in 5"
        :key="n"
        class="animate-pulse flex items-center space-x-4 py-2"
      >
        <div class="bg-navy/10 dark:bg-white/10 h-12 w-12 rounded-full"></div>
        <div class="flex-1">
          <div class="bg-navy/10 dark:bg-white/10 h-4 w-1/3 mb-2"></div>
          <div class="bg-navy/10 dark:bg-white/10 h-4 w-1/4"></div>
        </div>
      </div>
    </div>

    <p
      v-else-if="error"
      class="text-center text-red-600 dark:text-red-400 text-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy rounded-lg"
    >
      {{ error }}
    </p>

    <p
      v-else-if="games.length === 0"
      class="text-center text-navy/60 dark:text-periwinkle/80 text-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy rounded-lg"
    >
      Aucune partie enregistrée pour le moment.
    </p>

    <template v-else>
      <!-- Mobile : une carte par partie -->
      <div class="md:hidden space-y-3">
        <div
          v-for="game in sortedGames"
          :key="game.numero"
          class="rounded-lg shadow p-3 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy"
        >
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="font-bold text-navy/60 dark:text-periwinkle/80">
              n°{{ game.numero }}
            </span>
            <span
              class="px-2 py-0.5 rounded text-sm font-semibold ring-1 ring-navy/20 dark:ring-white/30 whitespace-nowrap"
              :style="annonceStyle(game.annonce)"
            >
              {{ game.annonce }}
            </span>
            <span
              class="rounded-full px-2.5 py-1 text-sm font-bold whitespace-nowrap"
              :class="game.fait ? 'bg-chartreuse text-navy' : 'bg-red-600 text-white'"
            >
              {{ (game.prisChuteDe >= 0 ? "+" : "") + game.prisChuteDe.toFixed(1) }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-2">
            <div class="flex -space-x-1.5">
              <PlayerAvatar
                :name="game.preneur"
                size="sm"
                class="outline outline-2 outline-red-500"
              />
              <PlayerAvatar
                v-if="game.appele && game.appele !== game.preneur"
                :name="game.appele"
                size="sm"
                class="outline outline-2 outline-yellow-500"
              />
            </div>
            <span class="text-xs font-bold text-navy/40 dark:text-periwinkle/60">VS</span>
            <div class="flex -space-x-1.5">
              <PlayerAvatar
                v-for="defenseur in game.defenseurs"
                :key="defenseur"
                :name="defenseur"
                size="sm"
                class="outline outline-2 outline-blue-500"
              />
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 mt-3 text-sm">
            <span class="whitespace-nowrap">
              <i
                v-for="n in 3"
                :key="n"
                :class="game.boutsAttaque >= n ? 'fa-solid' : 'fa-regular'"
                class="fa-square text-pine dark:text-chartreuse mx-0.5"
              ></i>
            </span>
            <span class="font-semibold whitespace-nowrap">
              {{ game.pointsAttaque.toFixed(1) }} / {{ game.pointsAFaire }}
            </span>
          </div>

          <div v-if="gameBonuses(game).length" class="mt-2">
            <span
              v-for="bonus in gameBonuses(game)"
              :key="bonus"
              class="inline-block px-2 py-0.5 m-0.5 rounded-full bg-navy/10 dark:bg-white/10 text-xs font-semibold whitespace-nowrap"
            >
              {{ bonus }}
            </span>
          </div>
        </div>
      </div>

      <!-- Desktop : tableau -->
      <div
        class="hidden md:block rounded-lg shadow-lg overflow-x-auto p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy"
      >
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-watergreen dark:bg-navy text-left">
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
            <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 font-semibold">
              {{ game.numero }}
            </td>

            <!-- Attaque : preneur (rouge) + appelé (jaune) -->
            <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10">
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

            <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10">
              <div class="flex space-x-2">
                <PlayerAvatar
                  v-for="defenseur in game.defenseurs"
                  :key="defenseur"
                  :name="defenseur"
                  class="outline outline-2 outline-blue-500"
                />
              </div>
            </td>

            <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-center">
              <span
                class="px-3 py-1 rounded-lg shadow whitespace-nowrap ring-1 ring-navy/20 dark:ring-white/30"
                :style="annonceStyle(game.annonce)"
              >
                {{ game.annonce }}
              </span>
            </td>

            <!-- Bouts de l'attaque -->
            <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 font-semibold text-center whitespace-nowrap">
              <i
                v-for="n in 3"
                :key="n"
                :class="game.boutsAttaque >= n ? 'fa-solid' : 'fa-regular'"
                class="fa-square text-pine dark:text-chartreuse text-2xl mx-1"
              ></i>
            </td>

            <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-center">
              <span
                v-for="bonus in gameBonuses(game)"
                :key="bonus"
                class="inline-block px-2 py-0.5 m-0.5 rounded-full bg-navy/10 dark:bg-white/10 text-xs font-semibold whitespace-nowrap"
              >
                {{ bonus }}
              </span>
            </td>

            <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 font-semibold text-right whitespace-nowrap">
              {{ game.pointsAttaque.toFixed(1) }} / {{ game.pointsAFaire }}
            </td>

            <!-- Écart (PRIS/CHUTÉ DE) -->
            <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 font-semibold text-center">
              <span
                class="rounded-full px-3 py-2 whitespace-nowrap"
                :class="game.fait ? 'bg-chartreuse text-navy' : 'bg-red-600 text-white'"
              >
                {{ (game.prisChuteDe >= 0 ? "+" : "") + game.prisChuteDe.toFixed(1) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </template>
  </AppShell>
</template>

<script setup>
import { computed } from "vue";
import AppShell from "@/Components/AppShell.vue";
import PlayerAvatar from "@/Components/PlayerAvatar.vue";
import { useTarotData } from "@/composables/useTarotData";
import { annonceStyle } from "@/services/avatars";

const { games, loading, error } = useTarotData();

// Les plus récentes en premier
const sortedGames = computed(() => [...games.value].sort((a, b) => b.numero - a.numero));

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
