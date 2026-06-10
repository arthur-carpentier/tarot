<template>
  <AppShell>
    <div class="text-4xl md:text-6xl font-bold mb-6 text-center">
      <span>Nouvelle Partie</span>
    </div>

    <!-- Configuration du script d'écriture -->
    <div
      v-if="!scriptUrl || showConfig"
      class="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl mx-auto mb-6 border border-yellow-600"
    >
      <h2 class="text-xl font-semibold mb-2">
        <i class="fa-solid fa-gear mr-2"></i>Script d'enregistrement
      </h2>
      <p class="text-sm text-light-darker mb-4">
        La lecture se fait directement depuis le Google Sheet, mais l'ajout de parties
        passe par un script Google Apps Script déployé en Web App (voir le dossier
        <code class="bg-dark px-1 rounded">apps-script/</code> du dépôt). Collez ici
        l'URL du déploiement (<code class="bg-dark px-1 rounded"
          >https://script.google.com/macros/s/…/exec</code
        >).
      </p>
      <div class="flex gap-2 flex-wrap">
        <input
          v-model="scriptUrlInput"
          type="url"
          placeholder="https://script.google.com/macros/s/…/exec"
          class="flex-1 min-w-[16rem] bg-dark border-dark-lightest rounded p-2 text-light"
        />
        <button
          @click="saveScriptUrl"
          class="bg-blue-600 px-4 py-2 rounded font-semibold"
        >
          Enregistrer
        </button>
      </div>
    </div>

    <div class="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl mx-auto relative">
      <button
        v-if="scriptUrl"
        @click="showConfig = !showConfig"
        class="absolute top-3 right-3 text-light-darker hover:text-light"
        title="Configurer le script d'enregistrement"
      >
        <i class="fa-solid fa-gear"></i>
      </button>

      <form @submit.prevent="submitGame" class="space-y-6">
        <!-- Annonce -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <label class="block text-2xl font-semibold">Annonce</label>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            <template v-if="loading">
              <div
                v-for="n in 6"
                :key="n"
                class="h-16 bg-gray-600 rounded-lg animate-pulse"
              ></div>
            </template>
            <template v-else>
              <div
                v-for="annonce in annonces"
                :key="annonce.name"
                @click="
                  selectedAnnonce =
                    selectedAnnonce === annonce.name ? null : annonce.name
                "
                class="p-4 text-center font-semibold cursor-pointer rounded-lg transition-all duration-200"
                :class="{
                  'opacity-50 grayscale scale-95':
                    selectedAnnonce && selectedAnnonce !== annonce.name,
                  'scale-105 brightness-125 saturate-125':
                    selectedAnnonce === annonce.name,
                  'hover:brightness-110 hover:saturate-125':
                    selectedAnnonce !== annonce.name,
                }"
                :style="{ backgroundColor: annonceColor(annonce.name) }"
              >
                {{ annonce.name }}
                <span class="block text-xs opacity-80">×{{ annonce.multiplicateur }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Joueurs -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gray-700 p-4 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Attaque</h2>
            <div class="grid grid-cols-2 gap-4">
              <!-- Preneur -->
              <div>
                <label class="block text-sm font-medium mb-2">Preneur</label>
                <template v-if="loading">
                  <div
                    v-for="n in 4"
                    :key="n"
                    class="h-12 mb-2 bg-gray-600 rounded-lg animate-pulse"
                  ></div>
                </template>
                <template v-else>
                  <div
                    v-for="player in players"
                    :key="player"
                    class="flex items-center space-x-3 p-2 cursor-pointer"
                    @click="selectPreneur(player)"
                  >
                    <PlayerAvatar
                      :name="player"
                      class="transition-all duration-100"
                      :class="{
                        'outline outline-4 outline-red-500 opacity-100':
                          preneur === player,
                        'opacity-70 hover:opacity-100': preneur !== player,
                      }"
                    />
                    <span :class="{ 'font-bold': preneur === player }">
                      {{ player }}
                    </span>
                  </div>
                </template>
              </div>

              <!-- Appelé -->
              <div>
                <label class="block text-sm font-medium mb-2">
                  Appelé
                  <span class="block text-xs text-light-darker font-normal">
                    (le preneur peut s'appeler lui-même)
                  </span>
                </label>
                <template v-if="loading">
                  <div
                    v-for="n in 4"
                    :key="n"
                    class="h-12 mb-2 bg-gray-600 rounded-lg animate-pulse"
                  ></div>
                </template>
                <template v-else>
                  <div
                    v-for="player in players"
                    :key="player"
                    class="flex items-center space-x-3 p-2 cursor-pointer"
                    @click="selectAppele(player)"
                  >
                    <PlayerAvatar
                      :name="player"
                      class="transition-all duration-100"
                      :class="{
                        'outline outline-4 outline-yellow-500 opacity-100':
                          appele === player,
                        'opacity-70 hover:opacity-100': appele !== player,
                      }"
                    />
                    <span :class="{ 'font-bold': appele === player }">
                      {{ player }}
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <div class="bg-gray-700 p-4 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Défense</h2>
            <label class="block text-sm font-medium mb-2">
              Sélectionner 3-4 joueurs
            </label>
            <template v-if="loading">
              <div
                v-for="n in 4"
                :key="n"
                class="h-12 mb-2 bg-gray-600 rounded-lg animate-pulse"
              ></div>
            </template>
            <template v-else>
              <div
                v-for="player in players"
                :key="player"
                class="flex items-center space-x-3 p-2 cursor-pointer"
                @click="toggleDefense(player)"
              >
                <PlayerAvatar
                  :name="player"
                  class="transition-all duration-100"
                  :class="{
                    'outline outline-4 outline-blue-500 opacity-100': defense.includes(
                      player
                    ),
                    'opacity-70 hover:opacity-100': !defense.includes(player),
                  }"
                />
                <span :class="{ 'font-bold': defense.includes(player) }">
                  {{ player }}
                </span>
              </div>
            </template>
          </div>
        </div>

        <!-- Pour qui sont comptés points et bouts -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <label class="block text-2xl font-semibold">Points comptés pour…</label>
          <p class="text-sm text-light-darker">
            Les points et les bouts saisis ci-dessous sont ceux de ce camp.
          </p>
          <div class="grid grid-cols-2 gap-4 mt-2">
            <div
              @click="pour = pour === 'Attaque' ? null : 'Attaque'"
              class="p-4 text-center font-semibold cursor-pointer rounded-lg transition-all duration-200 hover:brightness-110 hover:saturate-125"
              :style="{ backgroundColor: '#dc2626' }"
              :class="{
                'scale-105': pour === 'Attaque',
                'grayscale opacity-50 hover:opacity-100 scale-95':
                  pour && pour !== 'Attaque',
              }"
            >
              Attaque
            </div>
            <div
              @click="pour = pour === 'Défense' ? null : 'Défense'"
              class="p-4 text-center font-semibold cursor-pointer rounded-lg transition-all duration-200 hover:brightness-110 hover:saturate-125"
              :style="{ backgroundColor: '#2563eb' }"
              :class="{
                'scale-105': pour === 'Défense',
                'grayscale opacity-50 hover:opacity-100 scale-95':
                  pour && pour !== 'Défense',
              }"
            >
              Défense
            </div>
          </div>
        </div>

        <!-- Bouts -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <label class="block text-2xl font-semibold">
            Bouts<span v-if="pour" class="text-base font-normal text-light-darker">
              ({{ pour }})</span
            >
          </label>
          <div class="grid grid-cols-3 gap-4 mt-2">
            <div
              v-for="bout in bouts"
              :key="bout"
              @click="toggleBout(bout)"
              class="p-4 text-center font-semibold cursor-pointer rounded-lg transition-all duration-200"
              :class="{
                'opacity-50 grayscale scale-95': !selectedBouts.includes(bout),
                'brightness-125 saturate-125': selectedBouts.includes(bout),
                'hover:brightness-110 hover:saturate-125': !selectedBouts.includes(bout),
              }"
              :style="{ backgroundColor: '#007700' }"
            >
              {{ bout }}
            </div>
          </div>
        </div>

        <!-- Points -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <label class="block text-2xl font-semibold">
            Points<span v-if="pour" class="text-base font-normal text-light-darker">
              ({{ pour }})</span
            >
          </label>
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
              <div class="flex text-sm text-light-700 -mt-1">
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
              class="text-dark p-1 rounded -translate-y-2 w-16"
            />
          </div>
        </div>

        <!-- Bonus -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <label class="block text-2xl font-semibold">Bonus</label>
          <div class="grid gap-4 mt-2">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                v-for="bonus in bonusToggles"
                :key="bonus.key"
                @click="toggles[bonus.key] = !toggles[bonus.key]"
                class="p-4 text-center font-semibold cursor-pointer rounded-lg transition-all duration-200"
                :class="{
                  'opacity-50 grayscale scale-95': !toggles[bonus.key],
                  'brightness-125 saturate-125': toggles[bonus.key],
                  'hover:brightness-110 hover:saturate-125': !toggles[bonus.key],
                }"
                :style="{ backgroundColor: '#007700' }"
              >
                {{ bonus.label }}
                <span class="block text-xs opacity-80">+{{ bonus.points }} pts</span>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div
                v-for="poignee in poigneeToggles"
                :key="poignee.key"
                @click="togglePoignee(poignee.key)"
                class="p-4 text-center font-semibold cursor-pointer rounded-lg transition-all duration-200"
                :class="{
                  'opacity-50 grayscale scale-95': !toggles[poignee.key],
                  'brightness-125 saturate-125': toggles[poignee.key],
                  'hover:brightness-110 hover:saturate-125': !toggles[poignee.key],
                }"
                :style="{ backgroundColor: '#007700' }"
              >
                {{ poignee.label }}
                <span class="block text-xs opacity-80">+{{ poignee.points }} pts</span>
              </div>
            </div>
          </div>
        </div>

        <p v-if="submitError" class="text-red-400 font-semibold text-center">
          {{ submitError }}
        </p>
        <p v-if="submitSuccess" class="text-green-bright font-semibold text-center">
          Partie n°{{ submitSuccess }} enregistrée dans le Google Sheet !
        </p>

        <button
          type="submit"
          class="bg-blue-600 text-light px-4 py-2 rounded w-full text-2xl font-semibold"
          :class="{ 'bg-gray-500 cursor-not-allowed': isDisabled || submitting }"
          :disabled="isDisabled || submitting"
        >
          {{ submitting ? "Enregistrement…" : "Ajouter" }}
        </button>
      </form>
    </div>

    <!-- Prévisualisation des points -->
    <div
      class="bg-gray-800 p-6 rounded-lg shadow-lg mx-auto max-w-4xl md:max-w-xl mt-4"
      v-if="preview"
    >
      <div class="bg-gray-700 p-4 px-6 md:px-12 rounded-lg">
        <div class="block text-2xl font-semibold text-center">
          <span>Prévisualisation des points</span>
        </div>
        <p class="text-center text-sm text-light-darker mt-1">
          {{ preview.fait ? "Contrat fait" : "Contrat chuté" }} de
          {{ Math.abs(preview.pointsAttaque - preview.pointsAFaire).toFixed(1) }}
          ({{ preview.pointsAttaque.toFixed(1) }} / {{ preview.pointsAFaire }})
        </p>
        <div class="mt-2 p-3 max-w-96 mx-auto space-y-4">
          <div
            v-for="entry in preview.entries"
            :key="entry.name"
            class="grid grid-cols-2"
          >
            <div class="relative flex space-x-4 items-center">
              <PlayerAvatar
                :name="entry.name"
                :class="`outline outline-4 ${entry.outline}`"
              />
              <span>{{ entry.name }}</span>
            </div>
            <span
              class="my-auto text-right"
              :class="entry.points >= 0 ? 'text-green-400' : 'text-red-400'"
            >
              {{ (entry.points >= 0 ? "+" : "") + entry.points.toFixed(1) }} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import AppShell from "@/Components/AppShell.vue";
