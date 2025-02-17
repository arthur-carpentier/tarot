<template>
  <div
    class="flex min-h-screen bg-green-900 text-white"
    style="font-family: 'Poppins', sans-serif"
  >
    <Sidebar class="fixed" />
    <main class="ml-64 flex-1 px-6 py-10 relative">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold">Gestion des règles</h1>
        <div>
          <button
            @click="openCreateModal('annonce')"
            class="bg-blue-500 px-4 py-2 rounded text-white font-semibold shadow-md hover:bg-blue-600 transition"
          >
            + Ajouter une annonce
          </button>
          <button
            @click="openCreateModal('bonus')"
            class="bg-purple-500 px-4 py-2 ml-2 rounded text-white font-semibold shadow-md hover:bg-purple-600 transition"
          >
            + Ajouter un bonus
          </button>
        </div>
      </div>

      <!-- Skeleton Loader for Annonces -->
      <div v-if="loadingAnnonces" class="bg-green-800 p-6 rounded-lg shadow-lg">
        <div
          v-for="n in 5"
          :key="n"
          class="animate-pulse flex items-center space-x-4 py-2"
        >
          <div class="bg-gray-500 h-4 w-1/3 mb-2"></div>
          <div class="bg-gray-500 h-4 w-1/4"></div>
        </div>
      </div>

      <!-- Annonces Table -->
      <div v-else class="bg-green-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 class="text-2xl font-semibold mb-4">Annonces</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-green-700 text-left text-white">
              <th class="p-3 border-b">Nom</th>
              <th class="p-3 border-b">Couleur</th>
              <th class="p-3 border-b">Multiplicateur</th>
              <th class="p-3 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="annonce in annonces"
              :key="annonce.id"
              class="hover:bg-green-600 transition"
            >
              <td class="p-3 border-b font-semibold">{{ annonce.name }}</td>
              <td class="p-3 border-b">
                <div
                  :style="{ backgroundColor: annonce.color }"
                  class="w-6 h-6 rounded-full border shadow"
                ></div>
              </td>
              <td class="p-3 border-b">{{ annonce.multiplicateur }}</td>
              <td class="p-3 border-b">
                <button
                  @click="openEditModal('annonce', annonce)"
                  class="bg-yellow-500 px-4 py-2 rounded text-black font-semibold shadow hover:bg-yellow-600 transition"
                >
                  Modifier
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Skeleton Loader for Bonuses -->
      <div v-if="loadingBonuses" class="bg-green-800 p-6 rounded-lg shadow-lg">
        <div
          v-for="n in 5"
          :key="n"
          class="animate-pulse flex items-center space-x-4 py-2"
        >
          <div class="bg-gray-500 h-4 w-1/3 mb-2"></div>
          <div class="bg-gray-500 h-4 w-1/4"></div>
        </div>
      </div>

      <!-- Bonuses Table -->
      <div v-else class="bg-green-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-semibold mb-4">Bonuses</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-green-700 text-left text-white">
              <th class="p-3 border-b">Nom</th>
              <th class="p-3 border-b">Points</th>
              <th class="p-3 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="bonus in bonuses"
              :key="bonus.id"
              class="hover:bg-green-600 transition"
            >
              <td class="p-3 border-b font-semibold">{{ bonus.name }}</td>
              <td class="p-3 border-b">{{ bonus.points }}</td>
              <td class="p-3 border-b">
                <button
                  @click="openEditModal('bonus', bonus)"
                  class="bg-yellow-500 px-4 py-2 rounded text-black font-semibold shadow hover:bg-yellow-600 transition"
                >
                  Modifier
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modals (Shared for Create/Edit) -->
      <div
        v-if="showModal"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-xl z-50"
      >
        <div
          class="bg-white/40 backdrop-blur-lg p-8 rounded-3xl shadow-2xl text-white w-96"
        >
          <h2 class="text-2xl font-semibold mb-6 text-center">
            {{ isEditing ? "Modifier" : "Ajouter" }}
            {{ modalType === "annonce" ? "Annonce" : "Bonus" }}
          </h2>

          <input
            v-model="form.name"
            type="text"
            placeholder="Nom *"
            class="w-full bg-black bg-opacity-25 border-none text-white text-lg px-4 py-3 rounded-xl mb-4"
          />

          <div v-if="modalType === 'annonce'" class="mb-4">
            <input
              v-model="form.color"
              type="color"
              class="w-10 h-10 rounded-full border shadow-lg cursor-pointer"
            />
            <input
              v-model="form.multiplicateur"
              type="number"
              placeholder="Multiplicateur *"
              class="w-full bg-black bg-opacity-25 border-none text-white text-lg px-4 py-3 rounded-xl mt-2"
            />
          </div>

          <div v-if="modalType === 'bonus'" class="mb-4">
            <input
              v-model="form.points"
              type="number"
              placeholder="Points *"
              class="w-full bg-black bg-opacity-25 border-none text-white text-lg px-4 py-3 rounded-xl"
            />
          </div>

          <div class="flex justify-center space-x-4">
            <button
              @click="saveItem(modalType)"
              class="px-6 py-3 rounded-xl font-semibold shadow-lg text-white bg-blue-500 hover:bg-blue-600"
            >
              {{ isEditing ? "Enregistrer" : "Ajouter" }}
            </button>
            <button
              @click="showModal = false"
              class="bg-gray-700 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:bg-gray-800"
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

