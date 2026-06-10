<template>
  <AppShell>
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h1 class="text-4xl font-bold">Film de la saison</h1>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="loading" class="bg-watergreen dark:bg-navy p-6 rounded-lg shadow-lg h-[60vh]">
      <div v-for="n in 6" :key="n" class="animate-pulse flex items-center space-x-4 py-3">
        <div class="bg-navy/10 dark:bg-white/10 h-4 w-1/4 rounded"></div>
        <div class="bg-navy/10 dark:bg-white/10 h-4 w-1/2 rounded"></div>
      </div>
    </div>

    <p v-else-if="error" class="text-center text-red-600 dark:text-red-400 text-lg">{{ error }}</p>

    <p v-else-if="games.length === 0" class="text-center text-navy/60 dark:text-periwinkle/80 text-lg">
      Aucune partie enregistrée pour le moment.
    </p>

    <template v-else>
      <!-- Transport : lecture, recommencer, vitesse, position -->
      <div
        class="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy"
      >
        <button
          @click="togglePlay"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-chartreuse text-navy font-semibold shadow hover:brightness-95 transition"
        >
          <PauseIcon v-if="playing" class="w-5 h-5" />
          <PlayIcon v-else class="w-5 h-5" />
          {{ playing ? "Pause" : atEnd ? "Revoir" : "Lecture" }}
        </button>
        <button
          @click="restart"
          class="p-2 rounded-lg hover:bg-periwinkle/40 dark:hover:bg-white/10 transition"
          title="Revenir au début"
        >
          <RewindIcon class="w-5 h-5" />
        </button>
        <select v-model.number="speed" class="filter-select" title="Vitesse de lecture">
          <option :value="0.5">×0,5</option>
          <option :value="1">×1</option>
          <option :value="2">×2</option>
          <option :value="4">×4</option>
          <option :value="8">×8</option>
        </select>
        <input
          type="range"
          min="0"
          :max="games.length"
          v-model.number="cursor"
          class="flex-1 min-w-[140px] accent-pine dark:accent-chartreuse cursor-pointer"
          aria-label="Position dans la saison"
        />
        <span class="text-sm font-semibold tabular-nums whitespace-nowrap">
          <template v-if="cursor === 0">Départ</template>
          <template v-else>Partie {{ games[cursor - 1].numero }}</template>
          <span class="text-navy/50 dark:text-periwinkle/70 font-normal">
            · {{ cursor }} / {{ games.length }}</span
          >
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <!-- Classement animé : les barres s'échangent leurs positions -->
        <div
          class="p-2 md:p-6 rounded-lg shadow-lg border border-navy/10 bg-watergreen dark:border-white/10 dark:bg-navy"
        >
          <h2 class="text-xl font-bold px-2 pt-2 md:px-0 md:pt-0 mb-2">Classement</h2>
          <VChart :option="raceOption" autoresize :style="{ height: raceHeight }" class="w-full" />
        </div>

        <!-- Courbes qui se dessinent au fil des parties -->
        <div
          class="p-2 md:p-6 rounded-lg shadow-lg border border-navy/10 bg-watergreen dark:border-white/10 dark:bg-navy"
        >
          <h2 class="text-xl font-bold px-2 pt-2 md:px-0 md:pt-0 mb-2">Évolution des points</h2>
          <VChart :option="lineOption" autoresize class="w-full h-[40vh] lg:h-[52vh]" />
        </div>
      </div>
    </template>
  </AppShell>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import AppShell from "@/Components/AppShell.vue";
import { PlayIcon, PauseIcon, RewindIcon } from "@heroicons/vue/outline";
import { VChart } from "@/services/echarts";
import { useTarotData } from "@/composables/useTarotData";
import { useTheme } from "@/composables/useTheme";
import { playerColor, playerInitials } from "@/services/avatars";

const { games, players, loading, error } = useTarotData();
const { isDark } = useTheme();

// Curseur de lecture : nombre de parties déjà « jouées » (0 = avant la
// première). Le film avance d'une partie par tick, les graphiques sont
// recalculés à chaque pas et ECharts interpole entre deux états.
const cursor = ref(0);
const playing = ref(false);
const speed = ref(2);
const BASE_TICK_MS = 700;
const tickMs = computed(() => BASE_TICK_MS / speed.value);
const atEnd = computed(() => cursor.value >= games.value.length);

let timer = null;

const stop = () => {
  if (timer) clearInterval(timer);
  timer = null;
  playing.value = false;
};

const schedule = () => {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (cursor.value >= games.value.length) {
      stop();
      return;
    }
    cursor.value++;
  }, tickMs.value);
};

const togglePlay = () => {
  if (playing.value) {
    stop();
    return;
  }
  if (games.value.length === 0) return;
  if (atEnd.value) cursor.value = 0;
  playing.value = true;
  schedule();
};

const restart = () => {
  cursor.value = 0;
  if (playing.value) schedule();
};

// Changement de vitesse en cours de lecture : on réarme le minuteur.
watch(speed, () => {
  if (playing.value) schedule();
});