import PlayerAvatar from "@/Components/PlayerAvatar.vue";
import { useTarotData } from "@/composables/useTarotData";
import { appendGame } from "@/services/sheets";
import { computeRound, distributePoints } from "@/services/scoring";
import { getAppsScriptUrl, setAppsScriptUrl } from "@/config";

const { players, annonces, bonuses, poignees, loading, refresh } = useTarotData();

const selectedAnnonce = ref(null);
const preneur = ref(null);
const appele = ref(null);
const defense = ref([]);
const selectedBouts = ref([]);
const points = ref(41);
const pour = ref(null);
const submitting = ref(false);
const submitError = ref(null);
const submitSuccess = ref(null);

const showConfig = ref(false);
const scriptUrl = ref(getAppsScriptUrl());
const scriptUrlInput = ref(scriptUrl.value);

const bouts = ["Petit", "Vingt-et-Un", "Excuse"];

// Q..V de la feuille "Parties"
const toggles = reactive({
  petitAuBout: false,
  misereTetes: false,
  misereAtouts: false,
  simplePoignee: false,
  doublePoignee: false,
  triplePoignee: false,
});

const findBonusPoints = (label, fallback) =>
  bonuses.value.find((b) => b.name.toLowerCase().startsWith(label))?.points ?? fallback;

