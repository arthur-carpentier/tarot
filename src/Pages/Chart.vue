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

    <div
      v-else
      class="relative p-6 rounded-lg shadow-lg h-[75vh] border border-navy/10 bg-watergreen dark:border-white/10 dark:bg-navy"
    >
      <LineChart
        :key="isDark"
        :options="chartOptions"
        :chartData="chartDataFormatted"
        class="h-full"
      />
    </div>
  </AppShell>
</template>

<script setup>
import { computed } from "vue";
import AppShell from "@/Components/AppShell.vue";
import { LineChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";
import { useTarotData } from "@/composables/useTarotData";
import { useTheme } from "@/composables/useTheme";
import { playerColor, playerInitials } from "@/services/avatars";

Chart.register(...registerables);

const { games, players, loading, error } = useTarotData();
const { isDark } = useTheme();

// Un dataset par joueur ayant participé à au moins une partie ;
// le cumul (colonnes BE.. de la feuille) est défini pour chaque manche.
const chartDataFormatted = computed(() => {
  if (games.value.length === 0) return { labels: [], datasets: [] };

  const labels = games.value.map((game) => `Partie ${game.numero}`);
  const activePlayers = players.value.filter((name) =>
    games.value.some((game) => game.scores[name] !== undefined)
  );

  return {
    labels,
    datasets: activePlayers.map((name) => ({
      label: name,
      borderColor: playerColor(name),
      backgroundColor: playerColor(name) + "20",
      pointBorderColor: "#00000000",
      pointBackgroundColor: "#00000000",
      data: games.value.map((game) => game.cumulativeScores[name] ?? 0),
      fill: false,
      tension: 0.2,
      playerName: name,
    })),
  };
});

const chartOptions = computed(() => {
  const ink = isDark.value ? "#FFFFFF" : "#113B54";
  const grid = isDark.value ? "rgba(255, 255, 255, 0.2)" : "rgba(17, 59, 84, 0.15)";
  const axis = {
    grid: { color: grid },
    ticks: {
      color: ink,
      font: { family: "'Poppins', sans-serif", size: 12 },
    },
  };
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: 200,
    layout: {
      padding: {
        right: 80,
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: ink,
          font: {
            family: "'Poppins', sans-serif",
            size: 14,
          },
        },
      },
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
      const size = 30;
      const x = lastPoint.x + 15 + size / 2;
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
      ctx.font = "bold 11px Poppins, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(playerInitials(dataset.playerName), x, y + 1);
      ctx.restore();
    });
  },
};

Chart.register(initialsAvatarPlugin);
</script>
