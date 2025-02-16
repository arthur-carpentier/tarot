<template>
  <div
    class="flex min-h-screen bg-green-900 text-white"
    style="font-family: 'Poppins', sans-serif"
  >
    <Sidebar class="fixed" />
    <main class="flex-1 px-6 py-10 relative ml-64">
      <div class="text-6xl font-bold mb-6 text-center">
        <span>Nouvelle Partie</span>
      </div>
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        <form @submit.prevent="submitGame" class="space-y-6">
          <div class="bg-gray-700 p-4 rounded-lg">
            <label class="text-2xl font-semibold flex justify-between"
              >Enculette
              <div class="flex items-center justify-between">
                <div
                  @click="enculette = !enculette"
                  class="relative w-14 h-8 bg-gray-500 rounded-full transition-all duration-300 flex items-center cursor-pointer"
                  :class="enculette ? 'bg-green-500' : 'bg-gray-500'"
                >
                  <span
                    class="absolute w-6 h-6 bg-white rounded-full transition-all duration-300"
                    :class="enculette ? 'translate-x-7' : 'translate-x-1'"
                  ></span>
                </div></div
            ></label>
          </div>

          <div class="bg-gray-700 p-4 rounded-lg" v-if="!enculette">
            <label class="block text-2xl font-semibold">Annonce</label>
            <div class="grid grid-cols-4 gap-4 mt-2">
              <template v-if="loadingAnnonces">
                <div
                  v-for="n in 4"
                  :key="n"
                  class="h-16 bg-gray-600 rounded-lg animate-pulse"
                ></div>
              </template>
              <template v-else>
                <div
                  v-for="annonce in annonces"
                  :key="annonce.id"
                  @click="
                    selectedAnnonce = selectedAnnonce == annonce.id ? null : annonce.id
                  "
                  class="p-4 text-center font-semibold cursor-pointer rounded-lg transition-all duration-200"
                  :class="{
                    'opacity-50 grayscale scale-95':
                      selectedAnnonce && selectedAnnonce !== annonce.id,
                    'scale-105 brightness-125 saturate-125':
                      selectedAnnonce === annonce.id,
                    'hover:brightness-110 hover:saturate-125':
                      selectedAnnonce !== annonce.id,
                  }"
                  :style="{ backgroundColor: annonce.color || '#555' }"
                >
                  {{ annonce.name }}
                </div>
              </template>
            </div>
          </div>

          <!-- Player Selection Section with Skeleton -->
          <div class="grid grid-cols-2 gap-6">
            <div class="bg-gray-700 p-4 rounded-lg">
              <h2 class="text-xl font-semibold mb-4">Attaque</h2>
              <div class="grid grid-cols-2 gap-4">
                <!-- Preneur -->
                <div>
                  <label class="block text-sm font-medium mb-2">Preneur</label>
                  <template v-if="loadingPlayers">
                    <div
                      v-for="n in 4"
                      :key="n"
                      class="h-12 mb-2 bg-gray-600 rounded-lg animate-pulse"
                    ></div>
                  </template>
                  <template v-else>
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
                  </template>
                </div>

                <!-- Roi -->
                <div>
                  <label class="block text-sm font-medium mb-2">Roi (Optionnel)</label>
                  <template v-if="loadingPlayers">
                    <div
                      v-for="n in 4"
                      :key="n"
                      class="h-12 mb-2 bg-gray-600 rounded-lg animate-pulse"
                    ></div>
                  </template>
                  <template v-else>
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
                  </template>
                </div>
              </div>
            </div>

            <div class="bg-gray-700 p-4 rounded-lg">
              <h2 class="text-xl font-semibold mb-4">Défense</h2>
              <label class="block text-sm font-medium mb-2"
                >Sélectionner 3-4 Joueurs</label
              >
              <template v-if="loadingPlayers">
                <div
                  v-for="n in 4"
                  :key="n"
                  class="h-12 mb-2 bg-gray-600 rounded-lg animate-pulse"
                ></div>
              </template>
              <template v-else>
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
              </template>
            </div>
          </div>

          <div class="bg-gray-700 p-4 rounded-lg" v-if="!enculette">
            <label class="block text-2xl font-semibold">Bouts</label>
            <div class="grid grid-cols-3 gap-4 mt-2">
              <div
                v-for="bout in bouts"
                :key="bout.id"
                @click="toggleBout(bout.id)"
                class="p-4 text-center font-semibold cursor-pointer rounded-lg transition-all duration-200"
                :class="{
                  'opacity-50 grayscale scale-95': !selectedBouts.includes(bout.id),
                  'brightness-125 saturate-125': selectedBouts.includes(bout.id),
                  'hover:brightness-110 hover:saturate-125': !selectedBouts.includes(
                    bout.id
                  ),
                }"
                :style="{ backgroundColor: '#007700' }"
              >
                {{ bout.name }}
              </div>
            </div>
          </div>

          <div class="bg-gray-700 p-4 rounded-lg" v-if="!enculette">
            <label class="block text-2xl font-semibold">Points</label>
            <div class="flex items-center space-x-4">
              <div class="relative w-full">
                <input
                  type="range"
                  v-model.number="points"
                  min="0"
                  max="91"
                  step="0.5"
                  class="w-full cursor-pointer custom-range"
                  :style="{
                    '--slider-color': getColor(points),
                    '--fill-percent': (points / 91) * 100,
                  }"
                />
                <div class="flex text-sm text-white-700 -mt-1">
                  <span>0</span>
                  <span class="ml-[37%]">36</span>
                  <span class="ml-[3.4%]">41</span>
                  <span class="ml-[9.2%]">51</span>
                  <span class="ml-[3.4%]">56</span>
                  <span class="ml-[36%]">91</span>
                </div>
              </div>

              <input
                type="number"
                v-model.number="points"
                min="0"
                max="91"
                step="0.5"
                class="text-black p-1 rounded -translate-y-2 w-16"
              />
            </div>
          </div>

          <div class="bg-gray-700 p-4 rounded-lg" v-if="!enculette">
            <label class="block text-2xl font-semibold">Pour qui ?</label>
            <div class="grid grid-cols-2 gap-4 mt-2">
              <div
                @click="pointsFor = pointsFor == 'attaque' ? null : 'attaque'"
                class="p-4 text-center font-semibold cursor-pointer rounded-lg transition-all duration-200 hover:brightness-110 hover:saturate-125"
                :style="{ backgroundColor: '#dc2626' }"
                :class="{
                  'text-white': !pointsFort || pointsFor === 'attaque',
                  'scale-105 ml-2': pointsFor === 'attaque',
                  'grayscale opacity-50 hover:opacity-100 scale-95':
                    pointsFor && pointsFor !== 'attaque',
                }"
              >
                Attaque
              </div>
              <div
                @click="pointsFor = pointsFor == 'defense' ? null : 'defense'"
                class="p-4 text-center font-semibold cursor-pointer rounded-lg transition-all duration-200 hover:brightness-110 hover:saturate-125"
                :style="{ backgroundColor: '#2563eb' }"
                :class="{
                  'text-white': !pointsFort || pointsFor === 'defense',
                  'scale-105 mr-2': pointsFor === 'defense',
                  'grayscale opacity-50 hover:opacity-100 scale-95':
                    pointsFor && pointsFor !== 'defense',
                }"
              >
                Défense
              </div>
            </div>
          </div>

          <div class="bg-gray-700 p-4 rounded-lg" v-if="!enculette">
            <label class="block text-2xl font-semibold">Bonus</label>
            <div class="grid gap-4 mt-2">
              <template v-if="loadingBonuses">
                <div class="grid grid-cols-3 gap-4">
                  <div
                    v-for="n in 3"
                    :key="n"
                    class="h-16 bg-gray-600 rounded-lg animate-pulse scale-95"
                  ></div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div
                    v-for="n in 2"
                    :key="n"
                    class="h-16 bg-gray-600 rounded-lg animate-pulse scale-95"
                  ></div>
                </div>
              </template>
              <template v-else>
                <div class="grid grid-cols-3 gap-4">
                  <div
                    v-for="bonus in bonuses.slice(0, 3)"
                    :key="bonus.id"
                    @click="toggleBonus(bonus.id)"
                    class="p-4 text-center font-semibold cursor-pointer rounded-lg transition-all duration-200"
                    :class="{
                      'opacity-50 grayscale scale-95': !selectedBonuses.includes(
                        bonus.id
                      ),
                      'brightness-125 saturate-125': selectedBonuses.includes(bonus.id),
                      'hover:brightness-110 hover:saturate-125': !selectedBonuses.includes(
                        bonus.id
                      ),
                    }"
                    :style="{ backgroundColor: '#007700' }"
                  >
                    {{ bonus.name }}
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div
                    v-for="bonus in bonuses.slice(3, 6)"
                    :key="bonus.id"
                    @click="toggleBonus(bonus.id)"
                    class="p-4 text-center font-semibold cursor-pointer rounded-lg transition-all duration-200"
                    :class="{
                      'opacity-50 grayscale scale-95': !selectedBonuses.includes(
                        bonus.id
                      ),
                      'brightness-125 saturate-125': selectedBonuses.includes(bonus.id),
                      'hover:brightness-110 hover:saturate-125': !selectedBonuses.includes(
                        bonus.id
                      ),
                    }"
                    :style="{ backgroundColor: '#007700' }"
                  >
                    {{ bonus.name }}
                  </div>
                </div>
              </template>
            </div>
          </div>

          <button
            type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded w-full text-2xl font-semibold"
            :class="{
              'bg-gray-500 cursor-not-allowed': isDisabled,
            }"
            :disabled="isDisabled"
          >
            Ajouter
          </button>
        </form>
      </div>
      <div
        class="bg-gray-800 p-6 rounded-lg shadow-lg mx-auto max-w-[35vw] mt-4"
        v-if="preneur && defense.length > 0"
      >
        <div class="bg-gray-700 p-4 px-12 rounded-lg">
          <div class="block text-2xl font-semibold justify-self-center">
            <span>Prévisualisation des points</span>
          </div>
          <div class="mt-2 p-3 max-w-96 mx-auto">
            <!-- Preneur -->
            <div v-if="preneurPlayer" class="grid grid-cols-2">
              <div class="relative flex space-x-4">
                <img
                  :src="
                    preneurPlayer.photo
                      ? `/storage/${preneurPlayer.photo}`
                      : '/images/default-avatar.png'
                  "
                  class="w-12 h-12 rounded-full shadow-md transition-all duration-100 outline outline-4 outline-red-500 opacity-100"
                />
                <span class="transition-all duration-200 my-auto">
                  {{ preneurPlayer.name }}
                </span>
              </div>
              <span
                class="my-auto"
                :class="{
                  'text-green-400': pointsAmount > 0,
                  'text-red-400': pointsAmount < 0,
                }"
                >{{
                  (pointsAmount > 0 ? "+" : "") +
                  (pointsAmount * (roiPlayer ? 2 / 3 : 1)).toFixed(1) +
                  "pts"
                }}</span
              >
            </div>

            <!-- Roi -->
            <div v-if="roiPlayer" class="grid grid-cols-2 mt-4">
              <div class="relative flex space-x-4">
                <img
                  :src="
                    roiPlayer.photo
                      ? `/storage/${roiPlayer.photo}`
                      : '/images/default-avatar.png'
                  "
                  class="w-12 h-12 rounded-full shadow-md transition-all duration-100 outline outline-4 outline-yellow-500 opacity-100"
                />
                <span class="transition-all duration-200 my-auto">
                  {{ roiPlayer.name }}
                </span>
              </div>
              <span
                class="my-auto"
                :class="{
                  'text-green-400': pointsAmount > 0,
                  'text-red-400': pointsAmount < 0,
                }"
                >{{
                  (pointsAmount > 0 ? "+" : "") + (pointsAmount / 3).toFixed(1) + "pts"
                }}</span
              >
            </div>

            <!-- Défense -->
            <div
              v-for="defender in defensePlayers"
              :key="defender.id"
              class="grid grid-cols-2 mt-4"
            >
              <div class="relative flex space-x-4">
                <img
                  :src="
                    defender.photo
                      ? `/storage/${defender.photo}`
                      : '/images/default-avatar.png'
                  "
                  class="w-12 h-12 rounded-full shadow-md transition-all duration-100 outline outline-4 outline-blue-500 opacity-100"
                />
                <span class="transition-all duration-200 my-auto">
                  {{ defender.name }}
                </span>
              </div>
              <span
                class="my-auto"
                :class="{
                  'text-green-400': pointsAmount < 0,
                  'text-red-400': pointsAmount > 0,
                }"
                >{{
                  (pointsAmount < 0 ? "+" : "") +
                  ((-1 * pointsAmount) / defense.length).toFixed(1) +
                  "pts"
                }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
<style scoped>
.custom-range {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
}

.custom-range::-webkit-slider-runnable-track {
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(
    to right,
    var(--slider-color) 0%,
    var(--slider-color) calc(var(--fill-percent) * 1%),
    gray calc(var(--fill-percent) * 1%),
    gray 100%
  );
}

.custom-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0px;
  height: 24px;
  background: black;
  border-radius: 50%;
  margin-top: -4px;
  position: relative;
  z-index: 2;
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
</style>
<script setup>
import { ref, computed, onMounted } from "vue";
import Sidebar from "@/Components/SideBar.vue";
import axios from "axios";

const annonces = ref([]);
const bonuses = ref([]);
const players = ref([]);
const loadingAnnonces = ref(true);
const loadingBonuses = ref(true);
const loadingPlayers = ref(true);
const selectedAnnonce = ref(null);
const preneur = ref(null);
const roi = ref(null);
const defense = ref([]);
const selectedBouts = ref([]);
const selectedBonuses = ref([]);
const points = ref(20);
const pointsFor = ref(null);
const enculette = ref(false);
const bouts = [
  {
    id: 1,
    name: "Petit",
  },
  {
    id: 2,
    name: "Vingt-et-Un",
  },
  {
    id: 3,
    name: "Excuse",
  },
];
onMounted(async () => {
  try {
    const { data: annonceData } = await axios.get("/api/annonces");
    annonces.value = annonceData;
  } catch (error) {
    console.error("Error fetching annonces", error);
  } finally {
    loadingAnnonces.value = false;
  }
  try {
    const { data: bonusData } = await axios.get("/api/bonuses");
    bonuses.value = bonusData;
  } catch (error) {
    console.error("Error fetching bonuses", error);
  } finally {
    loadingBonuses.value = false;
  }

  try {
    const { data: playerData } = await axios.get("/api/players");
    players.value = playerData;
  } catch (error) {
    console.error("Error fetching players", error);
  } finally {
    loadingPlayers.value = false;
  }
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
const toggleBout = (boutId) => {
  if (selectedBouts.value.includes(boutId)) {
    selectedBouts.value = selectedBouts.value.filter((id) => id !== boutId); // Remove if already selected
  } else {
    selectedBouts.value.push(boutId);
  }
};
const toggleBonus = (bonusId) => {
  const groupIds = [1, 2, 3]; // The restricted group

  if (selectedBonuses.value.includes(bonusId)) {
    // Remove the bonus if it's already selected
    selectedBonuses.value = selectedBonuses.value.filter((id) => id !== bonusId);
  } else {
    // Check if the selected bonus is part of the restricted group
    if (groupIds.includes(bonusId)) {
      // Remove any existing bonus from the restricted group
      selectedBonuses.value = selectedBonuses.value.filter(
        (id) => !groupIds.includes(id)
      );
    }
    // Add the new bonus
    selectedBonuses.value.push(bonusId);
  }
};

const getColor = (value) => {
  // Define color ranges (total range is 91 units)
  const redRange = 25;
  const yellowRange = 41;
  const greenRange = 56;
  const cyanRange = 91;
  const pinkRange = 91;

  // Calculate color based on value
  if (value <= redRange) {
    // Red to Yellow transition
    const ratio = value / redRange;
    return `rgb(
      ${Math.round(255)},
      ${Math.round(ratio * 255)},
      ${Math.round(ratio * 0)}
    )`;
  } else if (value <= yellowRange) {
    // Yellow to Green transition
    const ratio = (value - redRange) / (yellowRange - redRange);
    return `rgb(
      ${Math.round((1 - ratio) * 255)},
      ${Math.round(255)},
      ${Math.round(ratio * 0)}
    )`;
  } else if (value <= greenRange) {
    // Green to Cyan transition
    const ratio = (value - yellowRange) / (greenRange - yellowRange);
    return `rgb(
      ${Math.round(0)},
      ${Math.round(255)},
      ${Math.round(ratio * 255)}
    )`;
  } else if (value <= cyanRange) {
    // Cyan to Purple transition
    const ratio = (value - greenRange) / (cyanRange - greenRange);
    return `rgb(
      ${Math.round(ratio * 255)},
      ${Math.round((1 - ratio) * 255)},
      ${Math.round(255)}
    )`;
  } else {
    // Pink (final color)
    return "rgb(128, 0, 255)";
  }
};

const isDisabled = computed(() => {
  return (
    !defense.value.length ||
    !preneur.value ||
    ((!selectedAnnonce.value || !pointsFor.value) && !enculette.value)
  );
});

const pointsAmount = computed(() => {
  const basePoints = 25;

  const boutsValue =
    pointsFor.value == "attaque"
      ? selectedBouts.value?.length
      : 3 - selectedBouts.value?.length;
  const pointsValue = pointsFor.value == "attaque" ? points.value : 91 - points.value;

  const pointsObjectiveArray = {
    0: 56,
    1: 51,
    2: 41,
    3: 36,
  };

  const pointsObjective = pointsObjectiveArray[boutsValue] || 56;
  const pointsOffset = pointsValue - pointsObjective;
  const sign = Math.sign(pointsOffset);
  const pointsOffsetAbsoluteValue = Math.abs(pointsOffset);
  const selectedBonusesPoints = bonuses.value
    .filter((bonus) => selectedBonuses.value.includes(bonus.id))
    .reduce((sum, bonus) => sum + bonus.points, 0);

  const selectedAnnonceMultiplier =
    annonces.value.find((a) => a.id === selectedAnnonce.value)?.multiplicateur || 1;
  if (enculette.value === true) {
    return -1 * (basePoints + 10) * 2;
  }
  return (
    (sign == 0 ? 1 : sign) *
    (basePoints + pointsOffsetAbsoluteValue + selectedBonusesPoints) *
    selectedAnnonceMultiplier
  );
});

const preneurPlayer = computed(() => players.value.find((p) => p.id === preneur.value));
const roiPlayer = computed(() => players.value.find((p) => p.id === roi.value));
const defensePlayers = computed(() =>
  players.value.filter((p) => defense.value.includes(p.id))
);

const submitGame = async () => {
  console.log("issou");
  if (defense.value.length < 3 || defense.value.length > 4) {
    alert("Defense must have between 3 and 4 players.");
    return;
  }

  const gameData = {
    annonce_id: selectedAnnonce.value,
    preneur: preneur.value,
    roi: roi.value,
    defense: defense.value,
    nb_bouts: selectedBouts.value.length,
    nb_points: points.value,
    points_for: pointsFor.value,
    bonuses: selectedBonuses.value,
    enculette: enculette.value,
  };

  await axios.post("/api/games", gameData);
  alert("Game created successfully!");
};
</script>