const annonces = ref([]);
const bonuses = ref([]);
const loadingAnnonces = ref(true);
const loadingBonuses = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const modalType = ref(""); // "annonce" or "bonus"

// Define editedAnnonce and editedBonus
const editedAnnonce = ref({ id: null, name: "", color: "#FFFFFF", multiplicateur: 1 });
const editedBonus = ref({ id: null, name: "", points: 0 });

// Use the same form reference for modal data
const form = ref({ name: "", color: "#FFFFFF", multiplicateur: 1, points: 0 });

onMounted(() => {
  fetchAnnonces();
  fetchBonuses();
});

const fetchAnnonces = async () => {
  const response = await fetch("/api/annonces");
  annonces.value = await response.json();
  loadingAnnonces.value = false;
};

const fetchBonuses = async () => {
  const response = await fetch("/api/bonuses");
  bonuses.value = await response.json();
  loadingBonuses.value = false;
};

const openCreateModal = (type) => {
  modalType.value = type;
  isEditing.value = false;
  showModal.value = true;

  // Reset form fields
  form.value =
    type === "annonce"
      ? { id: null, name: "", color: "#FFFFFF", multiplicateur: 1 }
      : { id: null, name: "", points: 0 };
};

const openEditModal = (type, item) => {
  modalType.value = type;
  isEditing.value = true;
  showModal.value = true;

  // Update the correct reference
  if (type === "annonce") {
    editedAnnonce.value = { ...item };
    form.value = editedAnnonce.value;
  } else {
    editedBonus.value = { ...item };
    form.value = editedBonus.value;
  }
};

const saveItem = async (type) => {
  const isAnnonce = type === "annonce";
  const item = form.value; // Use form, which is updated when opening modal
  const isEditingItem = item.id !== null;
  const url = isEditingItem ? `/api/${type}/update/${item.id}` : `/api/${type}/store`;

  const formData = new FormData();
  formData.append("name", item.name);

  if (isAnnonce) {
    formData.append("color", item.color || "#FFFFFF");
    formData.append("multiplicateur", item.multiplicateur);
  } else {
    formData.append("points", item.points);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok)
      throw new Error(`Erreur lors de la ${isEditingItem ? "mise à jour" : "création"}`);

    // Close modal and refresh data
    showModal.value = false;
    isAnnonce ? fetchAnnonces() : fetchBonuses();
  } catch (error) {
    console.error(
      `Erreur lors de la ${isEditingItem ? "mise à jour" : "création"} :`,
      error
    );
  }
};
</script>
