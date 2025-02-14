<template>
  <div
    class="flex min-h-screen bg-green-900 text-white"
    style="font-family: 'Poppins', sans-serif"
  >
    <Sidebar />

    <main class="flex-1 px-6 py-10 relative">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold">Gestion des joueurs</h1>
        <button
          @click="openCreateModal"
          class="bg-blue-500 px-4 py-2 rounded text-white font-semibold shadow-md hover:bg-blue-600 transition"
        >
          + Ajouter un joueur
        </button>
      </div>

      <!-- Skeleton Loader -->
      <div v-if="loading" class="bg-green-800 p-6 rounded-lg shadow-lg">
        <div
          v-for="n in 5"
          :key="n"
          class="animate-pulse flex items-center space-x-4 py-2"
        >
          <div class="bg-gray-500 h-12 w-12 rounded-full"></div>
          <div class="flex-1">
            <div class="bg-gray-500 h-4 w-1/3 mb-2"></div>
            <div class="bg-gray-500 h-4 w-1/4"></div>
          </div>
        </div>
      </div>

      <!-- Si aucun joueur -->
      <p v-else-if="players.length === 0" class="text-center text-gray-300 text-lg">
        Aucun joueur enregistré pour le moment.
      </p>

      <!-- Tableau des joueurs -->
      <div v-else class="bg-green-800 p-6 rounded-lg shadow-lg overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-green-700 text-left text-white">
              <th class="p-3 border-b">Photo</th>
              <th class="p-3 border-b">Nom</th>
              <th class="p-3 border-b">Couleur</th>
              <th class="p-3 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="player in players"
              :key="player.id"
              class="hover:bg-green-600 transition"
            >
              <td class="p-3 border-b">
                <img
                  :src="
                    player.photo
                      ? `/storage/${player.photo}`
                      : '/images/default-avatar.png'
                  "
                  class="w-12 h-12 rounded-full shadow-md"
                />
              </td>
              <td class="p-3 border-b font-semibold">{{ player.name }}</td>
              <td class="p-3 border-b">
                <div
                  :style="{ backgroundColor: player.color }"
                  class="w-6 h-6 rounded-full border border-white shadow"
                ></div>
              </td>
              <td class="p-3 border-b">
                <button
                  @click="openEditModal(player)"
                  class="bg-yellow-500 px-4 py-2 rounded text-black font-semibold shadow hover:bg-yellow-600 transition"
                >
                  Modifier
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Popup de création -->
      <div
        v-if="showCreateModal"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-xl z-50 transition-opacity duration-300"
        @click.self="showCreateModal = false"
      >
        <div
          class="bg-white/40 backdrop-blur-lg p-8 rounded-3xl shadow-2xl text-white w-96 animate-fade-in transform transition-all scale-95 sm:scale-100"
          @click.stop
        >
          <h2 class="text-2xl font-semibold mb-6 text-center tracking-wide">
            Nouveau Joueur
          </h2>

          <!-- Aperçu de l'image -->
          <div class="flex justify-center mb-5">
            <label for="photo-upload" class="cursor-pointer">
              <img
                :src="
                  newFile ? URL.createObjectURL(newFile) : '/images/default-avatar.png'
                "
                class="w-24 h-24 rounded-2xl shadow-lg object-cover hover:scale-105 transition-transform duration-300"
                alt="Aperçu photo"
              />
            </label>
          </div>

          <!-- Nom -->
          <div class="mb-4">
            <input
              v-model="newPlayer.name"
              type="text"
              placeholder="Nom du joueur *"
              class="w-full bg-transparent border-none text-white text-lg px-4 py-3 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
            />
          </div>

          <!-- Couleur -->
          <div class="mb-4 flex items-center space-x-4">
            <span class="text-sm text-gray-300">Couleur :</span>
            <input
              v-model="newPlayer.color"
              type="color"
              class="w-10 h-10 rounded-full border-none shadow-lg cursor-pointer"
            />
          </div>

          <!-- Upload Photo -->
          <div class="mb-6">
            <label class="text-sm text-gray-300 block mb-2">Photo</label>
            <input
              id="photo-upload"
              type="file"
              @change="handleNewFileUpload"
              class="w-full text-sm text-gray-300 bg-transparent file:bg-white file:text-gray-800 file:px-4 file:py-2 file:rounded-lg file:shadow-md hover:file:bg-gray-100 transition"
            />
          </div>

          <!-- Boutons -->
          <div class="flex justify-center space-x-4">
            <button
              @click="createPlayer"
              :disabled="!newPlayer.name.trim()"
              class="px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 text-white bg-blue-500 hover:bg-blue-600 hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Ajouter
            </button>
            <button
              @click="showCreateModal = false"
              class="bg-gray-700 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:bg-gray-800 hover:scale-105 transition-all duration-300"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      <!-- Popup d'édition -->
      <div
        v-if="showEditModal"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-xl z-50 transition-opacity duration-300"
        @click.self="showEditModal = false"
      >
        <div
          class="bg-white/40 backdrop-blur-lg p-8 rounded-3xl shadow-2xl text-white w-96 animate-fade-in transform transition-all scale-95 sm:scale-100"
          @click.stop
        >
          <h2 class="text-2xl font-semibold mb-6 text-center tracking-wide">
            Modifier le Joueur
          </h2>

          <!-- Aperçu de l'image -->
          <div class="flex justify-center mb-5">
            <label for="edit-photo-upload" class="cursor-pointer">
              <img
                :src="
                  editedPlayer.photo
                    ? `/storage/${editedPlayer.photo}`
                    : '/images/default-avatar.png'
                "
                class="w-24 h-24 rounded-2xl shadow-lg object-cover hover:scale-105 transition-transform duration-300"
                alt="Aperçu photo"
              />
            </label>
          </div>

          <!-- Nom -->
          <div class="mb-4">
            <input
              v-model="editedPlayer.name"
              type="text"
              placeholder="Nom du joueur *"
              class="w-full bg-transparent border-none text-white text-lg px-4 py-3 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
            />
          </div>

          <!-- Couleur -->
          <div class="mb-4 flex items-center space-x-4">
            <span class="text-sm text-gray-300">Couleur :</span>
            <input
              v-model="editedPlayer.color"
              type="color"
              class="w-10 h-10 rounded-full border-none shadow-lg cursor-pointer"
            />
          </div>

          <!-- Upload Photo -->
          <div class="mb-6">
            <label class="text-sm text-gray-300 block mb-2">Photo</label>
            <input
              id="edit-photo-upload"
              type="file"
              @change="handleFileUpload"
              class="w-full text-sm text-gray-300 bg-transparent file:bg-white file:text-gray-800 file:px-4 file:py-2 file:rounded-lg file:shadow-md hover:file:bg-gray-100 transition"
            />
          </div>

          <!-- Boutons -->
          <div class="flex justify-center space-x-4">
            <button
              @click="updatePlayer"
              :disabled="!editedPlayer.name.trim()"
              class="px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 text-white bg-green-500 hover:bg-green-600 hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Enregistrer
            </button>
            <button
              @click="showEditModal = false"
              class="bg-gray-700 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:bg-gray-800 hover:scale-105 transition-all duration-300"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Sidebar from "@/Components/SideBar.vue";

