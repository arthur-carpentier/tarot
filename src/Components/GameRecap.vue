<template>
  <div class="space-y-3 text-sm">
    <h2 class="text-lg font-semibold">Récapitulatif</h2>

    <!-- Annonce -->
    <div class="flex items-center justify-between gap-2">
      <span class="recap-label">Annonce</span>
      <span
        v-if="annonce"
        class="px-2.5 py-1 rounded-lg text-sm font-semibold ring-1 ring-navy/20 dark:ring-white/30 whitespace-nowrap"
        :style="annonceStyle(annonce.name)"
      >
        {{ annonce.name }}
        <span class="opacity-75 text-xs">×{{ annonce.multiplicateur }}</span>
      </span>
      <span v-else class="recap-empty">à choisir</span>
    </div>

    <hr class="border-navy/10 dark:border-white/10" />

    <!-- Attaque -->
    <div>
      <div class="recap-label mb-2">Attaque</div>
      <div class="space-y-2">
        <!-- Preneur -->
        <div class="flex items-center gap-2.5">
          <PlayerAvatar
            v-if="preneur"
            :name="preneur"
            size="sm"
            class="outline outline-2 outline-red-500"
          />
          <span v-else class="recap-ph-avatar">?</span>
          <span class="text-xs font-semibold text-red-600 dark:text-red-400 w-16 shrink-0">Preneur</span>
          <span v-if="preneur" class="font-semibold truncate">{{ preneur }}</span>
          <span v-else class="recap-empty">non choisi</span>
        </div>
        <!-- Appelé / roi -->
        <div class="flex items-center gap-2.5">
          <PlayerAvatar
            v-if="appele"
            :name="appele"
            size="sm"
            class="outline outline-2 outline-yellow-500"
          />
          <span v-else class="recap-ph-avatar">?</span>
          <span class="text-xs font-semibold text-yellow-600 dark:text-yellow-500 w-16 shrink-0">Appelé</span>
          <span v-if="appele" class="font-semibold truncate">{{ appele }}</span>
          <span v-else class="recap-empty">non choisi</span>
          <span
            v-if="appele && appele === preneur"
            class="text-xs text-navy/50 dark:text-periwinkle/70 italic"
          >(lui-même)</span>
        </div>
      </div>
    </div>

    <!-- Défense -->
    <div>
      <div class="recap-label mb-2 flex items-center justify-between">
        <span>Défense</span>
        <span class="text-navy/40 dark:text-periwinkle/60 font-normal normal-case">
          {{ defense.length }} / 3–4
        </span>
      </div>
      <div class="flex flex-wrap items-center gap-1.5">
        <div
          v-for="name in defense"
          :key="name"
          class="flex items-center gap-1.5 pr-2.5 rounded-full bg-blue-600/10 dark:bg-blue-400/10 ring-1 ring-blue-600/30 dark:ring-blue-400/30"
        >
          <PlayerAvatar :name="name" size="xs" class="outline outline-2 outline-blue-500" />
          <span class="font-medium text-xs">{{ name }}</span>
        </div>
        <span
          v-for="n in defensePlaceholders"
          :key="'ph' + n"
          class="recap-ph-avatar"
          title="Défenseur à choisir"
        >?</span>
        <span v-if="!defense.length && !defensePlaceholders" class="recap-empty">à choisir</span>
      </div>
    </div>

    <hr class="border-navy/10 dark:border-white/10" />

    <!-- Manche : camp, bouts, points -->
    <div class="grid grid-cols-3 gap-2 text-center">
      <div>
        <div class="recap-label">Camp</div>
        <div
          v-if="pour"
          class="font-bold mt-0.5"
          :class="pour === 'Attaque' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-periwinkle'"
        >
          {{ pour }}
        </div>
        <div v-else class="recap-empty mt-0.5">—</div>
      </div>
      <div>
        <div class="recap-label">Bouts</div>
        <div class="font-bold mt-0.5">{{ bouts.length }}</div>
        <div class="text-[11px] text-navy/50 dark:text-periwinkle/70 leading-tight truncate">
          {{ bouts.length ? bouts.join(" · ") : "aucun" }}
        </div>
      </div>
      <div>
        <div class="recap-label">Points</div>
        <div class="font-bold mt-0.5">{{ format1(points) }}</div>
        <div v-if="pour" class="text-[11px] text-navy/50 dark:text-periwinkle/70 leading-tight">
          pour {{ pour.toLowerCase() }}
        </div>
      </div>
    </div>

    <!-- Bonus -->
    <div>
      <div class="recap-label mb-1.5">Bonus</div>
      <div v-if="bonusLabels.length" class="flex flex-wrap gap-1.5">
        <span
          v-for="label in bonusLabels"
          :key="label"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pine/10 dark:bg-chartreuse/10 ring-1 ring-pine/30 dark:ring-chartreuse/40 text-xs font-medium"
        >
          <i class="fa-solid fa-star text-[10px] text-pine dark:text-chartreuse"></i>{{ label }}
        </span>
      </div>
      <span v-else class="recap-empty">aucun</span>
    </div>

    <!-- Résultat : calcul des points (seulement quand tout est prêt) -->
    <div
      v-if="preview"
      class="pt-3 border-t-2 border-navy/10 dark:border-white/10 space-y-2"
    >
      <p
        class="font-semibold"
        :class="preview.fait ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
      >
        <i :class="preview.fait ? 'fa-solid fa-check' : 'fa-solid fa-xmark'" class="mr-1"></i>
        {{ preview.fait ? "Contrat fait" : "Contrat chuté" }} de
        {{ Math.abs(preview.pointsAttaque - preview.pointsAFaire).toFixed(1) }}
        <span class="font-normal text-navy/60 dark:text-periwinkle/80">
          ({{ preview.pointsAttaque.toFixed(1) }} / {{ preview.pointsAFaire }})
        </span>
      </p>
      <ul class="space-y-1.5">
        <li
          v-for="entry in preview.entries"
          :key="entry.name"
          class="flex items-center gap-2"
        >
          <PlayerAvatar :name="entry.name" size="xs" :class="`outline outline-2 ${entry.outline}`" />
          <span class="flex-1 truncate">{{ entry.name }}</span>
          <span
            class="font-bold"
            :class="entry.points >= 0 ? 'text-pine dark:text-chartreuse' : 'text-red-600 dark:text-red-400'"
          >
            {{ (entry.points >= 0 ? "+" : "") + entry.points.toFixed(1) }} pts
          </span>
        </li>
      </ul>
    </div>
    <div v-else class="pt-3 border-t border-navy/10 dark:border-white/10">
      <p class="text-xs text-navy/50 dark:text-periwinkle/70">
        <i class="fa-regular fa-circle-question mr-1"></i>
        <template v-if="missing.length">
          Reste à choisir : {{ missing.join(", ") }}.
        </template>
        <template v-else>
          Calcul des points indisponible.
        </template>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import PlayerAvatar from "@/Components/PlayerAvatar.vue";
