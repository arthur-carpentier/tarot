<template>
  <div class="flex min-h-screen bg-white text-navy dark:bg-navy-deep dark:text-white font-sans">
    <SideBar class="fixed" />
    <main class="md:ml-64 flex-1 px-4 md:px-6 py-10 pt-28 md:pt-10 relative min-w-0">
      <slot />
    </main>
  </div>
</template>

<script setup>
import SideBar from "@/Components/SideBar.vue";
</script>
