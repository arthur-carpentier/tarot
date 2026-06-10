<template>
  <AppShell>
    <div v-if="loading" class="rounded-lg shadow-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
      <div v-for="n in 5" :key="n" class="animate-pulse flex items-center space-x-4 py-2">
        <div class="bg-navy/10 dark:bg-white/10 h-4 w-1/3 mb-2"></div>
        <div class="bg-navy/10 dark:bg-white/10 h-4 w-1/4"></div>
      </div>
    </div>

    <p v-else-if="error" class="text-center text-red-600 dark:text-red-400 text-lg">{{ error }}</p>

    <div v-else class="space-y-8">
      <!-- En-tête de saison -->
      <div class="rounded-lg shadow-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
        <h1 class="text-4xl font-bold">
          {{ seasonMeta?.numero ? `Saison ${seasonMeta.numero}` : "Carte résumée" }}
        </h1>
        <p v-if="seasonMeta?.debut && seasonMeta?.fin" class="text-navy/60 dark:text-periwinkle/80 mt-1">
          du {{ formatDate(seasonMeta.debut) }} au {{ formatDate(seasonMeta.fin) }}
        </p>
        <p class="mt-2 text-2xl font-bold text-pine dark:text-chartreuse">
          {{ games.length }} parties
        </p>
      </div>

      <!-- Podium -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="entry in podium"
          :key="entry.title"
          class="rounded-lg shadow-lg p-5 border bg-watergreen dark:bg-navy text-center"
          :class="entry.highlight
            ? 'border-2 border-chartreuse'
            : 'border-navy/10 dark:border-white/10'"
        >
          <div class="text-3xl mb-1">{{ entry.emoji }}</div>
          <div class="text-xs uppercase tracking-wide text-navy/50 dark:text-periwinkle/70 font-semibold">
            {{ entry.title }}
          </div>
          <div class="flex items-center justify-center gap-2 mt-2">
            <PlayerAvatar :name="entry.player.name" size="sm" />
            <span class="font-bold text-lg">{{ entry.player.name }}</span>
          </div>
          <div
            class="text-2xl font-bold mt-2"
            :class="entry.player.score >= 0 ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
          >
            {{ entry.player.score.toFixed(1) }}
          </div>
          <div class="text-sm text-navy/60 dark:text-periwinkle/80 mt-1">
            {{ entry.player.parties }} parties ·
            {{ entry.player.victoires }}V / {{ entry.player.defaites }}D
            ({{ percent(entry.player.victoires, entry.player.parties) }})
          </div>
        </div>
      </div>

      <!-- Records de score cumulé + attaque/défense -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="rounded-lg shadow-lg p-5 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-xs uppercase tracking-wide text-navy/50 dark:text-periwinkle/70 font-semibold mb-2">
            Plus haut score atteint
          </div>
          <div class="flex items-center justify-center gap-2">
            <PlayerAvatar :name="awards.toutTempsHaut.player" size="sm" />
            <span class="font-bold">{{ awards.toutTempsHaut.player }}</span>
          </div>
          <div class="text-2xl font-bold text-pine dark:text-chartreuse mt-1">
            {{ awards.toutTempsHaut.value.toFixed(1) }}
          </div>
        </div>
        <div class="rounded-lg shadow-lg p-5 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-xs uppercase tracking-wide text-navy/50 dark:text-periwinkle/70 font-semibold mb-2">
            Plus bas score atteint
          </div>
          <div class="flex items-center justify-center gap-2">
            <PlayerAvatar :name="awards.toutTempsBas.player" size="sm" />
            <span class="font-bold">{{ awards.toutTempsBas.player }}</span>
          </div>
          <div class="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {{ awards.toutTempsBas.value.toFixed(1) }}
          </div>
        </div>
        <div class="rounded-lg shadow-lg p-5 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
          <div class="text-xs uppercase tracking-wide text-navy/50 dark:text-periwinkle/70 font-semibold mb-3 text-center">
            Victoires attaque vs défense
          </div>
          <div class="flex justify-between text-sm font-bold mb-1">
            <span class="text-red-600 dark:text-red-400">Attaque {{ percent(attaqueWins, games.length) }}</span>
            <span class="text-blue-600 dark:text-periwinkle">{{ percent(games.length - attaqueWins, games.length) }} Défense</span>
          </div>
          <div class="h-4 rounded-full overflow-hidden flex ring-1 ring-navy/10 dark:ring-white/10">
            <div class="bg-red-600 h-full" :style="{ width: (attaqueWins / games.length) * 100 + '%' }"></div>
            <div class="bg-blue-600 h-full flex-1"></div>
          </div>
        </div>
      </div>

      <!-- Titres -->
      <div>
        <h2 class="text-2xl font-bold mb-4">Les titres de la saison</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="card in awardCards"
            :key="card.title"
            class="rounded-lg shadow p-4 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy flex items-center gap-3"
          >
            <div class="text-2xl w-10 text-center shrink-0">{{ card.emoji }}</div>
            <div class="flex-1 min-w-0">
              <div class="font-bold">{{ card.title }}</div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <PlayerAvatar :name="card.player" size="xs" />
                <span class="font-semibold text-sm">{{ card.player }}</span>
                <span class="font-bold text-sm ml-1" :class="card.negative ? 'text-red-600 dark:text-red-400' : 'text-pine dark:text-chartreuse'">
                  {{ card.value }}
                </span>
              </div>
              <div class="text-xs text-navy/50 dark:text-periwinkle/70 mt-0.5 truncate">
                {{ card.desc }}
              </div>
            </div>
          </div>
        </div>
        <p class="text-xs text-navy/50 dark:text-periwinkle/70 mt-3">
          Les titres en pourcentage ne prennent en compte que les joueurs ayant joué au
          moins {{ MIN_PARTIES }} parties (comme dans la feuille).
        </p>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import AppShell from "@/Components/AppShell.vue";
