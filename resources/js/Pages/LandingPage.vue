<template>
  <div
    class="flex min-h-screen bg-dark text-light"
    style="font-family: 'Poppins', sans-serif"
  >
    <!-- Import Sidebar Component -->
    <Sidebar />

    <!-- Main Content -->
    <main
      class="flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
    >
      <div
        class="absolute inset-0 bg-cover bg-center opacity-20"
        style="
          background-image: url('/images/card_table_texture.jpg');
          background-repeat: repeat;
        "
      ></div>
      <div class="relative z-10 animate-fade-in">
        <h1 class="text-5xl font-extrabold">Bienvenue sur Tarot</h1>
        <p class="text-lg text-gray-200 mt-4">
          Gérez vos parties, vos scores et vos statistiques avec style.
        </p>
        <div class="mt-6">
          <Link
            href="/dashboard"
            class="px-6 py-3 bg-yellow-500 text-light font-semibold rounded-lg shadow-lg hover:bg-yellow-600 transition"
          >
            Commencer
          </Link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Sidebar from "@/Components/SideBar.vue"; // Import Sidebar component
import { Link } from "@inertiajs/vue3";
</script>
