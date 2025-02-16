<template>
  <div
    class="flex min-h-screen bg-green-900 text-white"
    style="font-family: 'Poppins', sans-serif"
  >
    <Sidebar class="fixed" />

    <main class="ml-64 flex-1 px-6 py-10 relative">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold">Liste des parties</h1>
        <Link
          href="/new-game"
          class="bg-blue-500 px-4 py-2 rounded text-white font-semibold shadow-md hover:bg-blue-600 transition"
        >
          + Ajouter une partie
        </Link>
      </div>

      <!-- Skeleton Loader -->
      <div v-if="loading" class="bg-green-800 p-6 rounded-lg shadow-lg">
        <div
          v-for="n in 5"
          :key="n"
          class="animate-pulse flex items-center space-x-4 py-2"
        >
          <div class="bg-gray-500 h-12 w-12 rounded-full"></div>
          <div class="flex-1">
            <div class="bg-gray-500 h-4 w-1/3 mb-2"></div>
            <div class="bg-gray-500 h-4 w-1/4"></div>
          </div>
        </div>
      </div>

      <!-- Si aucune partie -->
      <p v-else-if="games.length === 0" class="text-center text-gray-300 text-lg">
        Aucune partie enregistrée pour le moment.
      </p>

      <!-- Tableau des parties -->
      <div v-else class="bg-green-800 p-6 rounded-lg shadow-lg overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-green-700 text-left text-white">
              <th class="p-3 border-b">ID</th>
              <th class="p-3 border-b">Date</th>
              <th class="p-3 border-b">Attaquants</th>
              <th class="p-3 border-b">Défenseurs</th>
              <th class="p-3 border-b text-center">Annonce</th>
              <th class="p-3 border-b text-center">Bouts</th>
              <th class="p-3 border-b text-center">Enculette</th>
              <th class="p-3 border-b text-right">Points</th>
              <th class="p-3 border-b text-center">Faite</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="game in games"
              :key="game.id"
              class="hover:bg-green-600 transition"
            >
              <!-- ID -->
              <td class="p-3 border-b font-semibold">{{ game.id }}</td>

              <!-- Date -->
              <td class="p-3 border-b">
                {{
                  new Date(game.created_at).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}
              </td>

              <!-- Attaquants -->
              <td class="p-3 border-b">
                <div class="flex space-x-2">
                  <img
                    v-for="attaquant in [...game.attaquants].sort((a, b) =>
                      a.pivot.roi === b.pivot.roi ? 0 : a.pivot.roi ? 1 : -1
                    )"
                    :key="attaquant.id"
                    :src="
                      attaquant.photo
                        ? `/storage/${attaquant.photo}`
                        : '/images/default-avatar.png'
                    "
                    class="w-10 h-10 rounded-full shadow-md"
                    :class="{
                      'outline outline-2 outline-yellow-500': attaquant.pivot.roi,
                      'outline outline-2 outline-red-500': !attaquant.pivot.roi,
                    }"
                  />
                </div>
              </td>

              <!-- Défenseurs -->
              <td class="p-3 border-b">
                <div class="flex space-x-2">
                  <img
                    v-for="defenseur in game.defenseurs"
                    :key="defenseur.id"
                    :src="
                      defenseur.photo
                        ? `/storage/${defenseur.photo}`
                        : '/images/default-avatar.png'
                    "
                    class="w-10 h-10 rounded-full shadow-md outline outline-2 outline-blue-500"
                  />
                </div>
              </td>

              <!-- Annonce -->
              <td class="p-3 border-b text-center">
                <span
                  class="px-3 py-1 rounded-lg text-white shadow"
                  :style="{ backgroundColor: game.annonce.color }"
                >
                  {{ game.annonce.name }}
                </span>
              </td>

              <!-- Bouts -->
              <td class="p-3 border-b font-semibold text-center">
                <span>
                  <i
                    :class="
                      (game.pointsForAttaque ? game.nb_bouts : 3 - game.nb_bouts) >= 1
                        ? 'fa-solid'
                        : 'fa-regular'
                    "
                    class="fa-square text-black text-2xl mx-2"
                  ></i>
                  <i
                    :class="
                      (game.pointsForAttaque ? game.nb_bouts : 3 - game.nb_bouts) >= 2
                        ? 'fa-solid'
                        : 'fa-regular'
                    "
                    class="fa-square text-black text-2xl mx-2"
                  ></i>
                  <i
                    :class="
                      (game.pointsForAttaque ? game.nb_bouts : 3 - game.nb_bouts) === 3
                        ? 'fa-solid'
                        : 'fa-regular'
                    "
                    class="fa-square text-black text-2xl mx-2"
                  ></i>
                </span>
              </td>

              <!-- Enculette -->
              <td class="p-3 border-b text-center">
                <span
                  class="px-3 py-1 rounded-full text-white font-semibold"
                  :class="game.enculette ? 'bg-red-500' : 'bg-gray-700'"
                >
                  {{ game.enculette ? "Oui" : "Non" }}
                </span>
              </td>

              <!-- Points pour l'attaque -->
              <td class="p-3 border-b font-semibold text-right">
                {{
                  game.pointsForAttaque
                    ? parseFloat(game.nb_points).toFixed(1) + "pts"
                    : (91 - parseFloat(game.nb_points)).toFixed(1) + "pts"
                }}
              </td>
              <td class="p-3 border-b font-semibold text-center">
                <span
                  class="rounded-full p-2"
                  :style="{
                    backgroundColor:
                      (game.pointsForAttaque
                        ? parseFloat(game.nb_points) -
                          (game.nb_bouts === 0
                            ? 56
                            : game.nb_bouts === 1
                            ? 51
                            : game.nb_bouts === 2
                            ? 41
                            : 36)
                        : 91 -
                          parseFloat(game.nb_points) -
                          (3 - game.nb_bouts === 0
                            ? 56
                            : 3 - game.nb_bouts === 1
                            ? 51
                            : 3 - game.nb_bouts === 2
                            ? 41
                            : 36)) >= 0
                        ? '#22c55e'
                        : '#dc2626',
                  }"
                >
                  {{
                    (game.pointsForAttaque
                      ? parseFloat(game.nb_points) -
                        (game.nb_bouts === 0
                          ? 56
                          : game.nb_bouts === 1
                          ? 51
                          : game.nb_bouts === 2
                          ? 41
                          : 36)
                      : 91 -
                        parseFloat(game.nb_points) -
                        (3 - game.nb_bouts === 0
                          ? 56
                          : 3 - game.nb_bouts === 1
                          ? 51
                          : 3 - game.nb_bouts === 2
                          ? 41
                          : 36)) >= 0
                      ? `+${(game.pointsForAttaque
                          ? parseFloat(game.nb_points) -
                            (game.nb_bouts === 0
                              ? 56
                              : game.nb_bouts === 1
                              ? 51
                              : game.nb_bouts === 2
                              ? 41
                              : 36)
                          : 91 -
                            parseFloat(game.nb_points) -
                            (3 - game.nb_bouts === 0
                              ? 56
                              : 3 - game.nb_bouts === 1
                              ? 51
                              : 3 - game.nb_bouts === 2
                              ? 41
                              : 36)
                        ).toFixed(1)}`
                      : (game.pointsForAttaque
                          ? parseFloat(game.nb_points) -
                            (game.nb_bouts === 0
                              ? 56
                              : game.nb_bouts === 1
                              ? 51
                              : game.nb_bouts === 2
                              ? 41
                              : 36)
                          : 91 -
                            parseFloat(game.nb_points) -
                            (3 - game.nb_bouts === 0
                              ? 56
                              : 3 - game.nb_bouts === 1
                              ? 51
                              : 3 - game.nb_bouts === 2
                              ? 41
                              : 36)
                        ).toFixed(1)
                  }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Sidebar from "@/Components/SideBar.vue";
import { Link } from "@inertiajs/vue3";

const games = ref([]);
const loading = ref(true);

onMounted(async () => {
  await fetchGames();
});

const fetchGames = async () => {
  loading.value = true;
  try {
    const response = await fetch("/api/games");
    games.value = response.status === 204 ? [] : await response.json();
  } catch (error) {
    console.error("Erreur de récupération des parties :", error);
  } finally {
    loading.value = false;
  }
};
</script>
