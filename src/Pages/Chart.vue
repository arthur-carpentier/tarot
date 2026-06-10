<template>
  <AppShell>
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h1 class="text-4xl font-bold">Graphique d'évolution des points</h1>
      <router-link
        to="/new-game"
        class="bg-chartreuse px-4 py-2 rounded text-navy font-semibold shadow-md hover:brightness-95 transition"
      >
        + Ajouter une partie
      </router-link>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="loading" class="bg-watergreen dark:bg-navy p-6 rounded-lg shadow-lg h-[75vh]">
      <div class="h-full w-full relative">
        <div class="absolute inset-0 flex flex-col justify-between">
          <div v-for="n in 5" :key="n" class="flex items-center space-x-2 animate-pulse">
            <div class="bg-navy/20 dark:bg-white/20 h-2 w-1/5 rounded"></div>
            <div class="bg-navy/20 dark:bg-white/20 h-2 w-1/3 rounded"></div>
            <div class="bg-navy/20 dark:bg-white/20 h-2 w-1/4 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <p v-else-if="error" class="text-center text-red-600 dark:text-red-400 text-lg">{{ error }}</p>

    <p v-else-if="games.length === 0" class="text-center text-navy/60 dark:text-periwinkle/80 text-lg">
      Aucune partie enregistrée pour le moment.
    </p>

    <template v-else>
      <!-- Filtres : joueurs, fenêtre de parties -->
      <div class="flex flex-wrap gap-2 mb-4 items-center">
        <button
          v-for="name in activePlayers"
          :key="name"
          @click="togglePlayer(name)"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-navy/20 dark:ring-white/20 transition"
          :class="
            hiddenPlayers.includes(name)
              ? 'opacity-40 line-through bg-white dark:bg-white/5'
              : 'bg-white dark:bg-white/10'
          "
        >
          <span
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: playerColor(name) }"
          ></span>
          {{ name }}
        </button>
        <span class="mx-1 hidden md:inline text-navy/30 dark:text-white/30">|</span>
        <select v-model="windowSize" class="filter-select">
          <option value="all">Toutes les parties</option>
          <option v-if="todayStartIndex !== null" value="today">Aujourd'hui</option>
          <option value="50">50 dernières</option>
          <option value="20">20 dernières</option>
          <option value="10">10 dernières</option>
        </select>
        <label class="flex items-center gap-1.5 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="zeroStart"
            class="rounded border-navy/30 text-pine focus:ring-pine"
          />
          départ à zéro
        </label>
      </div>

      <div
        class="relative p-2 md:p-6 rounded-lg shadow-lg h-[60vh] md:h-[72vh] border border-navy/10 bg-watergreen dark:border-white/10 dark:bg-navy"
      >
        <VChart
          :option="chartOption"
          :update-options="{ notMerge: true }"
          autoresize
          class="h-full w-full"
        />
      </div>
    </template>
  </AppShell>
</template>

<script setup>
import { ref, computed } from "vue";
import AppShell from "@/Components/AppShell.vue";
import { VChart } from "@/services/echarts";
import { useTarotData } from "@/composables/useTarotData";
import { useTheme } from "@/composables/useTheme";
import { playerColor, playerInitials } from "@/services/avatars";

const { games, players, firstGameToday, loading, error } = useTarotData();

// Indice de la première partie de la journée : Graphiques!R3 contient la
// dernière partie d'AVANT la journée, le jour commence donc strictement après.
const todayStartIndex = computed(() => {
  if (!firstGameToday.value) return null;
  const index = games.value.findIndex((game) => game.numero > firstGameToday.value);
  return index >= 0 ? index : null;
});
const { isDark } = useTheme();

const windowSize = ref("all");
const zeroStart = ref(false);
const hiddenPlayers = ref([]);

const togglePlayer = (name) => {
  hiddenPlayers.value = hiddenPlayers.value.includes(name)
    ? hiddenPlayers.value.filter((n) => n !== name)
    : [...hiddenPlayers.value, name];
};

