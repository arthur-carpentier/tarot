<template>
  <div
    class="flex min-h-screen bg-green-900 text-white"
    style="font-family: 'Vice City Sans', sans-serif"
  >
    <!-- Sidebar -->
    <aside class="w-64 bg-green-800 p-6 shadow-lg flex flex-col justify-between h-screen">
      <div>
        <h2 class="text-2xl font-bold mb-6 text-center">Tarot</h2>
        <div class="mb-6 p-4 bg-green-700 rounded-lg">
          <Link
            href="/new-game"
            class="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-600 transition"
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
              class="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-700 transition"
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
                class="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-700 transition"
              >
                <component :is="item.icon" class="w-6 h-6" />
                <span>{{ item.title }}</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <main
      class="flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
    >
      <div
        class="absolute inset-0 bg-cover bg-center opacity-20"
        style="
          background-image: url('/images/card_table_texture.jpg');
          background-repeat: repeat;
        "
      ></div>
      <div class="relative z-10 animate-fade-in">
        <h1 class="text-5xl font-extrabold">Bienvenue sur Tarot</h1>
        <p class="text-lg text-gray-200 mt-4">
          Gérez vos parties, vos scores et vos statistiques avec style.
        </p>
        <div class="mt-6">
          <Link
            href="/dashboard"
            class="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-lg hover:bg-yellow-600 transition"
          >
            Commencer
          </Link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { Link } from "@inertiajs/vue3";
import {
  HomeIcon,
  ChartBarIcon,
  UserIcon,
  UsersIcon,
  CogIcon,
  PlayIcon,
} from "@heroicons/vue/outline";
import { computed } from "vue";

const isAdmin = computed(() => {
  // Remplace avec ta logique pour vérifier si l'utilisateur est admin
  return true;
});

const centeredMenuItems = computed(() => [
  { title: "Parties", link: "/games", icon: HomeIcon },
  { title: "Graphique", link: "/charts", icon: ChartBarIcon },
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

<style>
@import url("https://fonts.googleapis.com/css2?family=Vice+City+Sans&display=swap");

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}
</style>
