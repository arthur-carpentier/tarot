<template>
  <AppShell>
    <div class="flex justify-between items-center mb-4 flex-wrap gap-4">
      <h1 class="text-4xl font-bold">Liste des parties</h1>
      <div class="flex gap-2 flex-wrap">
        <button
          v-if="games.length"
          @click="cancelLastGame"
          :disabled="cancelling"
          class="px-4 py-2 rounded font-semibold border border-red-600 text-red-600 dark:text-red-400 dark:border-red-400 hover:bg-red-600/10 transition disabled:opacity-50"
        >
          {{ cancelling ? "Annulation…" : "⌫ Annuler la dernière" }}
        </button>
        <router-link
          to="/new-game"
          class="bg-chartreuse px-4 py-2 rounded text-navy font-semibold shadow-md hover:brightness-95 transition"
        >
          + Ajouter une partie
        </router-link>
      </div>
    </div>

    <p v-if="cancelError" class="text-red-600 dark:text-red-400 font-semibold mb-4">
      {{ cancelError }}
    </p>
    <p v-if="cancelSuccess" class="text-pine dark:text-chartreuse font-semibold mb-4">
      {{ cancelSuccess }}
    </p>

    <!-- Filtres -->
    <div v-if="games.length" class="flex flex-wrap gap-2 mb-6 items-center">
      <select v-model="filterPlayer" class="filter-select">
        <option value="">Tous les joueurs</option>
        <option v-for="player in players" :key="player" :value="player">{{ player }}</option>
      </select>
      <select v-model="filterAnnonce" class="filter-select">
        <option value="">Toutes les annonces</option>
        <option v-for="annonce in annonces" :key="annonce.name" :value="annonce.name">
          {{ annonce.name }}
        </option>
      </select>
      <select v-model="filterResultat" class="filter-select">
        <option value="">Faites et chutées</option>
        <option value="fait">Faites</option>
        <option value="chute">Chutées</option>
      </select>
      <button
        v-if="filterPlayer || filterAnnonce || filterResultat"
        @click="filterPlayer = filterAnnonce = filterResultat = ''"
        class="text-sm text-navy/60 dark:text-periwinkle/80 underline"
      >
        Réinitialiser
      </button>
      <span class="text-sm text-navy/50 dark:text-periwinkle/70 ml-auto">
        {{ filteredGames.length }} / {{ games.length }} parties
      </span>
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
          v-for="game in filteredGames"
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
            <td class="py-2.5 px-3">N°</td>
            <td class="py-2.5 px-3">Attaque</td>
            <td class="py-2.5 px-3">Défense</td>
            <td class="py-2.5 px-3 text-center">Annonce</td>
            <td class="py-2.5 px-3 text-center">Bouts</td>
            <td class="py-2.5 px-3 text-center">Bonus</td>
            <td class="py-2.5 px-3 text-right">Points attaque</td>
            <td class="py-2.5 px-3 text-center">Faite</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="game in filteredGames" :key="game.numero">
            <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10 font-semibold">
              {{ game.numero }}
            </td>

            <!-- Attaque : preneur (rouge) + appelé (jaune) -->
            <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10">
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

            <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10">
              <div class="flex space-x-2">
                <PlayerAvatar
                  v-for="defenseur in game.defenseurs"
                  :key="defenseur"
                  :name="defenseur"
                  class="outline outline-2 outline-blue-500"
                />
              </div>
            </td>

            <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10 text-center">
              <span
                class="px-3 py-1 rounded-lg shadow whitespace-nowrap ring-1 ring-navy/20 dark:ring-white/30"
                :style="annonceStyle(game.annonce)"
              >
                {{ game.annonce }}
              </span>
            </td>

            <!-- Bouts de l'attaque -->
            <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10 font-semibold text-center whitespace-nowrap">
              <i
                v-for="n in 3"
                :key="n"
                :class="game.boutsAttaque >= n ? 'fa-solid' : 'fa-regular'"
                class="fa-square text-pine dark:text-chartreuse text-2xl mx-1"
              ></i>
            </td>

            <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10 text-center">
              <span
                v-for="bonus in gameBonuses(game)"
                :key="bonus"
                class="inline-block px-2 py-0.5 m-0.5 rounded-full bg-navy/10 dark:bg-white/10 text-xs font-semibold whitespace-nowrap"
              >
                {{ bonus }}
              </span>
            </td>

            <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10 font-semibold text-right whitespace-nowrap">
              {{ game.pointsAttaque.toFixed(1) }} / {{ game.pointsAFaire }}
            </td>

            <!-- Écart (PRIS/CHUTÉ DE) -->
            <td class="py-2.5 px-3 border-t border-t-navy/10 dark:border-t-white/10 font-semibold text-center">
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
import { ref, computed } from "vue";
import AppShell from "@/Components/AppShell.vue";
import PlayerAvatar from "@/Components/PlayerAvatar.vue";
import { useTarotData } from "@/composables/useTarotData";
import { deleteLastGame } from "@/services/sheets";
import { annonceStyle } from "@/services/avatars";

const { games, players, annonces, loading, error, lastGame, refresh } = useTarotData();

const filterPlayer = ref("");
const filterAnnonce = ref("");
const filterResultat = ref("");

const cancelling = ref(false);
const cancelError = ref(null);
const cancelSuccess = ref(null);

// Les plus récentes en premier
const sortedGames = computed(() => [...games.value].sort((a, b) => b.numero - a.numero));

const filteredGames = computed(() =>
  sortedGames.value.filter((game) => {
    if (
      filterPlayer.value &&
      game.preneur !== filterPlayer.value &&
      game.appele !== filterPlayer.value &&
      !game.defenseurs.includes(filterPlayer.value)
    ) {
      return false;
    }
    if (filterAnnonce.value && game.annonce !== filterAnnonce.value) return false;
    if (filterResultat.value === "fait" && !game.fait) return false;
    if (filterResultat.value === "chute" && game.fait) return false;
    return true;
  })
);

const cancelLastGame = async () => {
  const last = lastGame.value;
  if (!last) return;
  if (
    !window.confirm(
      `Annuler la partie n°${last.numero} (preneur : ${last.preneur}, ${last.annonce}) ?\n` +
        "Elle sera effacée du Google Sheet."
    )
  ) {
    return;
  }
  cancelError.value = null;
  cancelSuccess.value = null;
  cancelling.value = true;
  try {
    const result = await deleteLastGame();
    cancelSuccess.value = `Partie n°${result.deleted?.numero ?? last.numero} annulée.`;
    refresh();
  } catch (e) {
    cancelError.value = e.message || String(e);
  } finally {
    cancelling.value = false;
  }
};

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
