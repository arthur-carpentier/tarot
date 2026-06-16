<template>
  <AppShell>
    <!-- Bandeau d'accueil -->
    <div
      class="relative overflow-hidden rounded-lg shadow-lg mb-6 border border-navy/10 dark:border-white/10"
    >
      <div
        class="absolute inset-0 bg-cover bg-center opacity-20"
        :style="{ backgroundImage: `url(${textureUrl})`, backgroundRepeat: 'repeat' }"
      ></div>
      <div class="relative z-10 px-6 py-10 md:py-14 text-center bg-watergreen/70 dark:bg-navy/70">
        <h1 class="text-4xl md:text-5xl font-extrabold">Bienvenue sur Tarot</h1>
        <p class="text-lg text-navy/70 dark:text-periwinkle/80 mt-3">
          Les parties, les scores et les statistiques, directement depuis le Google Sheet.
        </p>
        <div class="mt-6 flex justify-center gap-3 flex-wrap">
          <router-link
            to="/new-game"
            class="px-6 py-3 bg-chartreuse text-navy font-semibold rounded-lg shadow-lg hover:brightness-95 transition"
          >
            <i class="fa-solid fa-play mr-2"></i>Nouvelle partie
          </router-link>
          <router-link
            v-if="todayCount"
            to="/today"
            class="px-6 py-3 bg-pine text-white font-semibold rounded-lg shadow-lg hover:brightness-110 transition"
          >
            <i class="fa-solid fa-calendar-day mr-2"></i>Partie d'aujourd'hui
            <span class="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-sm">{{ todayCount }}</span>
          </router-link>
          <router-link
            to="/games"
            class="px-6 py-3 bg-white dark:bg-white/10 text-navy dark:text-white font-semibold rounded-lg shadow-lg ring-1 ring-navy/10 dark:ring-white/20 hover:bg-periwinkle/40 dark:hover:bg-white/20 transition"
          >
            Voir les parties
          </router-link>
        </div>
      </div>
    </div>

    <!-- Aperçus -->
    <div v-if="!loading && !error" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <!-- Classement -->
      <div class="rounded-lg shadow-lg p-5 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-bold">Classement</h2>
          <router-link to="/stats" class="text-sm underline text-navy/60 dark:text-periwinkle/80">
            tout voir
          </router-link>
        </div>
        <ul class="space-y-2.5">
          <li
            v-for="(entry, index) in standings.slice(0, 5)"
            :key="entry.name"
            class="flex items-center gap-3"
          >
            <span class="w-5 text-navy/50 dark:text-periwinkle/70 font-bold">{{ index + 1 }}</span>
            <PlayerAvatar :name="entry.name" size="sm" />
            <router-link
              :to="`/player/${encodeURIComponent(entry.name)}`"
              class="flex-1 truncate font-semibold hover:underline"
            >
              {{ entry.name }}
            </router-link>
            <span
              class="font-bold"
              :class="entry.score >= 0 ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
            >
              {{ entry.score.toFixed(1) }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Dernière partie -->
      <div class="rounded-lg shadow-lg p-5 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-bold">Dernière partie</h2>
          <router-link to="/games" class="text-sm underline text-navy/60 dark:text-periwinkle/80">
            historique
          </router-link>
        </div>
        <template v-if="lastGame">
          <div class="flex items-center justify-between gap-2 mb-4">
            <span class="font-bold text-navy/60 dark:text-periwinkle/80">n°{{ lastGame.numero }}</span>
            <span
              class="px-2 py-0.5 rounded text-sm font-semibold ring-1 ring-navy/20 dark:ring-white/30"
              :style="annonceStyle(lastGame.annonce)"
            >
              {{ lastGame.annonce }}
            </span>
            <span
              class="rounded-full px-2.5 py-1 text-sm font-bold"
              :class="lastGame.fait ? 'bg-chartreuse text-navy' : 'bg-red-600 text-white'"
            >
              {{ (lastGame.prisChuteDe >= 0 ? "+" : "") + lastGame.prisChuteDe.toFixed(1) }}
            </span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex -space-x-1.5">
              <PlayerAvatar :name="lastGame.preneur" size="sm" class="outline outline-2 outline-red-500" />
              <PlayerAvatar
                v-if="lastGame.appele && lastGame.appele !== lastGame.preneur"
                :name="lastGame.appele"
                size="sm"
                class="outline outline-2 outline-yellow-500"
              />
            </div>
            <span class="text-xs font-bold text-navy/40 dark:text-periwinkle/60">VS</span>
            <div class="flex -space-x-1.5">
              <PlayerAvatar
                v-for="defenseur in lastGame.defenseurs"
                :key="defenseur"
                :name="defenseur"
                size="sm"
                class="outline outline-2 outline-blue-500"
              />
            </div>
          </div>
          <ul class="mt-4 space-y-1.5">
            <li
              v-for="entry in lastGameScores"
              :key="entry.name"
              class="flex items-center gap-2 text-sm"
            >
              <PlayerAvatar :name="entry.name" size="xs" />
              <span class="flex-1 truncate">{{ entry.name }}</span>
              <span
                class="font-bold"
                :class="entry.points >= 0 ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
              >
                {{ (entry.points >= 0 ? "+" : "") + entry.points.toFixed(1) }}
              </span>
            </li>
          </ul>
        </template>
        <p v-else class="text-navy/60 dark:text-periwinkle/80">Aucune partie pour l'instant.</p>
      </div>

      <!-- Saison en cours -->
      <div class="rounded-lg shadow-lg p-5 border border-navy/10 dark:border-white/10 bg-watergreen dark:bg-navy md:col-span-2 xl:col-span-1">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-bold">La saison</h2>
          <router-link to="/season" class="text-sm underline text-navy/60 dark:text-periwinkle/80">
            carte résumée
          </router-link>
        </div>
        <div class="text-center py-2">
          <div class="text-4xl font-bold text-pine dark:text-chartreuse">{{ games.length }}</div>
          <div class="text-navy/60 dark:text-periwinkle/80 text-sm mb-4">
            parties jouées<template v-if="todayCount">
              · dont {{ todayCount }} aujourd'hui</template
            >
          </div>
          <template v-if="standings.length">
            <div class="text-3xl mb-1">🥇</div>
            <div class="flex items-center justify-center gap-2">
              <PlayerAvatar :name="standings[0].name" size="sm" />
              <span class="font-bold text-lg">{{ standings[0].name }}</span>
            </div>
            <div class="text-sm text-navy/60 dark:text-periwinkle/80 mt-1">
              mène avec {{ standings[0].score.toFixed(1) }} points
            </div>
          </template>
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

const { games, standings, lastGame, firstGameToday, loading, error } = useTarotData();

const textureUrl = `${import.meta.env.BASE_URL}images/card_table_texture.jpg`;

// Graphiques!R3 = dernière partie d'avant la journée → le jour est après
const todayCount = computed(() =>
  firstGameToday.value
    ? games.value.filter((game) => game.numero > firstGameToday.value).length
    : 0
);

const lastGameScores = computed(() => {
  if (!lastGame.value) return [];
  return Object.entries(lastGame.value.scores)
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points);
});
</script>
