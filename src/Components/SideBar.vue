<template>
  <aside
    class="w-64 bg-watergreen dark:bg-navy p-6 shadow-lg flex-col justify-between h-screen hidden md:flex"
  >
    <div>
      <router-link to="/">
        <h2 class="text-4xl font-bold mb-6 text-center hover:opacity-70 transition">
          Tarot
        </h2>
      </router-link>
      <div class="mb-6 rounded-lg">
        <router-link
          to="/new-game"
          class="flex items-center space-x-3 p-4 rounded-lg bg-chartreuse text-navy font-semibold hover:brightness-95 transition-all"
        >
          <PlayIcon class="w-6 h-6" />
          <span>Nouvelle partie</span>
        </router-link>
      </div>
    </div>

    <nav class="flex-grow flex flex-col justify-center">
      <ul class="space-y-4">
        <li v-for="item in centeredMenuItems" :key="item.title">
          <router-link
            :to="item.link"
            class="flex items-center space-x-3 p-3 rounded-lg hover:bg-periwinkle/40 dark:hover:bg-white/10 transition"
            active-class="bg-periwinkle/60 dark:bg-white/10"
          >
            <component :is="item.icon" class="w-6 h-6" />
            <span>{{ item.title }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div>
      <nav>
        <ul class="space-y-4">
          <li v-for="item in bottomMenuItems" :key="item.title">
            <router-link
              :to="item.link"
              class="flex items-center space-x-3 p-3 rounded-lg hover:bg-periwinkle/40 dark:hover:bg-white/10 transition"
              active-class="bg-periwinkle/60 dark:bg-white/10"
            >
              <component :is="item.icon" class="w-6 h-6" />
              <span>{{ item.title }}</span>
            </router-link>
          </li>
          <li>
            <a
              :href="sheetUrl"
              target="_blank"
              rel="noopener"
              class="flex items-center space-x-3 p-3 rounded-lg hover:bg-periwinkle/40 dark:hover:bg-white/10 transition text-navy/60 dark:text-periwinkle/80"
            >
              <ExternalLinkIcon class="w-6 h-6" />
              <span>Google Sheet</span>
            </a>
          </li>
          <li>
            <button
              @click="toggle"
              class="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-periwinkle/40 dark:hover:bg-white/10 transition text-navy/60 dark:text-periwinkle/80"
            >
              <MoonIcon v-if="!isDark" class="w-6 h-6" />
              <SunIcon v-else class="w-6 h-6" />
              <span>{{ isDark ? "Mode clair" : "Mode sombre" }}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </aside>

  <!-- Barre de navigation mobile -->
  <header
    class="md:hidden fixed top-0 inset-x-0 z-30 bg-watergreen dark:bg-navy shadow-lg"
  >
    <div class="flex items-center justify-between px-4 py-3">
      <router-link to="/" class="text-2xl font-bold font-display">Tarot</router-link>
      <div class="flex items-center space-x-2">
        <button
          @click="toggle"
          class="p-2 rounded-lg hover:bg-periwinkle/40 dark:hover:bg-white/10 transition"
          :title="isDark ? 'Mode clair' : 'Mode sombre'"
        >
          <MoonIcon v-if="!isDark" class="w-5 h-5" />
          <SunIcon v-else class="w-5 h-5" />
        </button>
        <router-link
          to="/new-game"
          class="flex items-center space-x-2 px-3 py-2 rounded-lg bg-chartreuse text-navy text-sm font-semibold"
        >
          <PlayIcon class="w-5 h-5" />
          <span>Nouvelle partie</span>
        </router-link>
      </div>
    </div>
    <nav class="flex overflow-x-auto px-2 pb-2 space-x-2 text-sm">
      <router-link
        v-for="item in [...centeredMenuItems, ...bottomMenuItems]"
        :key="item.title"
        :to="item.link"
        class="px-3 py-1.5 rounded-full whitespace-nowrap bg-white dark:bg-white/10 hover:bg-periwinkle/40"
        active-class="!bg-chartreuse !text-navy"
      >
        {{ item.title }}
      </router-link>
    </nav>
  </header>
</template>

<script setup>
import {
  ChartBarIcon,
  TrendingUpIcon,
  UsersIcon,
  CogIcon,
  PlayIcon,
  ViewListIcon,
  ExternalLinkIcon,
  SunIcon,
  MoonIcon,
  StarIcon,
} from "@heroicons/vue/outline";
import { SHEET_URL } from "@/config";
import { useTheme } from "@/composables/useTheme";

const sheetUrl = SHEET_URL;
const { isDark, toggle } = useTheme();

const centeredMenuItems = [
  { title: "Parties", link: "/games", icon: ViewListIcon },
  { title: "Graphique", link: "/chart", icon: TrendingUpIcon },
  { title: "Statistiques", link: "/stats", icon: ChartBarIcon },
  { title: "Carte résumée", link: "/season", icon: StarIcon },
];

const bottomMenuItems = [
  { title: "Joueurs", link: "/players", icon: UsersIcon },
  { title: "Règles", link: "/rules", icon: CogIcon },
];
</script>
