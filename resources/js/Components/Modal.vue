<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-dark bg-opacity-20 backdrop-blur-xl z-50 transition-opacity duration-300"
    @click.self="closeModal"
  >
    <div
      class="bg-light/40 backdrop-blur-lg p-8 rounded-3xl shadow-2xl text-light w-96 animate-fade-in transform transition-all scale-95 sm:scale-100"
      @click.stop
    >
      <h2 class="text-2xl font-semibold mb-6 text-center tracking-wide">
        {{ isEditing ? "Modifier" : "Ajouter" }}
        {{ type === "annonce" ? "Annonce" : type === "bonus" ? "Bonus" : "Joueur" }}
      </h2>

      <!-- Formulaire générique -->
      <label class="text-sm text-light block mt-2" for="name">Nom</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        placeholder="Nom"
        class="w-full bg-dark-lighter border-none text-light text-lg px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
      />

      <!-- Section Annonce -->
      <div v-if="type === 'annonce'" class="mb-4">
        <label class="text-sm text-light block mt-2" for="color">Couleur</label>
        <input
          id="color"
          v-model="form.color"
          type="color"
          class="w-10 h-10 bg-transparent appearance-none border-none cursor-pointer"
        />
        <label class="text-sm text-light block mt-2" for="multiplicateur"
          >Multiplicateur</label
        >
        <input
          id="multiplicateur"
          v-model="form.multiplicateur"
          type="number"
          placeholder="Multiplicateur *"
          class="w-full bg-dark-lighter border-none text-light text-lg px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300 mt-2"
        />
      </div>

      <!-- Section Bonus -->
      <div v-if="type === 'bonus'" class="mb-4">
        <label class="text-sm text-light block mt-2" for="points">Points</label>
        <input
          id="points"
          v-model="form.points"
          type="number"
          placeholder="Points *"
          class="w-full bg-dark-lighter border-none text-light text-lg px-4 py-3 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
        />
      </div>

      <!-- Section Joueur -->
      <div v-if="type === 'joueur'" class="mb-4">
        <!-- Aperçu de l'image -->
        <div class="flex justify-center mb-5">
          <label for="photo-upload" class="text-sm text-light block mt-2 cursor-pointer">
            <img
              :src="getImageSource"
              class="w-24 h-24 rounded-2xl shadow-lg object-cover hover:scale-105 transition-transform duration-300"
              alt="Aperçu photo"
            />
          </label>
        </div>

        <!-- Upload Photo -->
        <div class="mb-6">
          <label class="text-sm text-light block mt-2" for="photo-upload">Photo</label>
          <input
            id="photo-upload"
            type="file"
            @change="handleFileUpload"
            class="w-full text-sm text-light bg-transparent file:bg-light file:text-gray-800 file:px-4 file:py-2 file:rounded-lg file:shadow-md hover:file:bg-gray-100 transition"
          />
        </div>

        <!-- Couleur -->
        <div class="mb-4 items-center space-x-4">
          <label class="text-sm text-light block mt-2" for="color">Couleur</label>
          <input
            id="color"
            v-model="form.color"
            type="color"
            class="w-10 h-10 bg-transparent appearance-none border-none cursor-pointer"
          />
        </div>
      </div>

      <!-- Boutons -->
      <div class="flex justify-center space-x-4">
        <button
          @click="save"
          :disabled="!form.name.trim()"
          class="px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 text-light bg-green-dark hover:bg-green-bright hover:text-dark hover:scale-105 disabled:bg-gray-500 disabled:text-light disabled:cursor-not-allowed"
        >
          {{ isEditing ? "Enregistrer" : "Ajouter" }}
        </button>
        <button
          @click="closeModal"
          class="bg-dark-lighter px-6 py-3 rounded-xl text-light font-semibold shadow-lg hover:bg-dark hover:text-green-bright hover:scale-105 transition-all duration-300"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, computed, onUnmounted } from "vue";

const props = defineProps({
  type: String,
  isEditing: Boolean,
  form: Object,
});

const emit = defineEmits(["save", "close"]);

const newFile = ref(null);

const handleFileUpload = (event) => {
  newFile.value = event.target.files[0];
};

const getImageSource = computed(() => {
  // Si on est en mode édition et qu'il y a une photo stockée
  if (props.form.photo) {
    return `/storage/${props.form.photo}`;
  }

  // Si on a un nouveau fichier uploadé
  if (newFile.value) {
    return URL.createObjectURL(newFile.value);
  }

  // Image par défaut
  return "/images/default-avatar.png";
});

const save = () => {
  emit("save", {
    ...props.form,
    photo: newFile.value,
  });
};

const closeModal = () => {
  emit("close");
};

onUnmounted(() => {
  if (newFile.value) {
    URL.revokeObjectURL(URL.createObjectURL(newFile.value));
  }
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