import PlayerAvatar from "@/Components/PlayerAvatar.vue";
import { useTarotData } from "@/composables/useTarotData";
import { fetchSeasonMeta } from "@/services/sheets";
import { computeSeasonStats, MIN_PARTIES } from "@/services/seasonStats";

const { games, players, lastGame, loading, error } = useTarotData();

const seasonMeta = ref(null);
onMounted(async () => {
  seasonMeta.value = await fetchSeasonMeta();
});

const percent = (value, total) => (total ? `${((value / total) * 100).toFixed(0)}%` : "—");
const formatDate = (date) =>
  date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

const season = computed(() =>
  computeSeasonStats(games.value, players.value, lastGame.value)
);

const attaqueWins = computed(() => games.value.filter((game) => game.fait).length);

const podium = computed(() => {
  const ranking = season.value.ranking;
  if (ranking.length < 2) return [];
  const entries = [
    { title: "Premier", emoji: "🥇", player: ranking[0], highlight: true },
    { title: "Deuxième", emoji: "🥈", player: ranking[1] },
  ];
  if (ranking.length > 3) entries.push({ title: "Troisième", emoji: "🥉", player: ranking[2] });
  entries.push({ title: "Dernier", emoji: "🪦", player: ranking[ranking.length - 1] });
  return entries;
});

const awards = computed(() => season.value.awards);

const pct = (a) => `${a.value.toFixed(1).replace(".0", "")}%`;

