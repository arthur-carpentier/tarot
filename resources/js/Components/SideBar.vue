<template>
  <aside
    class="w-64 bg-light p-6 shadow-lg flex flex-col justify-between h-screen text-dark"
  >
    <div>
      <Link href="/">
        <h2 class="text-4xl font-bold mb-6 text-center text-dark hover:text-dark-lighter">Tarot</h2>
      </Link>
      <div class="mb-6 bg-dark rounded-lg text-light">
        <Link
          href="/new-game"
          class="flex items-center space-x-3 p-4 rounded-lg hover:bg-dark-lighter transition"
        >
          <PlayIcon class="w-6 h-6" />
          <span>Nouvelle partie</span>
        </Link>
      </div>
    </div>

    <nav class="flex-grow flex flex-col justify-center">
      <ul class="space-y-4">
        <li v-for="item in centeredMenuItems" :key="item.title">
          <Link
            :href="item.link"
            class="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-lighter hover:text-light transition"
          >
            <component :is="item.icon" class="w-6 h-6" />
            <span>{{ item.title }}</span>
          </Link>
        </li>
      </ul>
    </nav>

    <div>
      <nav>
        <ul class="space-y-4">
          <li v-for="item in adminMenuItems" :key="item.title">
            <Link
              :href="item.link"
              class="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-lighter hover:text-light transition"
            >
              <component :is="item.icon" class="w-6 h-6" />
              <span>{{ item.title }}</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { Link } from "@inertiajs/vue3";
import {
  HomeIcon,
  ChartBarIcon,
  UserIcon,
  UsersIcon,
  CogIcon,
  PlayIcon,
} from "@heroicons/vue/outline";

const isAdmin = computed(() => {
  return true; // Replace with actual admin logic
});

const centeredMenuItems = computed(() => [
  { title: "Parties", link: "/games", icon: HomeIcon },
  { title: "Graphique", link: "/chart", icon: ChartBarIcon },
  { title: "Statistiques", link: "/stats", icon: ChartBarIcon },
]);

const adminMenuItems = computed(() => {
  const items = [{ title: "Mon profil", link: "/profile", icon: UserIcon }];
  if (isAdmin.value) {
    items.unshift({
      title: "Gérer les joueurs",
      link: "/manage-players",
      icon: UsersIcon,
    });
    items.unshift({ title: "Gérer les règles", link: "/manage-rules", icon: CogIcon });
  }
  return items;
});
</script>
