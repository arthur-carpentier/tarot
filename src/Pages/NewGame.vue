<template>
  <AppShell>
    <div class="max-w-2xl mx-auto pb-36">
      <h1 class="text-3xl md:text-4xl font-bold mb-6 text-center">Nouvelle partie</h1>

      <!-- Configuration du script d'écriture -->
      <div
        v-if="!scriptUrl || showConfig"
        class="bg-watergreen dark:bg-navy p-4 md:p-6 rounded-lg shadow-lg mb-6 border-2 border-chartreuse"
      >
        <h2 class="text-lg font-semibold mb-2">
          <i class="fa-solid fa-gear mr-2"></i>Script d'enregistrement
        </h2>
        <p class="text-sm text-navy/60 dark:text-periwinkle/80 mb-4">
          L'ajout de parties passe par un script Google Apps Script déployé en Web App
          (voir <code class="bg-navy/10 dark:bg-white/10 px-1 rounded">apps-script/</code>
          dans le dépôt). Collez ici l'URL du déploiement
          (<code class="bg-navy/10 dark:bg-white/10 px-1 rounded">…/exec</code>).
        </p>
        <div class="flex gap-2 flex-wrap">
          <input
            v-model="scriptUrlInput"
            type="url"
            placeholder="https://script.google.com/macros/s/…/exec"
            class="flex-1 min-w-[14rem] bg-white dark:bg-white/10 border-navy/20 dark:border-white/20 rounded p-2 text-navy dark:text-white"
          />
          <button
            @click="saveScriptUrl"
            class="bg-chartreuse text-navy px-4 py-2 rounded font-semibold hover:brightness-95"
          >
            Enregistrer
          </button>
        </div>
      </div>

      <form @submit.prevent="submitGame" class="space-y-4">
        <!-- 1. Annonce -->
        <section class="bg-watergreen dark:bg-navy rounded-lg shadow p-4 relative">
          <button
            v-if="scriptUrl"
            type="button"
            @click="showConfig = !showConfig"
            class="absolute top-3 right-3 text-navy/40 dark:text-periwinkle/60 hover:text-navy dark:hover:text-white"
            title="Configurer le script d'enregistrement"
          >
            <i class="fa-solid fa-gear"></i>
          </button>
          <h2 class="flex items-center gap-2 text-lg font-semibold mb-3">
            <span class="step-badge">1</span>Annonce
          </h2>
          <div v-if="loading" class="grid grid-cols-3 gap-2">
            <div v-for="n in 6" :key="n" class="h-12 bg-navy/10 dark:bg-white/10 rounded-lg animate-pulse"></div>
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              v-for="annonce in annonces"
              :key="annonce.name"
              type="button"
              @click="selectedAnnonce = selectedAnnonce === annonce.name ? null : annonce.name"
              class="px-3 py-2.5 text-center font-semibold rounded-lg transition-all duration-150 ring-1 ring-navy/10 dark:ring-white/10"
              :class="{
                'opacity-40 grayscale': selectedAnnonce && selectedAnnonce !== annonce.name,
                'ring-2 !ring-navy dark:!ring-chartreuse scale-[1.02]': selectedAnnonce === annonce.name,
              }"
              :style="annonceStyle(annonce.name)"
            >
              {{ annonce.name }}
              <span class="block text-xs opacity-75">×{{ annonce.multiplicateur }}</span>
            </button>
          </div>
        </section>

        <!-- 2. Attaque -->
        <section class="bg-watergreen dark:bg-navy rounded-lg shadow p-4">
          <h2 class="flex items-center gap-2 text-lg font-semibold mb-3">
            <span class="step-badge">2</span>Attaque
          </h2>

          <div v-if="loading" class="flex flex-wrap gap-2">
            <div v-for="n in 6" :key="n" class="h-9 w-24 bg-navy/10 dark:bg-white/10 rounded-full animate-pulse"></div>
          </div>
          <template v-else>
            <p class="text-sm font-medium mb-2">
              Preneur
              <span v-if="preneur" class="text-navy/50 dark:text-periwinkle/70">— {{ preneur }}</span>
            </p>
            <div class="flex flex-wrap gap-2 mb-4">
              <button
                v-for="player in players"
                :key="player"
                type="button"
                @click="selectPreneur(player)"
                class="player-chip"
                :class="preneur === player ? 'bg-red-600 !text-white ring-red-600' : ''"
              >
                <PlayerAvatar :name="player" size="xs" />{{ player }}
              </button>
            </div>

            <p class="text-sm font-medium mb-2">
              Appelé
              <span v-if="appele" class="text-navy/50 dark:text-periwinkle/70">— {{ appele }}</span>
              <span v-else class="text-navy/50 dark:text-periwinkle/70 font-normal">
                (le preneur peut s'appeler lui-même)</span
              >
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="player in players"
                :key="player"
                type="button"
                @click="selectAppele(player)"
                class="player-chip"
                :class="appele === player ? 'bg-yellow-500 !text-navy ring-yellow-500' : ''"
              >
                <PlayerAvatar :name="player" size="xs" />{{ player }}
              </button>
            </div>
          </template>
        </section>

        <!-- 3. Défense -->
        <section class="bg-watergreen dark:bg-navy rounded-lg shadow p-4">
          <h2 class="flex items-center gap-2 text-lg font-semibold mb-3">
            <span class="step-badge">3</span>Défense
            <span class="text-sm font-normal text-navy/50 dark:text-periwinkle/70">
              (3 ou 4 joueurs — {{ defense.length }}/4)
            </span>
          </h2>
          <div v-if="loading" class="flex flex-wrap gap-2">
            <div v-for="n in 6" :key="n" class="h-9 w-24 bg-navy/10 dark:bg-white/10 rounded-full animate-pulse"></div>
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <button
              v-for="player in players"
              :key="player"
              type="button"
              @click="toggleDefense(player)"
              class="player-chip"
              :class="defense.includes(player) ? 'bg-blue-600 !text-white ring-blue-600' : ''"
            >
              <PlayerAvatar :name="player" size="xs" />{{ player }}
            </button>
          </div>
        </section>

        <!-- 4. Résultat -->
        <section class="bg-watergreen dark:bg-navy rounded-lg shadow p-4">
          <h2 class="flex items-center gap-2 text-lg font-semibold mb-3">
            <span class="step-badge">4</span>Résultat de la manche
          </h2>

          <p class="text-sm font-medium mb-2">Points et bouts comptés pour…</p>
          <div class="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              @click="pour = pour === 'Attaque' ? null : 'Attaque'"
              class="px-3 py-2.5 rounded-lg font-semibold text-white bg-red-600 transition-all ring-1 ring-navy/10 dark:ring-white/10"
              :class="{
                'opacity-40 grayscale': pour && pour !== 'Attaque',
                'ring-2 !ring-navy dark:!ring-chartreuse': pour === 'Attaque',
              }"
            >
              Attaque
            </button>
            <button
              type="button"
              @click="pour = pour === 'Défense' ? null : 'Défense'"
              class="px-3 py-2.5 rounded-lg font-semibold text-white bg-blue-600 transition-all ring-1 ring-navy/10 dark:ring-white/10"
              :class="{
                'opacity-40 grayscale': pour && pour !== 'Défense',
                'ring-2 !ring-navy dark:!ring-chartreuse': pour === 'Défense',
              }"
            >
              Défense
            </button>
          </div>

          <p class="text-sm font-medium mb-2">
            Bouts<template v-if="pour"> ({{ pour }})</template>
          </p>
          <div class="grid grid-cols-3 gap-2 mb-4">
            <button
              v-for="bout in bouts"
              :key="bout"
              type="button"
              @click="toggleBout(bout)"
              class="px-2 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base ring-1 ring-navy/10 dark:ring-white/10"
              :class="
                selectedBouts.includes(bout)
                  ? 'bg-pine text-white ring-2 !ring-navy dark:!ring-chartreuse'
                  : 'bg-white dark:bg-white/10 opacity-70 hover:opacity-100'
              "
            >
              {{ bout }}
            </button>
          </div>

          <p class="text-sm font-medium mb-1">
            Points<template v-if="pour"> ({{ pour }})</template>
            <span v-if="preview" class="text-navy/50 dark:text-periwinkle/70 font-normal">
              — objectif attaque : {{ preview.pointsAFaire }}
            </span>
          </p>
          <div class="flex items-center gap-3">
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
              <div class="flex text-xs text-navy/50 dark:text-periwinkle/70 -mt-1">
                <span>0</span>
                <span class="ml-[37%]">36</span>
                <span class="ml-[3.4%]">41</span>
                <span class="ml-[9.2%]">51</span>
                <span class="ml-[3.4%]">56</span>
                <span class="ml-auto">91</span>
              </div>
            </div>
            <input
              type="number"
              v-model.number="points"
              min="0"
              max="91"
              step="0.5"
              class="text-navy p-1.5 rounded w-20 text-center font-bold bg-white border-navy/20 shrink-0 -translate-y-2"
            />
          </div>
        </section>

        <!-- 5. Bonus -->
        <section class="bg-watergreen dark:bg-navy rounded-lg shadow p-4">
          <h2 class="flex items-center gap-2 text-lg font-semibold mb-3">
            <span class="step-badge">5</span>Bonus
            <span class="text-sm font-normal text-navy/50 dark:text-periwinkle/70">(optionnel)</span>
          </h2>
          <div class="flex flex-wrap gap-2 mb-2">
            <button
              v-for="bonus in bonusToggles"
              :key="bonus.key"
              type="button"
              @click="toggles[bonus.key] = !toggles[bonus.key]"
              class="bonus-chip"
              :class="toggles[bonus.key] ? 'bg-pine !text-white ring-2 !ring-navy dark:!ring-chartreuse' : ''"
            >
              {{ bonus.label }}
              <span class="opacity-70 text-xs">+{{ bonus.points }}</span>
            </button>
          </div>
          <p class="text-xs text-navy/50 dark:text-periwinkle/70 mb-2">Poignée (une seule) :</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="poignee in poigneeToggles"
              :key="poignee.key"
              type="button"
              @click="togglePoignee(poignee.key)"
              class="bonus-chip"
              :class="toggles[poignee.key] ? 'bg-pine !text-white ring-2 !ring-navy dark:!ring-chartreuse' : ''"
            >
              {{ poignee.label }}
              <span class="opacity-70 text-xs">+{{ poignee.points }}</span>
            </button>
          </div>
        </section>

        <!-- Prévisualisation des points -->
        <section v-if="preview" class="bg-watergreen dark:bg-navy rounded-lg shadow p-4">
          <h2 class="text-lg font-semibold mb-1">Prévisualisation</h2>
          <p
            class="text-sm mb-3 font-semibold"
            :class="preview.fait ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
          >
            {{ preview.fait ? "Contrat fait" : "Contrat chuté" }} de
            {{ Math.abs(preview.pointsAttaque - preview.pointsAFaire).toFixed(1) }}
            ({{ preview.pointsAttaque.toFixed(1) }} / {{ preview.pointsAFaire }})
          </p>
          <ul class="space-y-2">
            <li
              v-for="entry in preview.entries"
              :key="entry.name"
              class="flex items-center gap-3"
            >
              <PlayerAvatar :name="entry.name" size="sm" :class="`outline outline-2 ${entry.outline}`" />
              <span class="flex-1">{{ entry.name }}</span>
              <span
                class="font-bold"
                :class="entry.points >= 0 ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
              >
                {{ (entry.points >= 0 ? "+" : "") + entry.points.toFixed(1) }} pts
              </span>
            </li>
          </ul>
        </section>

        <p v-if="submitError" class="text-red-600 dark:text-red-400 font-semibold text-center">
          {{ submitError }}
        </p>
        <p v-if="submitSuccess" class="text-pine dark:text-chartreuse font-semibold text-center">
          Partie n°{{ submitSuccess }} enregistrée dans le Google Sheet !
        </p>
      </form>
    </div>

    <!-- Barre d'action collée en bas -->
    <div
      class="fixed bottom-0 inset-x-0 md:left-64 z-40 bg-white/95 dark:bg-navy-deep/95 backdrop-blur border-t border-navy/10 dark:border-white/10 px-4 py-3"
    >
      <div class="max-w-2xl mx-auto flex items-center gap-3">
        <p class="flex-1 text-sm min-w-0 truncate">
          <template v-if="missing.length">
            <span class="text-navy/60 dark:text-periwinkle/80">
              Reste à choisir : {{ missing.join(", ") }}
            </span>
          </template>
          <template v-else-if="preview">
            <span
              class="font-semibold"
              :class="preview.fait ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
            >
              {{ preview.fait ? "Fait" : "Chuté" }} de
              {{ Math.abs(preview.pointsAttaque - preview.pointsAFaire).toFixed(1) }}
            </span>
            <span class="text-navy/60 dark:text-periwinkle/80">
              · {{ preneur }} {{ preview.entries[0].points >= 0 ? "+" : ""
              }}{{ preview.entries[0].points.toFixed(1) }} pts
            </span>
          </template>
        </p>
        <button
          @click="submitGame"
          class="bg-chartreuse text-navy px-6 py-2.5 rounded-lg font-bold shrink-0 hover:brightness-95 transition"
          :class="{
            '!bg-navy/20 !text-navy/40 dark:!bg-white/10 dark:!text-white/40 cursor-not-allowed':
              isDisabled || submitting,
          }"
          :disabled="isDisabled || submitting"
        >
          {{ submitting ? "Enregistrement…" : "Ajouter" }}
        </button>
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
import { annonceStyle } from "@/services/avatars";
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
  const labels = ["Simple", "Double", "Triple"];
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

