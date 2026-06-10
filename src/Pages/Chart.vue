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
        <LineChart
          :key="isDark"
          :options="chartOptions"
          :chartData="chartDataFormatted"
          class="h-full"
        />
      </div>
    </template>
  </AppShell>
</template>

<script setup>
import { ref, computed } from "vue";
import AppShell from "@/Components/AppShell.vue";
import { LineChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";
import { useTarotData } from "@/composables/useTarotData";
import { useTheme } from "@/composables/useTheme";
import { playerColor, playerInitials } from "@/services/avatars";

Chart.register(...registerables);

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

// Un dataset par joueur affiché ; le cumul (colonnes BE.. de la feuille)
// est défini pour chaque manche. La fenêtre limite aux N dernières parties,
// "départ à zéro" rebase chaque joueur sur son cumul d'avant la fenêtre.
const chartDataFormatted = computed(() => {
  if (games.value.length === 0) return { labels: [], datasets: [] };

  const all = games.value;
  const start =
    windowSize.value === "all"
      ? 0
      : windowSize.value === "today"
      ? todayStartIndex.value ?? 0
      : Math.max(0, all.length - Number(windowSize.value));
  const window = all.slice(start);
  const previous = start > 0 ? all[start - 1] : null;

  return {
    labels: window.map((game) => `Partie ${game.numero}`),
    datasets: activePlayers.value
      .filter((name) => !hiddenPlayers.value.includes(name))
      .map((name) => {
        const baseline =
          zeroStart.value && previous ? previous.cumulativeScores[name] ?? 0 : 0;
        return {
          label: name,
          borderColor: playerColor(name),
          backgroundColor: playerColor(name) + "20",
          pointBorderColor: "#00000000",
          pointBackgroundColor: "#00000000",
          data: window.map((game) => (game.cumulativeScores[name] ?? 0) - baseline),
          fill: false,
          tension: 0.2,
          playerName: name,
        };
      }),
  };
});

// Sur mobile : marges réduites, polices plus petites, avatars compacts
const isNarrow = () => window.innerWidth < 768;

const chartOptions = computed(() => {
  const ink = isDark.value ? "#FFFFFF" : "#113B54";
  const grid = isDark.value ? "rgba(255, 255, 255, 0.2)" : "rgba(17, 59, 84, 0.15)";
  const narrow = isNarrow();
  const axis = {
    grid: { color: grid },
    ticks: {
      color: ink,
      font: { family: "'Poppins', sans-serif", size: narrow ? 10 : 12 },
    },
  };
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: 200,
    layout: {
      padding: {
        right: narrow ? 40 : 80,
      },
    },
    plugins: {
      // la légende est remplacée par les puces de filtre au-dessus du graphique
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        backgroundColor: isDark.value
          ? "rgba(10, 36, 52, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        titleColor: ink,
        bodyColor: ink,
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(1)} points`,
          labelColor: (tooltipItem) => ({
            borderColor: tooltipItem.dataset.borderColor,
            backgroundColor: tooltipItem.dataset.borderColor,
            borderWidth: 0,
            borderRadius: 4,
          }),
          itemSort: (a, b) => b.raw - a.raw,
        },
        padding: 12,
        caretSize: 6,
        caretPadding: 8,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: axis,
      y: axis,
    },
  };
});

// Avatar à initiales dessiné au bout de chaque ligne (remplace les photos
// de l'ancienne version : la feuille ne stocke que des noms).
const initialsAvatarPlugin = {
  id: "initialsAvatars",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset, i) => {
      if (!dataset.playerName) return;
      const meta = chart.getDatasetMeta(i);
      if (!meta || meta.hidden || !meta.data.length) return;

      const lastPoint = meta.data[meta.data.length - 1];
      const size = chart.width < 500 ? 22 : 30;
      const x = lastPoint.x + (chart.width < 500 ? 8 : 15) + size / 2;
      const y = lastPoint.y;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = playerColor(dataset.playerName);
      ctx.fill();
      ctx.strokeStyle = isDark.value ? "#113B54" : "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#113B54";
      ctx.font = `bold ${size < 30 ? 8 : 11}px Poppins, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(playerInitials(dataset.playerName), x, y + 1);
      ctx.restore();
    });
  },
};

Chart.register(initialsAvatarPlugin);
</script>
