<template>
  <AppShell>
    <div class="max-w-2xl lg:max-w-5xl mx-auto pb-36 lg:pb-10">
      <h1 class="text-3xl md:text-4xl font-bold mb-6 text-center lg:text-left">
        Nouvelle partie
      </h1>

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

      <!-- Scores réels après enregistrement -->
      <div
        v-if="lastResult"
        class="bg-watergreen dark:bg-navy rounded-lg shadow p-4 mb-6 border-2 border-chartreuse"
      >
        <h2 class="text-lg font-semibold">
          ✅ Partie n°{{ lastResult.numero }} enregistrée
        </h2>
        <p
          v-if="lastResult.prisChuteDe !== undefined"
          class="text-sm font-semibold mb-2"
          :class="lastResult.fait ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
        >
          {{ lastResult.fait ? "Contrat fait" : "Contrat chuté" }}
          ({{ (lastResult.prisChuteDe >= 0 ? "+" : "") + Number(lastResult.prisChuteDe).toFixed(1) }})
        </p>
        <ul v-if="lastResult.scoreEntries.length" class="space-y-1.5 mt-2">
          <li
            v-for="entry in lastResult.scoreEntries"
            :key="entry.name"
            class="flex items-center gap-2 text-sm"
          >
            <PlayerAvatar :name="entry.name" size="xs" />
            <span class="flex-1">{{ entry.name }}</span>
            <span
              class="font-bold"
              :class="entry.points >= 0 ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
            >
              {{ (entry.points >= 0 ? "+" : "") + entry.points.toFixed(1) }} pts
            </span>
          </li>
        </ul>
        <p v-else class="text-sm text-navy/60 dark:text-periwinkle/80">
          Scores calculés par la feuille (mettez à jour le script Apps Script pour les
          voir ici directement).
        </p>
        <button
          @click="lastResult = null"
          class="mt-3 text-sm underline text-navy/60 dark:text-periwinkle/80"
        >
          Fermer
        </button>
      </div>

      <!-- Marqueur de début de session : écrit le n° de la dernière partie
           d'avant (base de comparaison) dans Graphiques!R3, avant l'insertion,
           pour suivre l'évolution du jour sans gérer de date -->
      <label
        class="flex items-center gap-3 bg-watergreen dark:bg-navy rounded-lg shadow p-4 mb-4 cursor-pointer select-none"
        :class="{ 'ring-2 ring-chartreuse': premierePartieDuJour }"
      >
        <input
          type="checkbox"
          v-model="premierePartieDuJour"
          class="w-5 h-5 rounded border-navy/30 text-pine focus:ring-pine shrink-0"
        />
        <span class="text-xl">🌅</span>
        <span class="flex-1">
          <span class="font-semibold">Première partie de la journée</span>
          <span class="block text-xs text-navy/60 dark:text-periwinkle/80">
            Marque le début de la session : le graphique et le classement pourront
            afficher l'évolution du jour.
          </span>
        </span>
      </label>

      <!-- Enculette : le preneur s'appelle lui-même et chute automatiquement
           une Garde de 10 points (26 pts, 3 bouts) -->
      <label
        class="flex items-center gap-3 bg-watergreen dark:bg-navy rounded-lg shadow p-4 mb-4 cursor-pointer select-none"
        :class="{ 'ring-2 ring-chartreuse': enculette }"
      >
        <input
          type="checkbox"
          v-model="enculette"
          class="w-5 h-5 rounded border-navy/30 text-pine focus:ring-pine shrink-0"
        />
        <span class="text-xl">😈</span>
        <span class="flex-1">
          <span class="font-semibold">Enculette</span>
          <span class="block text-xs text-navy/60 dark:text-periwinkle/80">
            Le preneur s'appelle lui-même et chute automatiquement une Garde de 10
            points (26 pts, 3 bouts pour l'attaque) : annonce, camp, bouts et points
            sont verrouillés tant que la case est cochée.
          </span>
        </span>
      </label>

      <div class="lg:grid lg:grid-cols-[1fr,21rem] lg:gap-6 lg:items-start">
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
              :disabled="enculette"
              @click="!enculette && (selectedAnnonce = selectedAnnonce === annonce.name ? null : annonce.name)"
              class="px-3 py-2.5 text-center font-semibold rounded-lg transition-all duration-150 ring-1 ring-navy/10 dark:ring-white/10"
              :class="{
                'opacity-40 grayscale': selectedAnnonce && selectedAnnonce !== annonce.name,
                'ring-2 !ring-navy dark:!ring-chartreuse scale-[1.02]': selectedAnnonce === annonce.name,
                'cursor-not-allowed': enculette,
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
                v-for="player in sortedPlayers"
                :key="player"
                type="button"
                @click="selectPreneur(player)"
                class="player-chip"
                :class="preneur === player ? 'player-chip-on bg-red-600 !text-white !ring-red-700 dark:!ring-red-300' : ''"
              >
                <PlayerAvatar :name="player" size="xs" />{{ player }}
                <i v-if="preneur === player" class="fa-solid fa-check ml-0.5"></i>
              </button>
            </div>

            <p class="text-sm font-medium mb-2">
              Appelé
              <span v-if="appele" class="text-navy/50 dark:text-periwinkle/70">— {{ appele }}</span>
              <span v-else class="text-navy/50 dark:text-periwinkle/70 font-normal">
                (le preneur peut s'appeler lui-même)</span
              >
              <span v-if="enculette" class="text-navy/50 dark:text-periwinkle/70 font-normal">
                (enculette : le preneur s'appelle lui-même)</span
              >
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="player in sortedPlayers"
                :key="player"
                type="button"
                :disabled="enculette"
                @click="!enculette && selectAppele(player)"
                class="player-chip"
                :class="[
                  appele === player ? 'player-chip-on bg-yellow-500 !text-navy !ring-yellow-600' : '',
                  enculette ? 'cursor-not-allowed' : '',
                ]"
              >
                <PlayerAvatar :name="player" size="xs" />{{ player }}
                <i v-if="appele === player" class="fa-solid fa-check ml-0.5"></i>
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
              v-for="player in sortedPlayers"
              :key="player"
              type="button"
              @click="toggleDefense(player)"
              class="player-chip"
              :class="defense.includes(player) ? 'player-chip-on bg-blue-600 !text-white !ring-blue-700 dark:!ring-blue-300' : ''"
            >
              <PlayerAvatar :name="player" size="xs" />{{ player }}
              <i v-if="defense.includes(player)" class="fa-solid fa-check ml-0.5"></i>
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
              :disabled="enculette"
              @click="!enculette && (pour = pour === 'Attaque' ? null : 'Attaque')"
              class="px-3 py-2.5 rounded-lg font-semibold text-white bg-red-600 transition-all ring-1 ring-navy/10 dark:ring-white/10"
              :class="{
                'opacity-40 grayscale': pour && pour !== 'Attaque',
                'ring-2 !ring-navy dark:!ring-chartreuse': pour === 'Attaque',
                'cursor-not-allowed': enculette,
              }"
            >
              Attaque
            </button>
            <button
              type="button"
              :disabled="enculette"
              @click="!enculette && (pour = pour === 'Défense' ? null : 'Défense')"
              class="px-3 py-2.5 rounded-lg font-semibold text-white bg-blue-600 transition-all ring-1 ring-navy/10 dark:ring-white/10"
              :class="{
                'opacity-40 grayscale': pour && pour !== 'Défense',
                'ring-2 !ring-navy dark:!ring-chartreuse': pour === 'Défense',
                'cursor-not-allowed': enculette,
              }"
            >
              Défense
            </button>
          </div>

          <p class="text-sm font-medium mb-2">
            Bouts<template v-if="pour"> ({{ pour }})</template>
          </p>
          <div class="grid grid-cols-3 gap-2 mb-1">
            <button
              v-for="bout in bouts"
              :key="bout"
              type="button"
              :disabled="enculette"
              @click="!enculette && toggleBout(bout)"
              class="px-2 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base ring-1 ring-navy/10 dark:ring-white/10"
              :class="[
                selectedBouts.includes(bout)
                  ? 'bg-pine text-white ring-2 !ring-navy dark:!ring-chartreuse'
                  : 'bg-white dark:bg-white/10 opacity-70 hover:opacity-100',
                enculette ? 'cursor-not-allowed' : '',
              ]"
            >
              {{ bout }}
            </button>
          </div>
          <!-- Seuil mis à jour en direct selon les bouts et le camp -->
          <p class="text-xs text-navy/60 dark:text-periwinkle/80 mb-4 min-h-[1rem]">
            <template v-if="seuilInfo">
              {{ seuilInfo.boutsAttaque }} bout{{ seuilInfo.boutsAttaque > 1 ? "s" : "" }}
              pour l'attaque → elle doit faire
              <b>{{ seuilInfo.objectifAttaque }} points</b
              ><template v-if="pour === 'Défense'">
                (la défense fait chuter à partir de
                <b>{{ seuilInfo.seuilDefense }}</b
                >)</template
              >.
            </template>
            <template v-else>Choisis le camp pour voir le seuil de points.</template>
          </p>

          <p class="text-sm font-medium mb-2">
            Points<template v-if="pour"> ({{ pour }})</template>
          </p>
          <div class="flex items-stretch gap-4">
            <WheelPicker
              v-model="points"
              :disabled="enculette"
              class="w-24 shrink-0 bg-white dark:bg-white/10 rounded-lg ring-1 ring-navy/10 dark:ring-white/10"
            />
            <div class="flex-1 flex flex-col justify-center min-w-0">
              <template v-if="seuilInfo">
                <p
                  class="text-xl font-bold"
                  :class="seuilInfo.fait ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
                >
                  {{ seuilInfo.fait ? "Contrat fait" : "Contrat chuté" }}
                </p>
                <p
                  class="text-sm font-semibold"
                  :class="seuilInfo.fait ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
                >
                  de {{ seuilInfo.ecart.toFixed(1) }} point{{ seuilInfo.ecart > 1 ? "s" : "" }}
                </p>
                <p class="text-xs text-navy/50 dark:text-periwinkle/70 mt-1.5">
                  {{ pour }} : {{ format1(points) }} / seuil
                  {{ pour === "Attaque" ? seuilInfo.objectifAttaque : seuilInfo.seuilDefense }}
                </p>
              </template>
              <p v-else class="text-sm text-navy/50 dark:text-periwinkle/70">
                Fais tourner la roue pour régler les points, puis choisis le camp
                pour voir si le contrat passe.
              </p>
            </div>
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
          <div class="flex flex-wrap gap-2 mb-2">
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
          <p class="text-xs text-navy/50 dark:text-periwinkle/70 mb-2">Chelem (un seul) :</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="chelem in chelemToggles"
              :key="chelem.key"
              type="button"
              @click="toggleChelem(chelem.key)"
              class="bonus-chip"
              :class="toggles[chelem.key] ? 'bg-pine !text-white ring-2 !ring-navy dark:!ring-chartreuse' : ''"
            >
              {{ chelem.label }}
              <span class="opacity-70 text-xs">+{{ chelem.points }}</span>
            </button>
          </div>
        </section>

        <!-- Récapitulatif (mobile : dans le flux du formulaire, toujours visible) -->
        <section class="lg:hidden bg-watergreen dark:bg-navy rounded-lg shadow p-4">
          <GameRecap
            :annonce="selectedAnnonceObj"
            :preneur="preneur"
            :appele="appele"
            :defense="defense"
            :pour="pour"
            :bouts="selectedBouts"
            :points="points"
            :bonus-labels="activeBonusLabels"
            :preview="preview"
            :missing="missing"
          />
        </section>

        <p
          v-if="submitError"
          class="text-red-600 dark:text-red-400 font-semibold text-center"
        >
          {{ submitError }}
        </p>
      </form>

      <!-- Desktop : récapitulatif collant à droite -->
      <aside class="hidden lg:block sticky top-6 space-y-4">
        <div class="bg-watergreen dark:bg-navy rounded-lg shadow p-4">
          <GameRecap
            :annonce="selectedAnnonceObj"
            :preneur="preneur"
            :appele="appele"
            :defense="defense"
            :pour="pour"
            :bouts="selectedBouts"
            :points="points"
            :bonus-labels="activeBonusLabels"
            :preview="preview"
            :missing="missing"
          />
          <button
            @click="submitGame"
            class="mt-4 w-full bg-chartreuse text-navy px-6 py-2.5 rounded-lg font-bold hover:brightness-95 transition"
            :class="{
              '!bg-navy/20 !text-navy/40 dark:!bg-white/10 dark:!text-white/40 cursor-not-allowed':
                isDisabled || submitting,
            }"
            :disabled="isDisabled || submitting"
          >
            {{ submitting ? "Enregistrement…" : "Ajouter la partie" }}
          </button>
          <p
            v-if="submitError"
            class="text-red-600 dark:text-red-400 font-semibold text-sm mt-2"
          >
            {{ submitError }}
          </p>
        </div>
      </aside>
      </div>
    </div>

    <!-- Mobile : barre d'action collée en bas -->
    <div
      class="lg:hidden fixed bottom-0 inset-x-0 md:left-64 z-40 bg-white/95 dark:bg-navy-deep/95 backdrop-blur border-t border-navy/10 dark:border-white/10 px-4 py-3"
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
import { ref, reactive, computed, watch } from "vue";
import AppShell from "@/Components/AppShell.vue";
import PlayerAvatar from "@/Components/PlayerAvatar.vue";
import WheelPicker from "@/Components/WheelPicker.vue";
import GameRecap from "@/Components/GameRecap.vue";
import { useTarotData } from "@/composables/useTarotData";
import { appendGame } from "@/services/sheets";
import { computeRound, distributePoints, POINTS_A_FAIRE } from "@/services/scoring";
import { annonceStyle } from "@/services/avatars";
import { getAppsScriptUrl, setAppsScriptUrl } from "@/config";

