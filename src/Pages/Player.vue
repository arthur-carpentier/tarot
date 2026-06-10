<template>
  <AppShell>
    <div v-if="loading" class="rounded-lg shadow-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
      <div v-for="n in 5" :key="n" class="animate-pulse flex items-center space-x-4 py-2">
        <div class="bg-navy/10 dark:bg-white/10 h-4 w-1/3 mb-2"></div>
        <div class="bg-navy/10 dark:bg-white/10 h-4 w-1/4"></div>
      </div>
    </div>

    <p v-else-if="error" class="text-center text-red-600 dark:text-red-400 text-lg">{{ error }}</p>

    <p v-else-if="!stat" class="text-center text-navy/60 dark:text-periwinkle/80 text-lg">
      Joueur inconnu ou sans partie jouée.
    </p>

    <div v-else class="space-y-6">
      <!-- En-tête -->
      <div class="rounded-lg shadow-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <div class="flex items-center gap-4 flex-wrap">
          <PlayerAvatar :name="name" size="lg" />
          <div class="flex-1 min-w-0">
            <h1 class="text-3xl font-bold truncate">{{ name }}</h1>
            <p class="text-navy/60 dark:text-periwinkle/80">
              {{ rank }}<sup>{{ rank === 1 ? "er" : "e" }}</sup> au classement ·
              {{ stat.parties }} parties · {{ stat.victoires }}V /
              {{ stat.defaites }}D ({{ percent(stat.victoires, stat.parties) }})
            </p>
          </div>
          <div
            class="text-3xl font-bold"
            :class="score >= 0 ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
          >
            {{ score.toFixed(1) }}
          </div>
        </div>
      </div>

      <!-- Évolution personnelle -->
      <div class="rounded-lg shadow-lg p-2 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy h-[40vh]">
        <VChart :option="chartOption" :update-options="{ notMerge: true }" autoresize class="h-full w-full" />
      </div>

      <!-- Rôles et taux de victoire -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="rounded-lg p-4 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-2xl font-bold">{{ stat.preneur }}</div>
          <div class="text-sm text-navy/60 dark:text-periwinkle/80">fois preneur</div>
        </div>
        <div class="rounded-lg p-4 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-2xl font-bold">{{ stat.appele }}</div>
          <div class="text-sm text-navy/60 dark:text-periwinkle/80">fois appelé</div>
        </div>
        <div class="rounded-lg p-4 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-2xl font-bold">{{ stat.defense }}</div>
          <div class="text-sm text-navy/60 dark:text-periwinkle/80">fois en défense</div>
        </div>
        <div class="rounded-lg p-4 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-2xl font-bold">
            <span class="text-red-600 dark:text-red-400">{{ percent(stat.victoiresAttaque, stat.attaque) }}</span>
            /
            <span class="text-blue-600 dark:text-periwinkle">{{ percent(stat.victoiresDefense, stat.defense) }}</span>
          </div>
          <div class="text-sm text-navy/60 dark:text-periwinkle/80">victoires attaque / défense</div>
        </div>
      </div>

      <!-- Records perso -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="rounded-lg p-4 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-xl font-bold text-pine dark:text-chartreuse">
            {{ stat.plusGrosGain ? "+" + stat.plusGrosGain.score.toFixed(1) : "—" }}
          </div>
          <div class="text-sm text-navy/60 dark:text-periwinkle/80">
            plus gros gain<template v-if="stat.plusGrosGain">
              (partie {{ stat.plusGrosGain.numero }})</template
            >
          </div>
        </div>
        <div class="rounded-lg p-4 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-xl font-bold text-red-600 dark:text-red-400">
            {{ stat.plusGrossePerte ? stat.plusGrossePerte.score.toFixed(1) : "—" }}
          </div>
          <div class="text-sm text-navy/60 dark:text-periwinkle/80">
            plus grosse perte<template v-if="stat.plusGrossePerte">
              (partie {{ stat.plusGrossePerte.numero }})</template
            >
          </div>
        </div>
        <div class="rounded-lg p-4 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-xl font-bold text-pine dark:text-chartreuse">
            {{ stat.serieVictoires.length }}
          </div>
          <div class="text-sm text-navy/60 dark:text-periwinkle/80">victoires d'affilée (max)</div>
        </div>
        <div class="rounded-lg p-4 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-xl font-bold text-red-600 dark:text-red-400">
            {{ stat.serieDefaites.length }}
          </div>
          <div class="text-sm text-navy/60 dark:text-periwinkle/80">défaites d'affilée (max)</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <!-- Annonces en tant que preneur -->
        <div class="rounded-lg shadow-lg p-4 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
          <h2 class="text-xl font-bold mb-3">Ses annonces (preneur)</h2>
          <p v-if="!annonceBreakdown.length" class="text-navy/60 dark:text-periwinkle/80 text-sm">
            Jamais preneur pour l'instant.
          </p>
          <ul v-else class="space-y-2">
            <li v-for="entry in annonceBreakdown" :key="entry.name" class="flex items-center gap-3">
              <span
                class="px-2 py-0.5 rounded text-sm font-semibold ring-1 ring-navy/20 dark:ring-white/30 whitespace-nowrap"
                :style="annonceStyle(entry.name)"
              >
                {{ entry.name }}
              </span>
              <span class="flex-1 text-sm text-navy/60 dark:text-periwinkle/80">
                {{ entry.count }}× · {{ percent(entry.wins, entry.count) }} de réussite
              </span>
            </li>
          </ul>
        </div>

        <!-- Partenaires -->
        <div class="rounded-lg shadow-lg p-4 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
          <h2 class="text-xl font-bold mb-3">Ses appels</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-bold text-navy/60 dark:text-periwinkle/80 mb-2">Il appelle…</h3>
              <ul class="space-y-1.5">
                <li v-for="duo in calls" :key="duo.appele" class="flex items-center gap-2 text-sm">
                  <PlayerAvatar :name="duo.appele" size="xs" />
                  <span class="flex-1 truncate">{{ duo.appele }}</span>
                  <span class="font-semibold">{{ duo.count }}× ({{ percent(duo.wins, duo.count) }})</span>
                </li>
                <li v-if="!calls.length" class="text-sm text-navy/60 dark:text-periwinkle/80">—</li>
              </ul>
            </div>
            <div>
              <h3 class="text-sm font-bold text-navy/60 dark:text-periwinkle/80 mb-2">Appelé par…</h3>
              <ul class="space-y-1.5">
                <li v-for="duo in calledBy" :key="duo.preneur" class="flex items-center gap-2 text-sm">
                  <PlayerAvatar :name="duo.preneur" size="xs" />
                  <span class="flex-1 truncate">{{ duo.preneur }}</span>
                  <span class="font-semibold">{{ duo.count }}× ({{ percent(duo.wins, duo.count) }})</span>
                </li>
                <li v-if="!calledBy.length" class="text-sm text-navy/60 dark:text-periwinkle/80">—</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Dernières parties -->
      <div class="rounded-lg shadow-lg p-4 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <h2 class="text-xl font-bold mb-3">Ses dernières parties</h2>
        <ul class="space-y-2">
          <li
            v-for="entry in lastGames"
            :key="entry.numero"
            class="flex items-center gap-3 text-sm"
          >
            <span class="text-navy/50 dark:text-periwinkle/70 w-12 shrink-0">n°{{ entry.numero }}</span>
            <span
              class="px-2 py-0.5 rounded text-xs font-semibold ring-1 ring-navy/20 dark:ring-white/30 whitespace-nowrap"
              :style="annonceStyle(entry.annonce)"
            >
              {{ entry.annonce }}
            </span>
            <span class="flex-1 text-navy/60 dark:text-periwinkle/80 truncate">{{ entry.role }}</span>
            <span
              class="font-bold whitespace-nowrap"
              :class="entry.score >= 0 ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
            >
              {{ (entry.score >= 0 ? "+" : "") + entry.score.toFixed(1) }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppShell from "@/Components/AppShell.vue";
import PlayerAvatar from "@/Components/PlayerAvatar.vue";
import { VChart } from "@/services/echarts";
import { useTarotData } from "@/composables/useTarotData";
import { useTheme } from "@/composables/useTheme";
import { aggregatePlayers } from "@/services/seasonStats";
import { playerColor, annonceStyle } from "@/services/avatars";

const route = useRoute();
const { games, players, annonces, standings, loading, error } = useTarotData();
const { isDark } = useTheme();

const name = computed(() => decodeURIComponent(route.params.name));

const percent = (value, total) => (total ? `${((value / total) * 100).toFixed(0)}%` : "—");

const stat = computed(
  () => aggregatePlayers(games.value, players.value).find((s) => s.name === name.value) || null
);

const rank = computed(
  () => standings.value.findIndex((entry) => entry.name === name.value) + 1
);

const score = computed(
  () => standings.value.find((entry) => entry.name === name.value)?.score ?? 0
);

const playedGames = computed(() =>
  games.value.filter(
    (g) =>
      g.preneur === name.value ||
      g.appele === name.value ||
      g.defenseurs.includes(name.value)
  )
);

const annonceBreakdown = computed(() =>
  annonces.value
    .map(({ name: annonce }) => {
      const taken = games.value.filter(
        (g) => g.preneur === name.value && g.annonce === annonce
      );
      return {
        name: annonce,
        count: taken.length,
        wins: taken.filter((g) => g.fait).length,
      };
    })
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count)
);