const bonusToggles = computed(() => [
  { key: "petitAuBout", label: "Petit au bout", points: findBonusPoints("petit", 30) },
  {
    key: "misereTetes",
    label: "Misère de têtes",
    points: findBonusPoints("misère de", 60),
  },
  {
    key: "misereAtouts",
    label: "Misère d'atouts",
    points: findBonusPoints("misère d'", 90),
  },
]);

const poigneeToggles = computed(() => {
  const labels = ["Simple poignée", "Double poignée", "Triple poignée"];
  const keys = ["simplePoignee", "doublePoignee", "triplePoignee"];
  return keys.map((key, i) => ({
    key,
    label: poignees.value[i]
      ? `${labels[i]} (${poignees.value[i].atouts} atouts)`
      : labels[i],
    points: poignees.value[i]?.points ?? [20, 30, 40][i],
  }));
});

// Une seule taille de poignée à la fois
const togglePoignee = (key) => {
  const wasActive = toggles[key];
  toggles.simplePoignee = false;
  toggles.doublePoignee = false;
  toggles.triplePoignee = false;
  toggles[key] = !wasActive;
};

const ANNONCE_COLORS = {
  Petite: "#2563eb",
  Garde: "#007700",
  "Garde sans": "#d97706",
  "Garde contre": "#dc2626",
  "Petit chelem": "#7c3aed",
  "Grand chelem": "#be185d",
};
const annonceColor = (name) => ANNONCE_COLORS[name] || "#555";