const { players, annonces, bonuses, poignees, loading, refresh } = useTarotData();

// Liste des joueurs triée par ordre alphabétique pour la sélection
// (l'ordre d'origine, lui, reste utilisé ailleurs pour l'attribution des couleurs).
const sortedPlayers = computed(() => [...players.value].sort((a, b) => a.localeCompare(b, "fr")));

const selectedAnnonce = ref(null);
const preneur = ref(null);
const appele = ref(null);
const defense = ref([]);
const selectedBouts = ref([]);
const points = ref(41);
const pour = ref(null);
const premierePartieDuJour = ref(false);
const enculette = ref(false);
const submitting = ref(false);
const submitError = ref(null);
// Résultat du dernier ajout, avec les scores réellement calculés par la feuille
const lastResult = ref(null);

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
  // AA..AB de la feuille "Parties"
  petitChelem: false,
  grandChelem: false,
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

const chelemToggles = computed(() => [
  { key: "petitChelem", label: "Petit chelem", points: findBonusPoints("petit chelem", 200) },
  { key: "grandChelem", label: "Grand chelem", points: findBonusPoints("grand chelem", 400) },
]);

// Un seul chelem à la fois
const toggleChelem = (key) => {
  const wasActive = toggles[key];
  toggles.petitChelem = false;
  toggles.grandChelem = false;
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

const format1 = (value) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

// Seuil et verdict en direct dès que le camp est choisi : l'objectif de
// l'attaque dépend de ses bouts, le seuil de la défense en découle.
const seuilInfo = computed(() => {
  if (!pour.value) return null;
  const bouts = selectedBouts.value.length;
  const boutsAttaque = pour.value === "Attaque" ? bouts : 3 - bouts;
  const objectifAttaque = POINTS_A_FAIRE[boutsAttaque] ?? 56;
  const pointsAttaque = pour.value === "Attaque" ? points.value : 91 - points.value;
  return {
    boutsAttaque,
    objectifAttaque,
    seuilDefense: format1(91 - objectifAttaque + 0.5),
    fait: pointsAttaque >= objectifAttaque,
    ecart: Math.abs(pointsAttaque - objectifAttaque),
  };
});

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

// Annonce sélectionnée (objet complet) et libellés des bonus actifs : alimentent
// le récapitulatif en direct, indépendamment du calcul des points.
const selectedAnnonceObj = computed(
  () => annonces.value.find((a) => a.name === selectedAnnonce.value) || null
);

const activeBonusLabels = computed(() => {
  const labels = [];
  bonusToggles.value.forEach((b) => {
    if (toggles[b.key]) labels.push(b.label);
  });
  poigneeToggles.value.forEach((p) => {
    if (toggles[p.key]) labels.push(p.label);
  });
  chelemToggles.value.forEach((c) => {
    if (toggles[c.key]) labels.push(c.label);
  });
  return labels;
});

const bonusPoints = computed(() => {
  let total = 0;
  if (toggles.petitAuBout) total += bonusToggles.value[0].points;
  if (toggles.misereTetes) total += bonusToggles.value[1].points;
  if (toggles.misereAtouts) total += bonusToggles.value[2].points;
  poigneeToggles.value.forEach((p) => {
    if (toggles[p.key]) total += p.points;
  });
  chelemToggles.value.forEach((c) => {
    if (toggles[c.key]) total += c.points;
  });
  return total;
});

// Enculette : le preneur s'appelle lui-même et chute automatiquement une
// Garde de 10 points (26 pts, 3 bouts pour l'attaque) — pts et bouts
// deviennent alors fixes (voir verrouillage des contrôles dans le template).
watch(enculette, (active) => {
  if (!active) return;
  const garde = annonces.value.find((a) => a.name === "Garde");
  selectedAnnonce.value = garde ? garde.name : "Garde";
  pour.value = "Attaque";
  selectedBouts.value = [...bouts];
  points.value = 26;
  appele.value = preneur.value;
});

watch(preneur, (player) => {
  if (enculette.value) appele.value = player;
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
  lastResult.value = null;
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
      petitChelem: toggles.petitChelem,
      grandChelem: toggles.grandChelem,
      premierePartieDuJour: premierePartieDuJour.value,
    });
    lastResult.value = {
      numero: result.numero || "?",
      fait: result.fait,
      prisChuteDe: result.prisChuteDe,
      scoreEntries: Object.entries(result.scores || {})
        .map(([name, points]) => ({ name, points }))
        .sort((a, b) => b.points - a.points),
    };
    // Réinitialise le formulaire et recharge les données de la feuille
    preneur.value = null;
    appele.value = null;
    defense.value = [];
    selectedAnnonce.value = null;
    selectedBouts.value = [];
    points.value = 41;
    pour.value = null;
    premierePartieDuJour.value = false;
    enculette.value = false;
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
/* État sélectionné : anneau épais détaché du fond + ombre + léger zoom,
   pour que le joueur retenu (preneur / appelé / défense) saute aux yeux. */
.player-chip-on {
  @apply ring-2 ring-offset-2 ring-offset-watergreen dark:ring-offset-navy shadow-md font-bold scale-[1.04];
}

.bonus-chip {
  @apply flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ring-navy/20 dark:ring-white/20 bg-white dark:bg-white/5 text-navy dark:text-white transition-all;
}
.bonus-chip:hover {
  @apply ring-navy/50 dark:ring-white/50;
}





</style>