const players = ref([]);
const loading = ref(true);
const showEditModal = ref(false);
const showCreateModal = ref(false);
const editedPlayer = ref({ id: null, name: "", color: "#FFFFFF", photo: null });
const newPlayer = ref({ name: "", color: "#FFFFFF", photo: null });
const selectedFile = ref(null);
const newFile = ref(null);

onMounted(async () => {
  await fetchPlayers();
});

const fetchPlayers = async () => {
  loading.value = true;
  try {
    const response = await fetch("/api/list-players");
    players.value = response.status === 204 ? [] : await response.json();
  } catch (error) {
    console.error("Erreur de récupération des joueurs :", error);
  } finally {
    loading.value = false;
  }
};

const openEditModal = (player) => {
  editedPlayer.value = { ...player };
  showEditModal.value = true;
};

const openCreateModal = () => {
  newPlayer.value = { name: "", color: "#FFFFFF", photo: null };
  newFile.value = null;
  showCreateModal.value = true;
};

const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0];
};

const handleNewFileUpload = (event) => {
  newFile.value = event.target.files[0];
};

const updatePlayer = async () => {
  const formData = new FormData();
  formData.append("name", editedPlayer.value.name);
  formData.append("color", editedPlayer.value.color);
  if (selectedFile.value) {
    formData.append("photo", selectedFile.value);
  }

  try {
    const response = await fetch(`/api/player/update/${editedPlayer.value.id}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Erreur lors de la mise à jour");

    showEditModal.value = false;
    await fetchPlayers();
  } catch (error) {
    console.error("Erreur de mise à jour :", error);
  }
};

const createPlayer = async () => {
  const formData = new FormData();
  formData.append("name", newPlayer.value.name);
  formData.append("color", newPlayer.value.color);
  if (newFile.value) {
    formData.append("photo", newFile.value);
  }

  try {
    const response = await fetch("/api/player/create", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Erreur lors de la création");

    showCreateModal.value = false;
    await fetchPlayers();
  } catch (error) {
    console.error("Erreur de création :", error);
  }
};
</script>