const selectPreneur = (player) => {
  if (preneur.value === player) {
    preneur.value = null;
  } else {
    defense.value = defense.value.filter((name) => name !== player);
    preneur.value = player;
  }
};

const selectAppele = (player) => {
  if (appele.value === player) {
    appele.value = null;
  } else {
    defense.value = defense.value.filter((name) => name !== player);
    appele.value = player;
  }
};

const toggleDefense = (player) => {
  if (defense.value.includes(player)) {
    defense.value = defense.value.filter((name) => name !== player);
  } else {
    preneur.value = preneur.value === player ? null : preneur.value;
    appele.value = appele.value === player ? null : appele.value;
    if (defense.value.length < 4) {
      defense.value.push(player);
    }
  }
};

const toggleBout = (bout) => {
  if (selectedBouts.value.includes(bout)) {
    selectedBouts.value = selectedBouts.value.filter((b) => b !== bout);
  } else {
    selectedBouts.value.push(bout);
  }
};

const getColor = (value) => {
  const redRange = 25;
  const yellowRange = 41;
  const greenRange = 56;
  const cyanRange = 91;

  if (value <= redRange) {
    const ratio = value / redRange;
    return `rgb(255, ${Math.round(ratio * 255)}, 0)`;
  } else if (value <= yellowRange) {
    const ratio = (value - redRange) / (yellowRange - redRange);
    return `rgb(${Math.round((1 - ratio) * 255)}, 255, 0)`;
  } else if (value <= greenRange) {
    const ratio = (value - yellowRange) / (greenRange - yellowRange);
    return `rgb(0, 255, ${Math.round(ratio * 255)})`;
  } else if (value <= cyanRange) {
    const ratio = (value - greenRange) / (cyanRange - greenRange);
    return `rgb(${Math.round(ratio * 255)}, ${Math.round((1 - ratio) * 255)}, 255)`;
  }
  return "rgb(128, 0, 255)";
};

