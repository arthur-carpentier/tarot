<template>
  <div class="min-h-screen bg-white text-navy dark:bg-navy-deep dark:text-white font-sans">
    <SideBar />
    <main class="md:ml-64 px-4 md:px-6 py-10 pt-28 md:pt-10 relative min-w-0">
      <div class="mx-auto w-full max-w-screen-xl">
        <slot />
      </div>
    </main>

    <!-- Écran de démarrage : premier chargement des données du Google Sheet -->
    <div
      v-if="!initialLoadDone"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-navy-deep/90 backdrop-blur-sm"
    >
      <div
        class="bg-watergreen dark:bg-navy rounded-lg shadow-xl p-8 max-w-md w-full mx-4 border border-navy/10 dark:border-white/10"
      >
        <h2 class="text-2xl font-bold text-center mb-2">Tarot</h2>
        <p class="text-center text-navy/60 dark:text-periwinkle/80 mb-6">
          Chargement des données depuis le
          <a :href="sheetUrl" target="_blank" rel="noopener" class="underline">
            Google Sheet</a
          >…
        </p>
        <ul class="space-y-3">
          <li
            v-for="step in loadingSteps"
            :key="step.label"
            class="flex items-center space-x-3"
          >
            <span
              v-if="step.done"
              class="w-6 h-6 rounded-full bg-chartreuse text-navy flex items-center justify-center shrink-0"
            >
              <i class="fa-solid fa-check text-xs"></i>
            </span>
            <span
              v-else
              class="w-6 h-6 rounded-full border-2 border-navy/30 dark:border-white/30 border-t-pine dark:border-t-chartreuse animate-spin shrink-0"
            ></span>
            <span
              :class="
                step.done
                  ? 'text-navy dark:text-white'
                  : 'text-navy/60 dark:text-periwinkle/80'
              "
            >
              {{ step.label }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import SideBar from "@/Components/SideBar.vue";
import { useTarotData } from "@/composables/useTarotData";
import { SHEET_URL } from "@/config";

const { initialLoadDone, loadingSteps } = useTarotData();
const sheetUrl = SHEET_URL;
</script>
