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

      <div class="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
      <!-- Classement -->
      <div class="xl:col-span-3 rounded-lg shadow-lg overflow-x-auto p-4 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <h2 class="text-2xl font-bold mb-4">Classement</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-left">
              <td class="p-3">#</td>
              <td class="p-3"></td>
              <td class="p-3">Joueur</td>
              <td class="p-3 text-right">Score</td>
              <td class="p-3 text-right hidden sm:table-cell">Participations</td>
              <td class="p-3 text-right hidden sm:table-cell">Victoires</td>
              <td class="p-3 text-right">% victoire</td>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, index) in rankedStandings"
              :key="entry.name"
              class="cursor-pointer"
              @click="$router.push(`/player/${encodeURIComponent(entry.name)}`)"
            >
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10">{{ index + 1 }}</td>
              <!-- Évolution du classement sur les 10 dernières parties -->
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-center">
                <span
                  v-if="rankEvolution[entry.name] > 0"
                  class="text-pine dark:text-chartreuse font-bold"
                  :title="`+${rankEvolution[entry.name]} place(s) sur les 10 dernières parties`"
                >▲{{ rankEvolution[entry.name] }}</span>
                <span
                  v-else-if="rankEvolution[entry.name] < 0"
                  class="text-red-600 dark:text-red-400 font-bold"
                  :title="`${rankEvolution[entry.name]} place(s) sur les 10 dernières parties`"
                >▼{{ -rankEvolution[entry.name] }}</span>
                <span v-else class="text-navy/40 dark:text-periwinkle/50">=</span>
              </td>
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
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right hidden sm:table-cell">
                {{ entry.participations }}
              </td>
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right hidden sm:table-cell">
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
      <div class="xl:col-span-2 rounded-lg shadow-lg overflow-x-auto p-4 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <h2 class="text-2xl font-bold mb-4">Annonces</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-left">
              <td class="p-3">Annonce</td>
              <td class="p-3 text-right">Occurrences</td>
              <td class="p-3 text-right hidden sm:table-cell">% des parties</td>
              <td class="p-3 text-right hidden sm:table-cell">Réussites</td>
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
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right hidden sm:table-cell">
                {{ percent(stat.count, games.length) }}
              </td>
              <td class="p-3 border-t border-t-navy/10 dark:border-t-white/10 text-right hidden sm:table-cell">
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

      <!-- Duos preneur → appelé -->
      <div class="rounded-lg shadow-lg p-4 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <h2 class="text-2xl font-bold mb-1">Duos</h2>
        <p class="text-sm text-navy/60 dark:text-periwinkle/80 mb-4">
          Preneur → appelé. Taux de réussite du contrat quand ils attaquent ensemble
          (minimum {{ MIN_DUO_GAMES }} parties pour les classements).
          <template v-if="duos.selfCalls">
            {{ duos.selfCalls }} auto-appel{{ duos.selfCalls > 1 ? "s" : "" }} au total.
          </template>
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 class="font-bold mb-2 text-navy/60 dark:text-periwinkle/80">Les plus fréquents</h3>
            <ul class="space-y-2">
              <li v-for="duo in duos.frequent" :key="duo.preneur + duo.appele" class="flex items-center gap-2">
                <PlayerAvatar :name="duo.preneur" size="xs" />
                <i class="fa-solid fa-arrow-right text-xs text-navy/40 dark:text-periwinkle/50"></i>
                <PlayerAvatar :name="duo.appele" size="xs" />
                <span class="text-sm flex-1 truncate">{{ duo.preneur }} → {{ duo.appele }}</span>
                <span class="text-sm font-bold whitespace-nowrap">{{ duo.count }}×</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold mb-2 text-pine dark:text-chartreuse">Les plus efficaces</h3>
            <ul class="space-y-2">
              <li v-for="duo in duos.best" :key="duo.preneur + duo.appele" class="flex items-center gap-2">
                <PlayerAvatar :name="duo.preneur" size="xs" />
                <i class="fa-solid fa-arrow-right text-xs text-navy/40 dark:text-periwinkle/50"></i>
                <PlayerAvatar :name="duo.appele" size="xs" />
                <span class="text-sm flex-1 truncate">{{ duo.preneur }} → {{ duo.appele }}</span>
                <span class="text-sm font-bold text-pine dark:text-chartreuse whitespace-nowrap">
                  {{ percent(duo.wins, duo.count) }} ({{ duo.count }}×)
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold mb-2 text-red-600 dark:text-red-400">Les moins efficaces</h3>
            <ul class="space-y-2">
              <li v-for="duo in duos.worst" :key="duo.preneur + duo.appele" class="flex items-center gap-2">
                <PlayerAvatar :name="duo.preneur" size="xs" />
                <i class="fa-solid fa-arrow-right text-xs text-navy/40 dark:text-periwinkle/50"></i>
                <PlayerAvatar :name="duo.appele" size="xs" />
                <span class="text-sm flex-1 truncate">{{ duo.preneur }} → {{ duo.appele }}</span>
                <span class="text-sm font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                  {{ percent(duo.wins, duo.count) }} ({{ duo.count }}×)
                </span>
              </li>
            </ul>
          </div>
        </div>
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
          <span class="sm:hidden">Faites défiler le tableau horizontalement.</span>
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

    </div>
  </AppShell>
</template>

<script setup>
import { computed } from "vue";
import AppShell from "@/Components/AppShell.vue";
import PlayerAvatar from "@/Components/PlayerAvatar.vue";
import { useTarotData } from "@/composables/useTarotData";
import { annonceStyle } from "@/services/avatars";
import { computeDuoStats, MIN_DUO_GAMES } from "@/services/duoStats";

const { games, annonces, players, standings, loading, error } = useTarotData();

const percent = (value, total) => (total ? `${((value / total) * 100).toFixed(0)}%` : "—");

const duos = computed(() => computeDuoStats(games.value));

// Évolution du classement par rapport à il y a 10 parties (comme l'onglet
// Graphiques de la feuille) : positif = a gagné des places.
const rankEvolution = computed(() => {
  const list = games.value;
  if (list.length < 2) return {};
  const rankAt = (game) =>
    players.value
      .map((name) => ({ name, score: game.cumulativeScores[name] ?? 0 }))
      .sort((a, b) => b.score - a.score)
      .reduce((acc, entry, index) => ((acc[entry.name] = index + 1), acc), {});
  const now = rankAt(list[list.length - 1]);
  const before = rankAt(list[Math.max(0, list.length - 1 - 10)]);
  const evolution = {};
  for (const name of players.value) evolution[name] = before[name] - now[name];
  return evolution;
});

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
        // comme la feuille : l'auto-appel compte aussi comme "appelé"
        if (isAppele) stat.appele++;
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