const activePlayers = computed(() =>
  players.value.filter((name) =>
    games.value.some((game) => game.scores[name] !== undefined)
  )
);

// Sur mobile : marges réduites, polices plus petites, avatars compacts
const isNarrow = () => typeof window !== "undefined" && window.innerWidth < 768;

// Une série par joueur affiché ; le cumul (colonnes BE.. de la feuille)
// est défini pour chaque manche. La fenêtre limite aux N dernières parties,
// "départ à zéro" rebase chaque joueur sur son cumul d'avant la fenêtre.
// L'avatar à initiales est dessiné par ECharts via `endLabel` (badge rond au
// bout de chaque courbe), ce qui remplace l'ancien plugin canvas de chart.js.
const chartOption = computed(() => {
  const ink = isDark.value ? "#FFFFFF" : "#113B54";
  const grid = isDark.value ? "rgba(255, 255, 255, 0.2)" : "rgba(17, 59, 84, 0.15)";
  const badgeStroke = isDark.value ? "#113B54" : "#FFFFFF";
  const narrow = isNarrow();
  const badge = narrow ? 22 : 30;
  const font = narrow ? 10 : 12;

  const all = games.value;
  const start =
    windowSize.value === "all"
      ? 0
      : windowSize.value === "today"
      ? todayStartIndex.value ?? 0
      : Math.max(0, all.length - Number(windowSize.value));
  const window = all.slice(start);
  const previous = start > 0 ? all[start - 1] : null;

  const series = activePlayers.value
    .filter((name) => !hiddenPlayers.value.includes(name))
    .map((name) => {
      const color = playerColor(name);
      const baseline =
        zeroStart.value && previous ? previous.cumulativeScores[name] ?? 0 : 0;
      return {
        name,
        type: "line",
        smooth: true,
        showSymbol: false,
        symbolSize: 6,
        lineStyle: { width: 2, color },
        itemStyle: { color },
        emphasis: { focus: "series" },
        data: window.map((game) => (game.cumulativeScores[name] ?? 0) - baseline),
        endLabel: {
          show: true,
          formatter: () => playerInitials(name),
          color: "#113B54",
          fontFamily: "Poppins, sans-serif",
          fontWeight: "bold",
          fontSize: narrow ? 9 : 11,
          backgroundColor: color,
          borderColor: badgeStroke,
          borderWidth: 2,
          borderRadius: badge / 2,
          width: badge,
          height: badge,
          align: "center",
          verticalAlign: "middle",
          lineHeight: badge,
          padding: 0,
          offset: [badge / 2 + (narrow ? 6 : 10), 0],
        },
      };
    });

  return {
    animationDuration: 200,
    // la légende est remplacée par les puces de filtre au-dessus du graphique
    grid: {
      left: 8,
      right: badge + (narrow ? 24 : 48),
      top: 16,
      bottom: 8,
      containLabel: true,
    },
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
      formatter: (params) => {
        const title = params[0]?.axisValueLabel ?? "";
        const rows = [...params]
          .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
          .map(
            (p) =>
              `<div style="display:flex;justify-content:space-between;gap:16px;line-height:1.6">` +
              `<span><span style="display:inline-block;width:8px;height:8px;border-radius:3px;background:${p.color};margin-right:6px"></span>${p.seriesName}</span>` +
              `<b>${Number(p.value ?? 0).toFixed(1)} pts</b></div>`
          )
          .join("");
        return `<div style="font-weight:600;margin-bottom:4px">${title}</div>${rows}`;
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: window.map((game) => `Partie ${game.numero}`),
      axisLine: { lineStyle: { color: grid } },
      axisTick: { show: false },
      axisLabel: { color: ink, fontFamily: "Poppins, sans-serif", fontSize: font },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisLabel: { color: ink, fontFamily: "Poppins, sans-serif", fontSize: font },
      splitLine: { lineStyle: { color: grid } },
    },
    series,
  };
});
</script>