const duoList = (filter, key) => {
  const map = new Map();
  for (const g of games.value) {
    if (!g.appele || g.appele === g.preneur || !filter(g)) continue;
    const other = g[key];
    const duo = map.get(other) || { [key]: other, count: 0, wins: 0 };
    duo.count++;
    if (g.fait) duo.wins++;
    map.set(other, duo);
  }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 5);
};

const calls = computed(() => duoList((g) => g.preneur === name.value, "appele"));
const calledBy = computed(() => duoList((g) => g.appele === name.value, "preneur"));

const lastGames = computed(() =>
  [...playedGames.value]
    .slice(-10)
    .reverse()
    .map((g) => ({
      numero: g.numero,
      annonce: g.annonce,
      score: g.scores[name.value] ?? 0,
      role:
        g.preneur === name.value
          ? "preneur"
          : g.appele === name.value
          ? "appelé"
          : "défense",
    }))
);

const chartOption = computed(() => {
  const ink = isDark.value ? "#FFFFFF" : "#113B54";
  const grid = isDark.value ? "rgba(255, 255, 255, 0.2)" : "rgba(17, 59, 84, 0.15)";
  const color = playerColor(name.value);
  return {
    animationDuration: 200,
    grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      backgroundColor: isDark.value
        ? "rgba(10, 36, 52, 0.95)"
        : "rgba(255, 255, 255, 0.95)",
      borderColor: isDark.value ? "rgba(255,255,255,0.15)" : "rgba(17,59,84,0.15)",
      borderWidth: 1,
      textStyle: { color: ink, fontFamily: "Poppins, sans-serif" },
      extraCssText: "border-radius:8px;",
      axisPointer: { type: "line", lineStyle: { color: grid } },
      valueFormatter: (value) => `${Number(value ?? 0).toFixed(1)} points`,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: games.value.map((g) => `Partie ${g.numero}`),
      axisLine: { lineStyle: { color: grid } },
      axisTick: { show: false },
      axisLabel: { color: ink, fontFamily: "Poppins, sans-serif", fontSize: 10 },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisLabel: { color: ink, fontFamily: "Poppins, sans-serif", fontSize: 10 },
      splitLine: { lineStyle: { color: grid } },
    },
    series: [
      {
        name: name.value,
        type: "line",
        smooth: true,
        showSymbol: false,
        symbolSize: 6,
        lineStyle: { width: 2, color },
        itemStyle: { color },
        areaStyle: { color, opacity: 0.18 },
        data: games.value.map((g) => g.cumulativeScores[name.value] ?? 0),
      },
    ],
  };
});
</script>