// Les titres de la "Carte résumée", avec leur définition
const awardCards = computed(() => {
  const a = awards.value;
  const cards = [
    a.toujoursPresent && {
      emoji: "📅", title: "Toujours présent", player: a.toujoursPresent.player,
      value: `${a.toujoursPresent.value} parties`, desc: "le plus de participations",
    },
    a.victorieux && {
      emoji: "🏆", title: "Victorieux", player: a.victorieux.player,
      value: pct(a.victorieux), desc: "meilleur taux de victoire",
    },
    a.plusPerdant && {
      emoji: "🫠", title: "Malchanceux", player: a.plusPerdant.player,
      value: pct(a.plusPerdant), desc: "plus faible taux de victoire", negative: true,
    },
    a.gainsReguliers && {
      emoji: "📈", title: "Gains réguliers", player: a.gainsReguliers.player,
      value: `${a.gainsReguliers.value} victoires`, desc: "le plus de victoires au total",
    },
    a.pertesFrequentes && {
      emoji: "📉", title: "Pertes fréquentes", player: a.pertesFrequentes.player,
      value: `${a.pertesFrequentes.value} défaites`, desc: "le plus de défaites au total", negative: true,
    },
    a.plusGrosGain && {
      emoji: "💰", title: "Plus gros gain", player: a.plusGrosGain.player,
      value: `+${a.plusGrosGain.value.toFixed(1)} pts`,
      desc: `partie ${a.plusGrosGain.stat.plusGrosGain.numero}, ${a.plusGrosGain.stat.plusGrosGain.annonce}`,
    },
    a.plusGrossePerte && {
      emoji: "💸", title: "Plus grosse perte", player: a.plusGrossePerte.player,
      value: `${a.plusGrossePerte.value.toFixed(1)} pts`,
      desc: `partie ${a.plusGrossePerte.stat.plusGrossePerte.numero}, ${a.plusGrossePerte.stat.plusGrossePerte.annonce}`,
      negative: true,
    },
    a.gainsSolides && {
      emoji: "🧱", title: "Gains solides", player: a.gainsSolides.player,
      value: `+${a.gainsSolides.value.toFixed(1)} pts`, desc: "en moyenne par victoire",
    },
    a.pertesConsequentes && {
      emoji: "🕳️", title: "Pertes conséquentes", player: a.pertesConsequentes.player,
      value: `${a.pertesConsequentes.value.toFixed(1)} pts`, desc: "en moyenne par défaite", negative: true,
    },
    a.serieVictoires && {
      emoji: "🔥", title: "Plus longue série de victoires", player: a.serieVictoires.player,
      value: `${a.serieVictoires.value} d'affilée`,
      desc: `+${a.serieVictoires.stat.serieVictoires.points.toFixed(1)} pts sur la série`,
    },
    a.serieDefaites && {
      emoji: "🥶", title: "Plus longue série de défaites", player: a.serieDefaites.player,
      value: `${a.serieDefaites.value} d'affilée`,
      desc: `${a.serieDefaites.stat.serieDefaites.points.toFixed(1)} pts sur la série`, negative: true,
    },
    a.meilleurAttaquant && {
      emoji: "⚔️", title: "Meilleur attaquant", player: a.meilleurAttaquant.player,
      value: pct(a.meilleurAttaquant), desc: "taux de victoire en attaque",
    },
    a.pireAttaquant && {
      emoji: "🗡️", title: "Pire attaquant", player: a.pireAttaquant.player,
      value: pct(a.pireAttaquant), desc: "taux de victoire en attaque", negative: true,
    },
    a.meilleurDefenseur && {
      emoji: "🛡️", title: "Meilleur défenseur", player: a.meilleurDefenseur.player,
      value: pct(a.meilleurDefenseur), desc: "taux de victoire en défense",
    },
    a.pireDefenseur && {
      emoji: "🥀", title: "Pire défenseur", player: a.pireDefenseur.player,
      value: pct(a.pireDefenseur), desc: "taux de victoire en défense", negative: true,
    },
    a.attaquantDansLAme && {
      emoji: "🚩", title: "Attaquant dans l'âme", player: a.attaquantDansLAme.player,
      value: pct(a.attaquantDansLAme), desc: "joue le plus souvent en attaque",
    },
    a.defenseurDansLAme && {
      emoji: "🏰", title: "Défenseur dans l'âme", player: a.defenseurDansLAme.player,
      value: pct(a.defenseurDansLAme), desc: "joue le plus souvent en défense",
    },
    a.preneurDansLAme && {
      emoji: "🫴", title: "Appelant", player: a.preneurDansLAme.player,
      value: pct(a.preneurDansLAme), desc: "taux de prise quand il attaque",
    },
    a.roiDansLAme && {
      emoji: "👑", title: "Royal", player: a.roiDansLAme.player,
      value: pct(a.roiDansLAme), desc: "se fait appeler le plus souvent",
    },
    a.entretenu && {
      emoji: "🍼", title: "Entretenu", player: a.entretenu.player,
      value: pct(a.entretenu), desc: "part de ses gains réalisée comme appelé",
    },
    a.sabote && {
      emoji: "🧨", title: "Saboté", player: a.sabote.player,
      value: pct(a.sabote), desc: "part de ses pertes subie comme appelé", negative: true,
    },
  ];
  return cards.filter(Boolean);
});
</script>