const missing = computed(() => {
  const list = [];
  if (!selectedAnnonce.value) list.push("l'annonce");
  if (!preneur.value) list.push("le preneur");
  if (!appele.value) list.push("l'appelé");
  if (defense.value.length < 3) list.push("la défense (3-4)");
  if (!pour.value) list.push("le camp");
  return list;
});

const isDisabled = computed(() => missing.value.length > 0);

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
  if (isDisabled.value || submitting.value) return;
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
.step-badge {
  @apply w-7 h-7 rounded-full bg-chartreuse text-navy text-sm font-bold flex items-center justify-center shrink-0;
}

.player-chip {
  @apply flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full text-sm font-medium ring-1 ring-navy/20 dark:ring-white/20 bg-white dark:bg-white/5 text-navy dark:text-white transition-all;
}
.player-chip:hover {
  @apply ring-navy/50 dark:ring-white/50;
}

.bonus-chip {
  @apply flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ring-navy/20 dark:ring-white/20 bg-white dark:bg-white/5 text-navy dark:text-white transition-all;
}
.bonus-chip:hover {
  @apply ring-navy/50 dark:ring-white/50;
}

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
    #9ca3af calc(var(--fill-percent) * 1%),
    #9ca3af 100%
  );
}

.custom-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 4px;
  height: 24px;
  background: #113b54;
  border-radius: 2px;
  margin-top: -4px;
  position: relative;
  z-index: 2;
}

.custom-range::-moz-range-track {
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(
    to right,
    var(--slider-color) 0%,
    var(--slider-color) calc(var(--fill-percent) * 1%),
    #9ca3af calc(var(--fill-percent) * 1%),
    #9ca3af 100%
  );
}

.custom-range::-moz-range-thumb {
  width: 4px;
  height: 24px;
  background: #113b54;
  border: none;
  border-radius: 2px;
}
</style>
