<template>
  <div
    class="flex min-h-screen bg-green-900 text-white p-6"
    style="font-family: 'Poppins', sans-serif"
  >
    <Sidebar />
    <main class="flex-1 px-6 py-10 relative">
      <div class="text-6xl font-bold mb-6 text-center">
        <span>Nouvelle Partie</span>
      </div>
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        <form @submit.prevent="submitGame" class="space-y-6">
          <div class="bg-gray-700 p-4 rounded-lg">
            <label class="block text-2xl font-semibold">Annonce</label>
            <div class="grid grid-cols-4 gap-4 mt-2">
              <div
                v-for="annonce in annonces"
                :key="annonce.id"
                @click="selectedAnnonce = annonce.id"
                class="p-4 text-center font-semibold cursor-pointer rounded-lg transition-all duration-200"
                :class="{
                  'opacity-50 grayscale':
                    selectedAnnonce && selectedAnnonce !== annonce.id,
                  'scale-105 brightness-125 saturate-150': selectedAnnonce === annonce.id,
                  'hover:brightness-110 hover:saturate-125':
                    selectedAnnonce !== annonce.id,
                }"
                :style="{ backgroundColor: annonce.color || '#555' }"
              >
                {{ annonce.name }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="bg-gray-700 p-4 rounded-lg">
              <h2 class="text-xl font-semibold mb-4">Attaque</h2>
              <div class="grid grid-cols-2 gap-4">
                <!-- Preneur -->
                <div>
                  <label class="block text-sm font-medium mb-2">Preneur</label>
                  <div
                    v-for="player in players"
                    :key="player.id"
                    class="flex items-center space-x-4 p-2 cursor-pointer"
                    @click="selectPreneur(player.id)"
                  >
                    <div class="relative">
                      <img
                        :src="
                          player.photo
                            ? `/storage/${player.photo}`
                            : '/images/default-avatar.png'
                        "
                        class="w-12 h-12 rounded-full shadow-md transition-all duration-100"
                        :class="{
                          'outline outline-4 outline-red-500 opacity-100':
                            preneur === player.id,
                          'opacity-70 hover:opacity-100': preneur !== player.id,
                        }"
                      />
                    </div>
                    <span
                      class="transition-all duration-200"
                      :class="{ 'font-bold': preneur === player.id }"
                    >
                      {{ player.name }}
                    </span>
                  </div>
                </div>

                <!-- Roi -->
                <div>
                  <label class="block text-sm font-medium mb-2">Roi (Optionnel)</label>
                  <div
                    v-for="player in players"
                    :key="player.id"
                    class="flex items-center space-x-4 p-2 cursor-pointer"
                    @click="selectRoi(player.id)"
                  >
                    <div class="relative">
                      <img
                        :src="
                          player.photo
                            ? `/storage/${player.photo}`
                            : '/images/default-avatar.png'
                        "
                        class="w-12 h-12 rounded-full shadow-md transition-all duration-100"
                        :class="{
                          'outline outline-4 outline-yellow-500 opacity-100':
                            roi === player.id,
                          'opacity-70 hover:opacity-100': roi !== player.id,
                        }"
                      />
                    </div>
                    <span
                      class="transition-all duration-200"
                      :class="{ 'font-bold': roi === player.id }"
                    >
                      {{ player.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gray-700 p-4 rounded-lg">
              <h2 class="text-xl font-semibold mb-4">Défense</h2>
              <label class="block text-sm font-medium">Sélectionner 3-4 Joueurs</label>
              <div
                v-for="player in players"
                :key="player.id"
                class="flex items-center space-x-4 p-2 cursor-pointer"
                @click="toggleDefense(player.id)"
              >
                <div class="relative">
                  <img
                    :src="
                      player.photo
                        ? `/storage/${player.photo}`
                        : '/images/default-avatar.png'
                    "
                    class="w-12 h-12 rounded-full shadow-md transition-all duration-100"
                    :class="{
                      'outline outline-4 outline-blue-500 opacity-100': defense.includes(
                        player.id
                      ),
                      'opacity-70 hover:opacity-100': !defense.includes(player.id),
                    }"
                  />
                </div>
                <span
                  class="transition-all duration-200"
                  :class="{ 'font-bold': defense.includes(player.id) }"
                >
                  {{ player.name }}
                </span>
              </div>
            </div>
          </div>

          <div class="bg-gray-700 p-4 rounded-lg">
            <label class="block text-sm font-medium">Nombre de Bouts (0-3)</label>
            <input
              type="number"
              v-model.number="bouts"
              min="0"
              max="3"
              class="w-full text-black p-2 rounded"
            />
          </div>

          <div class="bg-gray-700 p-4 rounded-lg">
            <label class="block text-sm font-medium">Points (0 - 91, step 0.5)</label>
            <input
              type="number"
              v-model.number="points"
              min="0"
              max="91"
              step="0.5"
              class="w-full text-black p-2 rounded"
            />
          </div>

          <div class="bg-gray-700 p-4 rounded-lg">
            <label class="block text-sm font-medium">Pour qui ?</label>
            <select v-model="pointsFor" class="w-full text-black p-2 rounded">
              <option value="attaque">Attaque</option>
              <option value="defense">Defense</option>
            </select>
          </div>

          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded w-full">
            Ajouter
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Sidebar from "@/Components/SideBar.vue";
import axios from "axios";

const annonces = ref([]);
const players = ref([]);
const selectedAnnonce = ref(null);
const preneur = ref(null);
const roi = ref(null);
const defense = ref([]);
const bouts = ref(0);
const points = ref(0);
const pointsFor = ref("attaque");

onMounted(async () => {
  const { data: annonceData } = await axios.get("/api/annonces");
  annonces.value = annonceData;

  const { data: playerData } = await axios.get("/api/list-players");
  players.value = playerData;
});
const selectPreneur = (playerId) => {
  if (preneur.value === playerId) {
    preneur.value = null; // Deselect if already selected
  } else {
    // Remove from other selections
    roi.value = roi.value === playerId ? null : roi.value;
    defense.value = defense.value.filter((id) => id !== playerId);
    preneur.value = playerId;
  }
};

const selectRoi = (playerId) => {
  if (roi.value === playerId) {
    roi.value = null; // Deselect if already selected
  } else {
    // Remove from other selections
    preneur.value = preneur.value === playerId ? null : preneur.value;
    defense.value = defense.value.filter((id) => id !== playerId);
    roi.value = playerId;
  }
};

const toggleDefense = (playerId) => {
  if (defense.value.includes(playerId)) {
    defense.value = defense.value.filter((id) => id !== playerId); // Remove if already selected
  } else {
    // Remove from other selections
    preneur.value = preneur.value === playerId ? null : preneur.value;
    roi.value = roi.value === playerId ? null : roi.value;

    // Ensure max 4 defense players
    if (defense.value.length < 4) {
      defense.value.push(playerId);
    }
  }
};

const submitGame = async () => {
  if (defense.value.length < 3 || defense.value.length > 4) {
    alert("Defense must have between 3 and 4 players.");
    return;
  }

  const gameData = {
    annonce_id: selectedAnnonce.value,
    preneur: preneur.value,
    roi: roi.value,
    defense: defense.value,
    nb_bouts: bouts.value,
    nb_points: points.value,
    points_for: pointsFor.value,
  };

  await axios.post("/api/games", gameData);
  alert("Game created successfully!");
};
</script>
