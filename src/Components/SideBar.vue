<template>
  <aside
    class="w-64 bg-dark-lighter p-6 shadow-lg flex-col justify-between h-screen text-light hidden md:flex"
  >
    <div>
      <router-link to="/">
        <h2
          class="text-4xl font-bold mb-6 text-center text-light hover:text-light-darker"
        >
          Tarot
        </h2>
      </router-link>
      <div class="mb-6 bg-dark rounded-lg text-light">
        <router-link
          to="/new-game"
          class="flex items-center space-x-3 p-4 rounded-lg hover:bg-green-bright bg-green-dark hover:text-dark transition-all"
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
            class="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-lightest hover:text-light transition"
            active-class="bg-dark-lightest"
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
              class="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-lightest hover:text-light transition"
              active-class="bg-dark-lightest"
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
              class="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-lightest hover:text-light transition text-light-darker"
            >
              <ExternalLinkIcon class="w-6 h-6" />
              <span>Google Sheet</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </aside>

  <!-- Barre de navigation mobile -->
  <header
    class="md:hidden fixed top-0 inset-x-0 z-30 bg-dark-lighter text-light shadow-lg"
  >
    <div class="flex items-center justify-between px-4 py-3">
      <router-link to="/" class="text-2xl font-bold">Tarot</router-link>
      <router-link
        to="/new-game"
        class="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-dark text-light text-sm font-semibold"
      >
        <PlayIcon class="w-5 h-5" />
        <span>Nouvelle partie</span>
      </router-link>
    </div>
    <nav class="flex overflow-x-auto px-2 pb-2 space-x-2 text-sm">
      <router-link
        v-for="item in [...centeredMenuItems, ...bottomMenuItems]"
        :key="item.title"
        :to="item.link"
        class="px-3 py-1.5 rounded-full whitespace-nowrap bg-dark hover:bg-dark-lightest"
        active-class="!bg-green-dark"
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
} from "@heroicons/vue/outline";
import { SHEET_URL } from "@/config";

const sheetUrl = SHEET_URL;

const centeredMenuItems = [
  { title: "Parties", link: "/games", icon: ViewListIcon },
  { title: "Graphique", link: "/chart", icon: TrendingUpIcon },
  { title: "Statistiques", link: "/stats", icon: ChartBarIcon },
];

const bottomMenuItems = [
  { title: "Joueurs", link: "/players", icon: UsersIcon },
  { title: "Règles", link: "/rules", icon: CogIcon },
];
</script>
