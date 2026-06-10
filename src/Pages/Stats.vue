<template>
  <AppShell>
    <h1 class="text-4xl font-bold mb-6">Statistiques</h1>

    <div v-if="loading" class="rounded-lg shadow-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
      <div v-for="n in 5" :key="n" class="animate-pulse flex items-center space-x-4 py-2">
        <div class="bg-navy/10 dark:bg-white/10 h-4 w-1/3 mb-2"></div>
        <div class="bg-navy/10 dark:bg-white/10 h-4 w-1/4"></div>
      </div>
    </div>

    <p v-else-if="error" class="text-center text-red-600 dark:text-red-400 text-lg">{{ error }}</p>

    <div v-else class="space-y-8">
      <!-- Cartes de synthèse -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="rounded-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-4xl font-bold text-pine dark:text-chartreuse">{{ games.length }}</div>
          <div class="text-navy/60 dark:text-periwinkle/80 mt-1">Parties jouées</div>
        </div>
        <div class="rounded-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-4xl font-bold text-pine dark:text-chartreuse">{{ activePlayerCount }}</div>
          <div class="text-navy/60 dark:text-periwinkle/80 mt-1">Joueurs</div>
        </div>
        <div class="rounded-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-4xl font-bold text-red-600 dark:text-red-600 dark:text-red-400">
            {{ percent(attaqueWins, games.length) }}
          </div>
          <div class="text-navy/60 dark:text-periwinkle/80 mt-1">Victoires de l'attaque</div>
        </div>
        <div class="rounded-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-4xl font-bold text-blue-600 dark:text-periwinkle">
            {{ percent(games.length - attaqueWins, games.length) }}
          </div>
          <div class="text-navy/60 dark:text-periwinkle/80 mt-1">Victoires de la défense</div>
        </div>
      </div>

      <!-- Classement -->
      <div class="rounded-lg shadow-lg overflow-x-auto p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <h2 class="text-2xl font-bold mb-4">Classement</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-left">
              <td class="p-3">#</td>
              <td class="p-3">Joueur</td>
              <td class="p-3 text-right">Score</td>
              <td class="p-3 text-right">Participations</td>
              <td class="p-3 text-right">Victoires</td>
              <td class="p-3 text-right">% victoire</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in rankedStandings" :key="entry.name">
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10">{{ index + 1 }}</td>
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10">
                <div class="flex items-center space-x-3">
                  <PlayerAvatar :name="entry.name" size="sm" />
                  <span>{{ entry.name }}</span>
                </div>
              </td>
              <td
                class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right font-bold"
                :class="entry.score >= 0 ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
              >
                {{ entry.score.toFixed(1) }}
              </td>
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                {{ entry.participations }}
              </td>
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                {{ entry.victoires }}
              </td>
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                {{ percent(entry.victoires, entry.participations) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Stats par annonce -->
      <div class="rounded-lg shadow-lg overflow-x-auto p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <h2 class="text-2xl font-bold mb-4">Annonces</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-left">
              <td class="p-3">Annonce</td>
              <td class="p-3 text-right">Occurrences</td>
              <td class="p-3 text-right">% des parties</td>
              <td class="p-3 text-right">Réussites</td>
              <td class="p-3 text-right">% réussite</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stat in annonceStats" :key="stat.name">
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10">{{ stat.name }}</td>
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                {{ stat.count }}
              </td>
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                {{ percent(stat.count, games.length) }}
              </td>
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                {{ stat.wins }}
              </td>
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                {{ stat.count ? percent(stat.wins, stat.count) : "—" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { computed } from "vue";
import AppShell from "@/Components/AppShell.vue";
import PlayerAvatar from "@/Components/PlayerAvatar.vue";
import { useTarotData } from "@/composables/useTarotData";

const { games, annonces, standings, loading, error } = useTarotData();

const percent = (value, total) => (total ? `${((value / total) * 100).toFixed(0)}%` : "—");

const attaqueWins = computed(() => games.value.filter((game) => game.fait).length);

const rankedStandings = computed(() =>
  standings.value.filter((entry) => entry.participations > 0)
);

const activePlayerCount = computed(() => rankedStandings.value.length);

const annonceStats = computed(() =>
  annonces.value.map(({ name }) => {
    const played = games.value.filter((game) => game.annonce === name);
    return {
      name,
      count: played.length,
      wins: played.filter((game) => game.fait).length,
    };
  })
);
</script>
