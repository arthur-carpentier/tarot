<template>
  <div
    class="flex min-h-screen bg-green-900 text-white"
    style="font-family: 'Poppins', sans-serif"
  >
    <Sidebar class="fixed" />

    <main class="ml-64 flex-1 px-6 py-10 relative">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold">Graphique d'évolution des points</h1>
        <Link
          href="/new-game"
          class="bg-blue-500 px-4 py-2 rounded text-white font-semibold shadow-md hover:bg-blue-600 transition"
        >
          + Ajouter une partie
        </Link>
      </div>

      <!-- Skeleton Loader -->
      <div v-if="loading" class="bg-green-800 p-6 rounded-lg shadow-lg h-[75vh]">
        <div class="h-full w-full relative">
          <div class="absolute inset-0 flex flex-col justify-between">
            <div
              v-for="n in 5"
              :key="n"
              class="flex items-center space-x-2 animate-pulse"
            >
              <div class="bg-gray-500 h-2 w-1/5 rounded"></div>
              <div class="bg-gray-500 h-2 w-1/3 rounded"></div>
              <div class="bg-gray-500 h-2 w-1/4 rounded"></div>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 flex justify-between">
            <div
              v-for="n in 6"
              :key="n"
              class="bg-gray-500 h-6 w-10 rounded animate-pulse"
            ></div>
          </div>
        </div>
      </div>

      <!-- Si aucune partie -->
      <p v-else-if="chartData.length === 0" class="text-center text-gray-300 text-lg">
        Aucune partie enregistrée pour le moment.
      </p>

      <!-- Graphique des parties -->
      <div
        v-else
        class="relative p-6 rounded-lg shadow-lg h-[75vh]"
        :style="{ backgroundColor: '#221E22' }"
      >
        <LineChart :options="chartOptions" :chartData="chartDataFormatted" class="h-full" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Sidebar from "@/Components/SideBar.vue";
import { LineChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";
import { Link } from "@inertiajs/vue3";

// Register Chart.js components
Chart.register(...registerables);

const chartData = ref([]);
const loading = ref(true);

onMounted(async () => {
  await fetchChartData();
});

const fetchChartData = async () => {
  loading.value = true;
  try {
    const response = await fetch("/api/chart");
    chartData.value = response.status === 204 ? [] : await response.json();
  } catch (error) {
    console.error("Erreur de récupération des parties :", error);
  } finally {
    loading.value = false;
  }
};

// Computed property to transform API data into Chart.js format
const chartDataFormatted = computed(() => {
  if (chartData.value.length === 0) return {};

  const labels =
    chartData.value[0]?.games_data.map((game) => `Partie ${game.game_id}`) || [];

  return {
    labels,
    datasets: chartData.value.map((player) => ({
      label: player.name,
      borderColor: player.color,
      backgroundColor: player.color + "20",
      data: player.games_data.map((game) => game.cumulated_total_points),
      fill: false,
      tension: 0.2,
      playerPhoto: `/storage/${player.photo}`,
    })),
  };
});

// Chart.js options with proper styles
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      right: 80, // Ensure more space for images
    },
    backgroundColor: "#221E22",
  },
  plugins: {
    legend: {
      display: true,
      labels: {
        color: "#FFFFFF", // Force white
        font: {
          family: "'Poppins', sans-serif", // Ensure Poppins
          size: 14,
        },
      },
    },
    tooltip: {
      mode: "index",
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: {
        color: "rgba(255, 255, 255, 0.2)", // Softer grid color
      },
      ticks: {
        color: "#FFFFFF",
        font: {
          family: "'Poppins', sans-serif",
          size: 12,
        },
      },
    },
    y: {
      grid: {
        color: "rgba(255, 255, 255, 0.2)",
      },
      ticks: {
        color: "#FFFFFF",
        font: {
          family: "'Poppins', sans-serif",
          size: 12,
        },
      },
    },
  },
};

// Custom plugin to draw player images at the end of their lines
const customImagesPlugin = {
  id: "customImages",
  beforeInit(chart) {
    // Cache images to avoid multiple reloads
    chart.imageCache = new Map();
  },
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const datasets = chart.data.datasets;
    datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      if (!meta || !meta.data.length) return;

      const lastPoint = meta.data[meta.data.length - 1]; // Get last point of the line

      // Check if image is already cached
      if (!chart.imageCache.has(dataset.playerPhoto)) {
        const img = new Image();
        img.src = dataset.playerPhoto;
        chart.imageCache.set(dataset.playerPhoto, img);
      }

      const img = chart.imageCache.get(dataset.playerPhoto);
      if (!img.complete) return; // Ensure image is loaded

      const imgSize = 35;
      const xOffset = 15;
      const yOffset = imgSize / 2;

      // Draw rounded image
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        lastPoint.x + xOffset + imgSize / 2,
        lastPoint.y,
        imgSize / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, lastPoint.x + xOffset, lastPoint.y - yOffset, imgSize, imgSize);
      ctx.restore();

      // Add outline matching player's line color
      ctx.strokeStyle = dataset.borderColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        lastPoint.x + xOffset + imgSize / 2,
        lastPoint.y,
        imgSize / 2,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    });
  },
};

// Register the optimized plugin
Chart.register(customImagesPlugin);
</script>
