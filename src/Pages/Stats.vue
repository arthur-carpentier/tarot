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
          <div class="text-4xl font-bold text-red-600 dark:text-red-400">
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
      <div class="rounded-lg shadow-lg overflow-x-auto p-4 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
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

      <!-- Records : plus gros gains / plus grosses pertes sur une manche -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="rounded-lg shadow-lg p-4 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
          <h2 class="text-2xl font-bold mb-4">
            <i class="fa-solid fa-arrow-trend-up text-pine dark:text-chartreuse mr-2"></i>Plus gros gains
          </h2>
          <ul class="space-y-3">
            <li
              v-for="record in topGains"
              :key="record.player + record.numero"
              class="flex items-center gap-3"
            >
              <PlayerAvatar :name="record.player" size="sm" />
              <div class="flex-1 min-w-0">
                <span class="font-semibold">{{ record.player }}</span>
                <span class="text-sm text-navy/60 dark:text-periwinkle/80">
                  — partie {{ record.numero }}, {{ record.annonce }}
                </span>
              </div>
              <span class="font-bold text-pine dark:text-chartreuse whitespace-nowrap">
                +{{ record.score.toFixed(1) }}
              </span>
            </li>
          </ul>
        </div>

        <div class="rounded-lg shadow-lg p-4 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
          <h2 class="text-2xl font-bold mb-4">
            <i class="fa-solid fa-arrow-trend-down text-red-600 dark:text-red-400 mr-2"></i>Plus grosses pertes
          </h2>
          <ul class="space-y-3">
            <li
              v-for="record in topLosses"
              :key="record.player + record.numero"
              class="flex items-center gap-3"
            >
              <PlayerAvatar :name="record.player" size="sm" />
              <div class="flex-1 min-w-0">
                <span class="font-semibold">{{ record.player }}</span>
                <span class="text-sm text-navy/60 dark:text-periwinkle/80">
                  — partie {{ record.numero }}, {{ record.annonce }}
                </span>
              </div>
              <span class="font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                {{ record.score.toFixed(1) }}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Détail par joueur (comme l'onglet Statistiques de la feuille) -->
      <div class="rounded-lg shadow-lg p-4 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <h2 class="text-2xl font-bold mb-1">Détail par joueur</h2>
        <p class="text-sm text-navy/60 dark:text-periwinkle/80 mb-4">
          Rôles joués et taux de victoire selon le camp.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse whitespace-nowrap">
            <thead>
              <tr class="text-left">
                <td class="p-3">Joueur</td>
                <td class="p-3 text-right">Parties</td>
                <td class="p-3 text-right">Particip.</td>
                <td class="p-3 text-right">Preneur</td>
                <td class="p-3 text-right">Appelé</td>
                <td class="p-3 text-right">Défense</td>
                <td class="p-3 text-right">Vict. attaque</td>
                <td class="p-3 text-right">Vict. défense</td>
                <td class="p-3 text-right">Vict. global</td>
                <td class="p-3 text-right">Max gain</td>
                <td class="p-3 text-right">Max perte</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stat in playerDetails" :key="stat.name">
                <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10">
                  <div class="flex items-center space-x-2">
                    <PlayerAvatar :name="stat.name" size="xs" />
                    <span>{{ stat.name }}</span>
                  </div>
                </td>
                <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">{{ stat.parties }}</td>
                <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                  {{ percent(stat.parties, games.length) }}
                </td>
                <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">{{ stat.preneur }}</td>
                <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">{{ stat.appele }}</td>
                <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">{{ stat.defense }}</td>
                <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                  {{ percent(stat.victoiresAttaque, stat.attaque) }}
                </td>
                <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right">
                  {{ percent(stat.victoiresDefense, stat.defense) }}
                </td>
                <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right font-bold">
                  {{ percent(stat.victoires, stat.parties) }}
                </td>
                <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right text-pine dark:text-chartreuse">
                  {{ stat.maxGain !== null ? "+" + stat.maxGain.toFixed(1) : "—" }}
                </td>
                <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right text-red-600 dark:text-red-400">
                  {{ stat.maxPerte !== null ? stat.maxPerte.toFixed(1) : "—" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Stats par annonce -->
      <div class="rounded-lg shadow-lg overflow-x-auto p-4 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
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
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10">
                <span
                  class="px-2 py-0.5 rounded ring-1 ring-navy/20 dark:ring-white/30 text-sm font-semibold"
                  :style="annonceStyle(stat.name)"
                >
                  {{ stat.name }}
                </span>
              </td>
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
import { annonceStyle } from "@/services/avatars";

const { games, annonces, players, standings, loading, error } = useTarotData();

const percent = (value, total) => (total ? `${((value / total) * 100).toFixed(0)}%` : "—");

const attaqueWins = computed(() => games.value.filter((game) => game.fait).length);

const rankedStandings = computed(() =>
  standings.value.filter((entry) => entry.participations > 0)
);

const activePlayerCount = computed(() => rankedStandings.value.length);

// Toutes les paires (joueur, manche) avec le score de la manche
const allScores = computed(() =>
  games.value.flatMap((game) =>
    Object.entries(game.scores).map(([player, score]) => ({
      player,
      score,
      numero: game.numero,
      annonce: game.annonce,
    }))
  )
);

const topGains = computed(() =>
  [...allScores.value].sort((a, b) => b.score - a.score).slice(0, 5)
);

const topLosses = computed(() =>
  [...allScores.value].sort((a, b) => a.score - b.score).slice(0, 5)
);

// Équivalent du tableau par joueur de l'onglet "Statistiques"
const playerDetails = computed(() =>
  players.value
    .map((name) => {
      const stat = {
        name,
        parties: 0,
        preneur: 0,
        appele: 0,
        defense: 0,
        attaque: 0,
        victoires: 0,
        victoiresAttaque: 0,
        victoiresDefense: 0,
        maxGain: null,
        maxPerte: null,
      };
      games.value.forEach((game) => {
        const isPreneur = game.preneur === name;
        const isAppele = game.appele === name;
        const isDefense = game.defenseurs.includes(name);
        if (!isPreneur && !isAppele && !isDefense) return;
        const score = game.scores[name] ?? 0;
        stat.parties++;
        if (isPreneur) stat.preneur++;
        if (isAppele && !isPreneur) stat.appele++;
        if (isDefense) stat.defense++;
        if (isPreneur || isAppele) stat.attaque++;
        const win = score > 0;
        if (win) {
          stat.victoires++;
          if (isPreneur || isAppele) stat.victoiresAttaque++;
          else stat.victoiresDefense++;
        }
        if (score > 0 && (stat.maxGain === null || score > stat.maxGain)) stat.maxGain = score;
        if (score < 0 && (stat.maxPerte === null || score < stat.maxPerte)) stat.maxPerte = score;
      });
      return stat;
    })
    .filter((stat) => stat.parties > 0)
    .sort((a, b) => b.parties - a.parties)
);

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
