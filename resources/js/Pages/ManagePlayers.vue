<template>
  <div
    class="flex min-h-screen bg-dark text-light"
    style="font-family: 'Poppins', sans-serif"
  >
    <Sidebar class="fixed" />

    <main class="ml-64 flex-1 px-6 py-10 relative">
      <Section
        title="Gestion des joueurs"
        :items="players"
        :loading="loading"
        @open-modal="handleModalOpen($event)"
      >
      </Section>

      <!-- Modal Component -->
      <Modal
        v-if="showModal"
        :type="modalType"
        :is-editing="isEditing"
        :form="form"
        @save="saveItem"
        @close="showModal = false"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Sidebar from "@/Components/SideBar.vue";
import Section from "@/Components/Section.vue";
import Modal from "@/Components/Modal.vue";

const players = ref([]);
const loading = ref(true);
const showEditModal = ref(false);
const showCreateModal = ref(false);
const editedPlayer = ref({ id: null, name: "", color: "#FFFFFF", photo: null });
const newPlayer = ref({ name: "", color: "#FFFFFF", photo: null });
const selectedFile = ref(null);
const newFile = ref(null);
const showModal = ref(false);
const isEditing = ref(false);
const modalType = ref(""); // "annonce" or "bonus"

const form = ref({
  id: null,
  name: "",
  color: "#FFFFFF",
  multiplicateur: 1,
  points: 0,
  photo: null,
});

onMounted(async () => {
  await fetchPlayers();
});

const fetchPlayers = async () => {
  loading.value = true;
  try {
    const response = await fetch("/api/players");
    players.value = response.status === 204 ? [] : await response.json();
  } catch (error) {
    console.error("Erreur de récupération des joueurs :", error);
  } finally {
    loading.value = false;
  }
};

const handleModalOpen = ({ type, item, itemType }) => {
  modalType.value = itemType;
  isEditing.value = type === "edit";
  showModal.value = true;
  form.value = item
    ? { ...item }
    : { id: null, name: "", color: "#FFFFFF", multiplicateur: 1, points: 0, photo: null };
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

<style scoped>
.input-field {
  width: 100%;
  background: transparent;
  border: none;
  color: white;
  padding: 12px;
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.2);
}

.file-input {
  width: 100%;
  color: gray;
}

.btn-primary {
  background: #3b82f6;
  padding: 10px;
  border-radius: 10px;
  font-weight: bold;
  transition: 0.3s;
}

.btn-secondary {
  background: #555;
}
</style>