import { annonceStyle } from "@/services/avatars";

const props = defineProps({
  annonce: { type: Object, default: null }, // { name, multiplicateur } | null
  preneur: { type: String, default: null },
  appele: { type: String, default: null },
  defense: { type: Array, default: () => [] },
  pour: { type: String, default: null },
  bouts: { type: Array, default: () => [] }, // libellés des bouts cochés
  points: { type: Number, default: 0 },
  bonusLabels: { type: Array, default: () => [] },
  preview: { type: Object, default: null },
  missing: { type: Array, default: () => [] },
});

// Cases de défense encore vides (on vise au moins 3 défenseurs).
const defensePlaceholders = computed(() => Math.max(0, 3 - props.defense.length));

const format1 = (value) =>
  Number.isInteger(value) ? String(value) : Number(value).toFixed(1);
</script>

<style scoped>
.recap-label {
  @apply text-xs uppercase tracking-wide font-semibold text-navy/50 dark:text-periwinkle/70;
}
.recap-empty {
  @apply text-navy/40 dark:text-periwinkle/50 italic;
}
.recap-ph-avatar {
  @apply w-8 h-8 rounded-full border-2 border-dashed border-navy/25 dark:border-white/25 flex items-center justify-center text-navy/40 dark:text-periwinkle/50 text-xs font-bold shrink-0;
}
</style>