const isDisabled = computed(
  () =>
    !preneur.value ||
    !appele.value ||
    defense.value.length < 3 ||
    !selectedAnnonce.value ||
    !pour.value
);

const bonusPoints = computed(() => {
  let total = 0;
  if (toggles.petitAuBout) total += bonusToggles.value[0].points;
  if (toggles.misereTetes) total += bonusToggles.value[1].points;
  if (toggles.misereAtouts) total += bonusToggles.value[2].points;
  poigneeToggles.value.forEach((p) => {
    if (toggles[p.key]) total += p.points;
  });
  return total;
});

const preview = computed(() => {
  if (isDisabled.value) return null;
  const annonce = annonces.value.find((a) => a.name === selectedAnnonce.value);
  if (!annonce) return null;

  const round = computeRound({
    annonce,
    pointsTour: points.value,
    nbBouts: selectedBouts.value.length,
    pour: pour.value,
    bonusPoints: bonusPoints.value,
  });

  const share = distributePoints({
    preneur: preneur.value,
    appele: appele.value,
    defenseurs: defense.value,
    pointsPerdusDefenseur: round.pointsPerdusDefenseur,
  });

  const entries = [
    { name: preneur.value, outline: "outline-red-500", points: share[preneur.value] },
  ];
  if (appele.value !== preneur.value) {
    entries.push({
      name: appele.value,
      outline: "outline-yellow-500",
      points: share[appele.value],
    });
  }
  defense.value.forEach((name) =>
    entries.push({ name, outline: "outline-blue-500", points: share[name] })
  );

  return { ...round, entries };
});

const saveScriptUrl = () => {
  setAppsScriptUrl(scriptUrlInput.value);
  scriptUrl.value = getAppsScriptUrl();
  showConfig.value = false;
};

const submitGame = async () => {
  submitError.value = null;
  submitSuccess.value = null;
  submitting.value = true;
  try {
    const result = await appendGame({
      preneur: preneur.value,
      appele: appele.value,
      defenseurs: defense.value,
      annonce: selectedAnnonce.value,
      pointsTour: points.value,
      nbBouts: selectedBouts.value.length,
      pour: pour.value,
      petitAuBout: toggles.petitAuBout,
      misereTetes: toggles.misereTetes,
      misereAtouts: toggles.misereAtouts,
      simplePoignee: toggles.simplePoignee,
      doublePoignee: toggles.doublePoignee,
      triplePoignee: toggles.triplePoignee,
    });
    submitSuccess.value = result.numero || "?";
    // Réinitialise le formulaire et recharge les données de la feuille
    preneur.value = null;
    appele.value = null;
    defense.value = [];
    selectedAnnonce.value = null;
    selectedBouts.value = [];
    points.value = 41;
    pour.value = null;
    Object.keys(toggles).forEach((key) => (toggles[key] = false));
    refresh();
  } catch (error) {
    submitError.value = error.message || String(error);
  } finally {
    submitting.value = false;
  }
};
</script>

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
