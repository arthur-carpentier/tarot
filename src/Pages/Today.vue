<template>
  <AppShell>
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <div>
        <h1 class="text-4xl font-bold">Partie d'aujourd'hui</h1>
        <p class="text-navy/60 dark:text-periwinkle/80 mt-1 first-letter:uppercase">{{ todayLabel }}</p>
      </div>
      <router-link
        to="/new-game"
        class="bg-chartreuse px-4 py-2 rounded text-navy font-semibold shadow-md hover:brightness-95 transition"
      >
        + Ajouter une partie
      </router-link>
    </div>

    <!-- Skeleton Loader -->
    <div
      v-if="loading"
      class="rounded-lg shadow-lg p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy"
    >
      <div v-for="n in 5" :key="n" class="animate-pulse flex items-center space-x-4 py-2">
        <div class="bg-navy/10 dark:bg-white/10 h-12 w-12 rounded-full"></div>
        <div class="flex-1">
          <div class="bg-navy/10 dark:bg-white/10 h-4 w-1/3 mb-2"></div>
          <div class="bg-navy/10 dark:bg-white/10 h-4 w-1/4"></div>
        </div>
      </div>
    </div>

    <p v-else-if="error" class="text-center text-red-600 dark:text-red-400 text-lg">{{ error }}</p>

    <!-- Aucune partie marquée comme étant du jour -->
    <div
      v-else-if="!today.todayGames.length"
      class="rounded-lg shadow-lg p-8 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center"
    >
      <div class="text-5xl mb-4">🃏</div>
      <h2 class="text-2xl font-bold mb-2">Pas encore de partie aujourd'hui</h2>
      <p class="text-navy/60 dark:text-periwinkle/80 max-w-md mx-auto">
        Cochez <span class="font-semibold">« Première partie de la journée »</span> en
        enregistrant votre première manche pour démarrer le suivi du jour.
      </p>
      <router-link
        to="/new-game"
        class="inline-block mt-6 bg-chartreuse px-6 py-3 rounded text-navy font-semibold shadow-md hover:brightness-95 transition"
      >
        <i class="fa-solid fa-play mr-2"></i>Lancer la première partie
      </router-link>
    </div>

    <div v-else class="space-y-8">
      <!-- Cartes de synthèse -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="rounded-lg p-5 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-4xl font-bold text-pine dark:text-chartreuse">{{ today.todayGames.length }}</div>
          <div class="text-navy/60 dark:text-periwinkle/80 mt-1 text-sm">
            manche{{ today.todayGames.length > 1 ? "s" : "" }} jouée{{ today.todayGames.length > 1 ? "s" : "" }}
          </div>
        </div>

        <div class="rounded-lg p-5 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-xs uppercase tracking-wide text-navy/50 dark:text-periwinkle/70 font-semibold mb-1">
            🔥 Meneur du jour
          </div>
          <div class="flex items-center justify-center gap-2">
            <PlayerAvatar :name="today.leader.name" size="sm" />
            <span class="font-bold truncate">{{ today.leader.name }}</span>
          </div>
          <div class="font-bold mt-1" :class="amountClass(today.leader.pointsToday)">
            {{ signed(today.leader.pointsToday) }}
          </div>
        </div>

        <div class="rounded-lg p-5 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy text-center">
          <div class="text-xs uppercase tracking-wide text-navy/50 dark:text-periwinkle/70 font-semibold mb-1">
            💥 Plus gros coup
          </div>
          <template v-if="today.records.topGain">
            <div class="flex items-center justify-center gap-2">
              <PlayerAvatar :name="today.records.topGain.player" size="sm" />
              <span class="font-bold truncate">{{ today.records.topGain.player }}</span>
            </div>
            <div class="font-bold text-pine dark:text-chartreuse mt-1">
              {{ signed(today.records.topGain.score) }}
            </div>
          </template>
        </div>

        <div class="rounded-lg p-5 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
          <div class="text-xs uppercase tracking-wide text-navy/50 dark:text-periwinkle/70 font-semibold mb-2 text-center">
            Attaque vs défense
          </div>
          <div class="flex justify-between text-sm font-bold mb-1">
            <span class="text-red-600 dark:text-red-400">{{ today.attaqueWins }} att.</span>
            <span class="text-blue-600 dark:text-periwinkle">déf. {{ today.defenseWins }}</span>
          </div>
          <div class="h-3 rounded-full overflow-hidden flex ring-1 ring-navy/10 dark:ring-white/10">
            <div class="bg-red-600 h-full" :style="{ width: attaquePct + '%' }"></div>
            <div class="bg-blue-600 h-full flex-1"></div>
          </div>
        </div>
      </div>

      <!-- Classement du jour -->
      <div class="rounded-lg shadow-lg p-4 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <div class="flex items-baseline justify-between flex-wrap gap-2 mb-1">
          <h2 class="text-2xl font-bold">Classement du jour</h2>
          <p class="text-xs text-navy/50 dark:text-periwinkle/70">
            ▲▼ : places gagnées/perdues au classement général depuis ce matin
          </p>
        </div>
        <p v-if="today.hotStreak" class="text-sm text-navy/60 dark:text-periwinkle/80 mb-4">
          🔥 Série du jour : <span class="font-semibold">{{ today.hotStreak.name }}</span>
          avec {{ today.hotStreak.bestWinStreak }} victoires d'affilée.
        </p>

        <ul class="space-y-3">
          <li
            v-for="(entry, index) in today.ranking"
            :key="entry.name"
            class="rounded-lg p-3 md:p-4 border border-navy/10 dark:border-white/10 bg-white dark:bg-white/5 cursor-pointer hover:bg-periwinkle/30 dark:hover:bg-white/10 transition"
            @click="$router.push(`/player/${encodeURIComponent(entry.name)}`)"
          >
            <div class="flex items-center gap-3">
              <span class="w-8 text-center text-lg font-bold shrink-0">{{ medal(index) }}</span>
              <PlayerAvatar :name="entry.name" />
              <div class="flex-1 min-w-0">
                <div class="font-bold truncate flex items-center gap-2">
                  {{ entry.name }}
                  <span
                    v-if="entry.rankDelta > 0"
                    class="text-pine dark:text-chartreuse text-sm"
                    :title="`+${entry.rankDelta} place(s) au général`"
                  >▲{{ entry.rankDelta }}</span>
                  <span
                    v-else-if="entry.rankDelta < 0"
                    class="text-red-600 dark:text-red-400 text-sm"
                    :title="`${entry.rankDelta} place(s) au général`"
                  >▼{{ -entry.rankDelta }}</span>
                </div>
                <div class="text-xs text-navy/50 dark:text-periwinkle/70 whitespace-nowrap">
                  <span class="text-pine dark:text-chartreuse font-semibold">{{ entry.victoiresToday }}V</span>
                  /
                  <span class="text-red-600 dark:text-red-400 font-semibold">{{ entry.defaitesToday }}D</span>
                  · {{ entry.participationsToday }} manches
                  <span v-if="entry.rankNow" class="hidden sm:inline">
                    · {{ entry.rankNow }}<sup>{{ entry.rankNow === 1 ? "er" : "e" }}</sup> au général
                  </span>
                </div>
              </div>
              <div class="text-right shrink-0">
                <div class="text-xl font-bold" :class="amountClass(entry.pointsToday)">
                  {{ signed(entry.pointsToday) }}
                </div>
                <div class="text-xs text-navy/50 dark:text-periwinkle/70 whitespace-nowrap">
                  {{ entry.score.toFixed(1) }} au général
                </div>
              </div>
            </div>

            <!-- Récap des annonces prises comme preneur aujourd'hui -->
            <div v-if="entry.annonces.length" class="flex flex-wrap gap-1.5 mt-3 pl-11">
              <span
                v-for="(a, i) in entry.annonces"
                :key="i"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ring-1 ring-navy/20 dark:ring-white/30 whitespace-nowrap"
                :style="annonceStyle(a.name)"
                :title="`Partie ${a.numero} · ${a.fait ? 'réussie' : 'chutée'} (${signed(a.prisChuteDe)})`"
              >
                {{ a.name }}
                <i :class="a.fait ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
              </span>
            </div>
          </li>
        </ul>
      </div>

      <!-- Graphique centré sur la journée -->
      <div class="rounded-lg shadow-lg p-4 md:p-6 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <div class="flex items-baseline justify-between flex-wrap gap-2 mb-3">
          <h2 class="text-2xl font-bold">Évolution de la soirée</h2>
          <p class="text-xs text-navy/50 dark:text-periwinkle/70">
            points gagnés depuis le début de la journée (départ à zéro)
          </p>
        </div>
        <div class="relative h-[42vh] md:h-[50vh]">
          <VChart :option="chartOption" :update-options="{ notMerge: true }" autoresize class="h-full w-full" />
        </div>
      </div>

      <!-- Liste des manches du jour -->
      <div>
        <h2 class="text-2xl font-bold mb-4">Les manches du jour</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <div
            v-for="game in todayGamesDesc"
            :key="game.numero"
            class="rounded-lg shadow p-3 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy"
          >
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-bold text-navy/60 dark:text-periwinkle/80">n°{{ game.numero }}</span>
              <span
                class="px-2 py-0.5 rounded text-sm font-semibold ring-1 ring-navy/20 dark:ring-white/30 whitespace-nowrap"
                :style="annonceStyle(game.annonce)"
              >
                {{ game.annonce }}
              </span>
              <span
                class="rounded-full px-2.5 py-1 text-sm font-bold whitespace-nowrap"
                :class="game.fait ? 'bg-chartreuse text-navy' : 'bg-red-600 text-white'"
              >
                {{ signed(game.prisChuteDe) }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-2">
              <div class="flex -space-x-1.5">
                <PlayerAvatar
                  :name="game.preneur"
                  size="sm"
                  class="outline outline-2 outline-red-500"
                />
                <PlayerAvatar
                  v-if="game.appele && game.appele !== game.preneur"
                  :name="game.appele"
                  size="sm"
                  class="outline outline-2 outline-yellow-500"
                />
              </div>
              <span class="text-xs font-bold text-navy/40 dark:text-periwinkle/60">VS</span>
              <div class="flex -space-x-1.5">
                <PlayerAvatar
                  v-for="defenseur in game.defenseurs"
                  :key="defenseur"
                  :name="defenseur"
                  size="sm"
                  class="outline outline-2 outline-blue-500"
                />
              </div>
            </div>

            <div class="flex items-center justify-between gap-2 mt-3 text-sm">
              <span class="whitespace-nowrap">
                <i
                  v-for="n in 3"
                  :key="n"
                  :class="game.boutsAttaque >= n ? 'fa-solid' : 'fa-regular'"
                  class="fa-square text-pine dark:text-chartreuse mx-0.5"
                ></i>
              </span>
              <span class="font-semibold whitespace-nowrap">
                {{ game.pointsAttaque.toFixed(1) }} / {{ game.pointsAFaire }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { computed } from "vue";
import AppShell from "@/Components/AppShell.vue";
import PlayerAvatar from "@/Components/PlayerAvatar.vue";
import { VChart } from "@/services/echarts";
import { useTarotData } from "@/composables/useTarotData";
import { useTheme } from "@/composables/useTheme";
import { computeTodayStats } from "@/services/todayStats";
import { annonceStyle, playerColor, playerInitials } from "@/services/avatars";

const { games, players, firstGameToday, loading, error } = useTarotData();
const { isDark } = useTheme();

const today = computed(() =>
  computeTodayStats(games.value, players.value, firstGameToday.value)
);

const todayLabel = new Date().toLocaleDateString("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const todayGamesDesc = computed(() => [...today.value.todayGames].reverse());

const attaquePct = computed(() => {
  const total = today.value.todayGames.length;
  return total ? (today.value.attaqueWins / total) * 100 : 0;
});

const signed = (value) => (value >= 0 ? "+" : "") + Number(value ?? 0).toFixed(1);
const amountClass = (value) =>
  value >= 0 ? "text-pine dark:text-chartreuse" : "text-red-600 dark:text-red-400";
const medal = (index) => ["🥇", "🥈", "🥉"][index] ?? `${index + 1}`;

// Sur mobile : badges plus compacts.
const isNarrow = () => typeof window !== "undefined" && window.innerWidth < 768;

// Courbes rebasées à zéro au début de la journée : on suit le gain/perte
// de chaque joueur manche après manche sur la seule soirée.
const chartOption = computed(() => {
  const ink = isDark.value ? "#FFFFFF" : "#113B54";
  const grid = isDark.value ? "rgba(255, 255, 255, 0.2)" : "rgba(17, 59, 84, 0.15)";
  const badgeStroke = isDark.value ? "#113B54" : "#FFFFFF";
  const narrow = isNarrow();
  const badge = narrow ? 22 : 30;
  const font = narrow ? 10 : 12;

  const { todayGames, baselineGame, ranking } = today.value;
  const series = ranking.map((entry) => {
    const name = entry.name;
    const color = playerColor(name);
    const baseline = baselineGame ? baselineGame.cumulativeScores[name] ?? 0 : 0;
    return {
      name,
      type: "line",
      smooth: true,
      showSymbol: false,
      symbolSize: 6,
      lineStyle: { width: 2, color },
      itemStyle: { color },
      emphasis: { focus: "series" },
      data: todayGames.map((game) => (game.cumulativeScores[name] ?? baseline) - baseline),
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
    grid: {
      left: 8,
      right: badge + (narrow ? 24 : 48),
      top: 16,
      bottom: 8,
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: isDark.value ? "rgba(10, 36, 52, 0.95)" : "rgba(255, 255, 255, 0.95)",
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
              `<b>${(p.value ?? 0) >= 0 ? "+" : ""}${Number(p.value ?? 0).toFixed(1)} pts</b></div>`
          )
          .join("");
        return `<div style="font-weight:600;margin-bottom:4px">${title}</div>${rows}`;
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: today.value.todayGames.map((game) => `Partie ${game.numero}`),
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
