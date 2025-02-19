<template>
  <div>
    <!-- Section Header -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold">{{ title }}</h2>
      <button
        @click="$emit('open-modal', { type: 'create', item: null, itemType: addButtonText })"
        class="bg-green-dark px-4 py-2 rounded text-light font-semibold shadow-md hover:bg-green-bright hover:text-dark transition"
      >
        + Ajouter {{ addButtonText }}
      </button>
    </div>

    <!-- Skeleton Loader -->
    <div v-if="loading" class="bg-dark-lighter rounded-lg shadow-lg p-6">
      <div v-for="n in 5" :key="n" class="animate-pulse flex items-center space-x-4 py-2">
        <div
          v-if="title === 'Gestion des joueurs'"
          class="bg-gray-500 h-12 w-12 rounded-full"
        ></div>
        <div class="flex-1">
          <div class="bg-gray-500 h-4 w-1/3 mb-2"></div>
          <div class="bg-gray-500 h-4 w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- No Items -->
    <p v-else-if="items.length === 0" class="text-center text-gray-300 text-lg">
      Aucun {{ title.toLowerCase() }} enregistré pour le moment.
    </p>

    <!-- Table Content -->
    <div v-else class="bg-dark-lighter rounded-lg shadow-lg overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="text-left text-light">
            <th v-if="title === 'Gestion des joueurs'" class="p-3 border-b">Photo</th>
            <th class="p-3 border-b">Nom</th>
            <th
              v-if="title === 'Gestion des joueurs' || title === 'Annonces'"
              class="p-3 border-b text-center"
            >
              Couleur
            </th>
            <th v-if="title === 'Annonces'" class="p-3 border-b text-center">
              Multiplicateur
            </th>
            <th v-if="title === 'Bonus'" class="p-3 border-b text-center">Points</th>
            <th class="p-3 border-b text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="transition">
            <!-- Player Photo -->
            <td v-if="title === 'Gestion des joueurs'" class="p-3 border-b">
              <img
                :src="
                  item.photo ? `/storage/${item.photo}` : '/images/default-avatar.png'
                "
                class="w-12 h-12 rounded-full shadow-md"
              />
            </td>

            <!-- Name -->
            <td class="p-3 border-b font-semibold">{{ item.name }}</td>

            <!-- Color Indicator -->
            <td
              v-if="title === 'Gestion des joueurs' || title === 'Annonces'"
              class="p-3 border-b text-center"
            >
              <div
                :style="{ backgroundColor: item.color }"
                class="w-6 h-6 rounded-full border shadow"
              ></div>
            </td>

            <!-- Multiplicateur (for Annonces) -->
            <td v-if="title === 'Annonces'" class="p-3 border-b text-center">
              {{ item.multiplicateur }}
            </td>

            <!-- Points (for Bonus) -->
            <td v-if="title === 'Bonus'" class="p-3 border-b text-center">
              {{ item.points }}
            </td>

            <!-- Actions -->
            <td class="p-3 border-b text-center">
              <button
                @click="
                  $emit('open-modal', {
                    type: 'edit',
                    item: item,
                    itemType: addButtonText,
                  })
                "
                class="bg-green-dark px-4 py-2 rounded text-light font-semibold shadow hover:bg-green-bright hover:text-dark transition"
              >
                Modifier
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