// Rechargement des données : on ne laisse pas le curseur au-delà de la fin.
watch(
  () => games.value.length,
  (length) => {
    if (cursor.value > length) cursor.value = length;
  }
);

onUnmounted(stop);

const activePlayers = computed(() =>
  players.value.filter((name) =>
    games.value.some((game) => game.scores[name] !== undefined)
  )
);

// Score cumulé de chaque joueur à la position du curseur.
const scoresAtCursor = computed(() => {
  const game = cursor.value > 0 ? games.value[cursor.value - 1] : null;
  return activePlayers.value.map((name) => ({
    name,
    value: game ? game.cumulativeScores[name] ?? 0 : 0,
  }));
});

const raceHeight = computed(
  () => `${Math.max(280, activePlayers.value.length * 48 + 48)}px`
);

const inkColor = computed(() => (isDark.value ? "#FFFFFF" : "#113B54"));
const gridColor = computed(() =>
  isDark.value ? "rgba(255, 255, 255, 0.2)" : "rgba(17, 59, 84, 0.15)"
);

// Classement à la position du curseur, trié par score décroissant. On ne
// passe pas par `realtimeSort` d'ECharts : il ordonne par longueur de barre
// (valeur absolue), ce qui plaçait les gros scores négatifs en tête.
const rankingAtCursor = computed(() =>
  // Array.sort est stable : à égalité, l'ordre de la feuille est conservé.
  [...scoresAtCursor.value].sort((a, b) => b.value - a.value)
);

// Course de barres : l'axe des catégories suit le classement trié, et chaque
// barre est rattachée à son joueur par son nom (donnée [valeur, nom]) —
// quand le rang change, la barre glisse vers sa nouvelle ligne.
const raceOption = computed(() => {
  const ink = inkColor.value;
  return {
    animationDuration: 0,
    animationDurationUpdate: tickMs.value,
    animationEasing: "linear",
    animationEasingUpdate: "linear",
    grid: { left: 8, right: 56, top: 8, bottom: 8, containLabel: true },
    xAxis: {
      type: "value",
      max: "dataMax",
      axisLabel: { color: ink, fontFamily: "Poppins, sans-serif", fontSize: 10 },
      splitLine: { lineStyle: { color: gridColor.value } },
    },
    yAxis: {
      type: "category",
      data: rankingAtCursor.value.map(({ name }) => name),
      inverse: true,
      animationDuration: 300,
      animationDurationUpdate: 300,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: gridColor.value } },
      axisLabel: {
        color: ink,
        fontFamily: "Poppins, sans-serif",
        fontWeight: 600,
        fontSize: 12,
      },
    },
    series: [
      {
        type: "bar",
        barCategoryGap: "35%",
        data: scoresAtCursor.value.map(({ name, value }) => ({
          value: [value, name],
          itemStyle: { color: playerColor(name), borderRadius: [0, 4, 4, 0] },
        })),
        label: {
          show: true,
          position: "right",
          color: ink,
          fontFamily: "Poppins, sans-serif",
          fontWeight: "bold",
          fontSize: 12,
          formatter: ({ value }) => Number(value[0]).toFixed(1),
        },
      },
    ],
  };
});

// Courbes : l'axe couvre toute la saison dès le départ, les données
// s'arrêtent au curseur — la ligne « se dessine » pendant la lecture et
// le badge à initiales (endLabel) suit le bout de chaque courbe.
const lineOption = computed(() => {
  const ink = inkColor.value;
  const badgeStroke = isDark.value ? "#113B54" : "#FFFFFF";
  const narrow = typeof window !== "undefined" && window.innerWidth < 768;
  const badge = narrow ? 20 : 26;

  const series = activePlayers.value.map((name) => {
    const color = playerColor(name);
    return {
      name,
      type: "line",
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color },
      itemStyle: { color },
      data: games.value
        .slice(0, cursor.value)
        .map((game) => game.cumulativeScores[name] ?? 0),
      endLabel: {
        show: true,
        formatter: () => playerInitials(name),
        color: "#113B54",
        fontFamily: "Poppins, sans-serif",
        fontWeight: "bold",
        fontSize: narrow ? 8 : 10,
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
        offset: [badge / 2 + 6, 0],
      },
    };
  });

  return {
    animationDuration: 0,
    animationDurationUpdate: tickMs.value,
    animationEasing: "linear",
    animationEasingUpdate: "linear",
    grid: {
      left: 8,
      right: badge + 20,
      top: 16,
      bottom: 8,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: games.value.map((game) => `Partie ${game.numero}`),
      axisLine: { lineStyle: { color: gridColor.value } },
      axisTick: { show: false },
      axisLabel: { color: ink, fontFamily: "Poppins, sans-serif", fontSize: 10 },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisLabel: { color: ink, fontFamily: "Poppins, sans-serif", fontSize: 10 },
      splitLine: { lineStyle: { color: gridColor.value } },
    },
    series,
  };
});
</script>
