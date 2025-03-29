<template>
  <div
    class="flex min-h-screen bg-dark text-light"
    style="font-family: 'Poppins', sans-serif"
  >
    <Sidebar class="fixed" />
    <main class="ml-64 flex-1 px-6 py-10 relative">
      <div class="space-y-20">
        <!-- Section Component -->
        <Section
          title="Annonces"
          :items="annonces"
          :loading="loadingAnnonces"
          @open-modal="handleModalOpen($event)"
        />
        <Section
          title="Bonus"
          :items="bonuses"
          :loading="loadingBonuses"
          @open-modal="handleModalOpen($event)"
        />
      </div>

      <!-- Modal Component -->
      <Modal
        v-if="showModal"
        :type="modalType"
        :is-editing="isEditing"
        :form="form"
        @update="updateItem"
        @create="createItem"
        @close="showModal = false"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Sidebar from "@/Components/SideBar.vue";
import Section from "@/Components/Section.vue"; // Extracted section component
import Modal from "@/Components/Modal.vue"; // Extracted modal component

const annonces = ref([]);
const bonuses = ref([]);
const loadingAnnonces = ref(true);
const loadingBonuses = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const modalType = ref(""); // "annonce" or "bonus"

const form = ref({ id: null, name: "", color: "#FFFFFF", multiplicateur: 1, points: 0 });

onMounted(() => {
  fetchData("annonces");
  fetchData("bonuses");
});

const fetchData = async (type) => {
  const refVar = type === "annonces" ? annonces : bonuses;
  const loadingVar = type === "annonces" ? loadingAnnonces : loadingBonuses;

  loadingVar.value = true;
  try {
    const response = await fetch(`/api/${type}`);
    refVar.value = await response.json();
  } catch (error) {
    console.error(`Erreur de chargement des ${type}:`, error);
  } finally {
    loadingVar.value = false;
  }
};

const handleModalOpen = ({ type, item, itemType }) => {
  modalType.value = itemType;
  isEditing.value = type === "edit";
  showModal.value = true;
  form.value = item
    ? { ...item }
    : { id: null, name: "", color: "#FFFFFF", multiplicateur: 1, points: 0 };
};

const updateItem = async () => {
  const isAnnonce = modalType.value === "annonce";
  const item = form.value;
  const url = `/api/${modalType.value}/update/${item.id}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(item),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Erreur lors de l'enregistrement.");

    showModal.value = false;
    fetchData(isAnnonce ? "annonces" : "bonuses");
  } catch (error) {
    console.error("Erreur d'enregistrement:", error);
  } finally {
    showModal = false;
  }
};
const createItem = async () => {
  const isAnnonce = modalType.value === "annonce";
  const item = form.value;
  const url = `/api/${modalType.value}/store`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(item),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Erreur lors de l'enregistrement.");

    showModal.value = false;
    fetchData(isAnnonce ? "annonces" : "bonuses");
  } catch (error) {
    console.error("Erreur d'enregistrement:", error);
  } finally {
    showModal = false;
  }
};
</script>
