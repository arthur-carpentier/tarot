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
        @update="updatePlayer"
        @create="createPlayer"
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

const updatePlayer = async () => {
  const formData = new FormData();
  formData.append("name", form.value.name);
  formData.append("color", form.value.color);
  if (selectedFile.value) {
    formData.append("photo", selectedFile.value);
  }

  try {
    const response = await fetch(`/api/player/update/${form.value.id}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Erreur lors de la mise à jour");

    await fetchPlayers();
  } catch (error) {
    console.error("Erreur de mise à jour :", error);
  } finally {
    showModal.value = false;
  }
};

const createPlayer = async () => {
  const formData = new FormData();
  formData.append("name", form.value.name);
  formData.append("color", form.value.color);
  if (newFile.value) {
    formData.append("photo", newFile.value);
  }

  try {
    const response = await fetch("/api/player/create", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Erreur lors de la création");

    await fetchPlayers();
  } catch (error) {
    console.error("Erreur de création :", error);
  } finally {
    showModal.value = false;
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
