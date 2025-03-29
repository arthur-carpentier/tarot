<template>
  <div>
    <!-- Section Header -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold">{{ title }}</h2>
      <button
        @click="
          $emit('open-modal', { type: 'create', item: null, itemType: addButtonText })
        "
        class="bg-green-dark px-4 py-2 rounded text-light font-semibold shadow-md hover:bg-green-bright hover:text-dark transition"
      >
        + Ajouter {{ addButtonText }}
      </button>
    </div>

    <!-- Skeleton Loader -->
    <div
      v-if="loading"
      class="bg-dark-lighter rounded-lg shadow-lg p-6 border border-dark-lightest"
    >
      <div v-for="n in 5" :key="n" class="animate-pulse flex items-center space-x-4 py-2">
        <div
          v-if="title === 'Gestion des joueurs'"
          class="bg-dark-lightest h-12 w-12 rounded-full"
        ></div>
        <div class="flex-1">
          <div class="bg-dark-lightest h-4 w-1/3 mb-2"></div>
          <div class="bg-dark-lightest h-4 w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- No Items -->
    <p v-else-if="items.length === 0" class="text-center text-gray-300 text-lg">
      Aucun {{ title.toLowerCase() }} enregistré pour le moment.
    </p>

    <!-- Table Content -->
    <div
      v-else
      class="bg-dark-lighter rounded-lg shadow-lg overflow-x-auto p-6 border border-dark-lightest"
    >
      <table class="w-full border-collapse table-auto">
        <thead>
          <tr class="text-left">
            <td v-if="title === 'Gestion des joueurs'" class="p-3 whitespace-nowrap"></td>
            <td class="p-3">Nom</td>
            <td v-if="title === 'Gestion des joueurs'" class="p-3 text-center">
              Evolution
            </td>
            <td v-if="title === 'Gestion des joueurs'" class="p-3 text-center">Score</td>
            <td
              v-if="title === 'Gestion des joueurs' || title === 'Annonces'"
              class="p-3 text-center"
            >
              Couleur
            </td>
            <td v-if="title === 'Annonces'" class="p-3 text-center">Multiplicateur</td>
            <td v-if="title === 'Bonus'" class="p-3 text-center">Points</td>
            <td class="p-3 text-center"></td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="transition">
            <!-- Player Photo -->
            <td
              v-if="title === 'Gestion des joueurs'"
              class="border-t border-t-dark-lightest w-14 whitespace-nowrap pl-3 py-3"
            >
              <img
                :src="
                  item.photo ? `/storage/${item.photo}` : '/images/default-avatar.png'
                "
                class="w-11 h-11 rounded-full shadow-md"
              />
            </td>

            <!-- Name -->
            <td class="p-3 border-t border-t-dark-lightest font-semibold">
              {{ item.name }}
            </td>

            <!-- Evolution Score -->
            <td
              v-if="title === 'Gestion des joueurs'"
              class="p-3 border-t border-t-dark-lightest font-semibold justify-center flex items-center"
              :class="{
                'text-transparent': item.latestEvolution == 0,
                'text-green-bright': item.latestEvolution > 0,
                'text-red-500': item.latestEvolution < 0,
              }"
            >
              {{
                item.latestEvolution > 0
                  ? "+" + item.latestEvolution
                  : item.latestEvolution
              }}
              pts
              <component
                v-if="item.latestEvolution > 0"
                :is="TrendingUpIcon"
                class="text-green-bright w-10"
              ></component>
              <component
                v-if="item.latestEvolution < 0"
                :is="TrendingDownIcon"
                class="text-red-500 w-10"
              ></component>
            </td>

            <!-- Score -->
            <td
              v-if="title === 'Gestion des joueurs'"
              class="p-3 border-t border-t-dark-lightest font-semibold text-center"
            >
              {{ item.score }} pts
            </td>

            <!-- Color Indicator -->
            <td
              v-if="title === 'Gestion des joueurs' || title === 'Annonces'"
              class="p-3 border-t border-t-dark-lightest justify-items-center w-36"
              :style="{ backgroundColor: item.color + '30' }"
            >
              <div
                :style="{ backgroundColor: item.color }"
                class="w-6 h-6 rounded-full border shadow"
              ></div>
            </td>

            <!-- Multiplicateur (for Annonces) -->
            <td
              v-if="title === 'Annonces'"
              class="p-3 border-t border-t-dark-lightest text-center"
            >
              {{ item.multiplicateur }}
            </td>

            <!-- Points (for Bonus) -->
            <td
              v-if="title === 'Bonus'"
              class="p-3 border-t border-t-dark-lightest text-center"
            >
              {{ item.points }}
            </td>

            <!-- Actions -->
            <td class="p-3 border-t border-t-dark-lightest text-center w-20">
              <button
                @click="
                  $emit('open-modal', {
                    type: 'edit',
                    item: item,
                    itemType: addButtonText,
                  })
                "
                class="w-4 text-light hover:text-light-darker transition-all"
              >
                <component :is="DotsVerticalIcon"></component>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  DotsVerticalIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "@heroicons/vue/outline";

const props = defineProps(["title", "items", "loading"]);
const emit = defineEmits(["open-modal"]);

const addButtonText = computed(() => {
  switch (props.title) {
    case "Gestion des joueurs":
      return "joueur";
    case "Annonces":
      return "annonce";
    case "Bonus":
      return "bonus";
    default:
      return "élément";
  }
});
</script>
