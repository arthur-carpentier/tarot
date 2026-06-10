<template>
  <div
    class="rounded-full shadow-md flex items-center justify-center font-bold text-navy select-none shrink-0"
    :class="sizeClass"
    :style="{ backgroundColor: playerColor(name) }"
    :title="name"
  >
    {{ playerInitials(name) }}
  </div>
</template>

<script setup>
import { computed } from "vue";
import { playerColor, playerInitials } from "@/services/avatars";

const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: "md" }, // sm | md | lg
});

const sizeClass = computed(
  () =>
    ({
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-12 h-12 text-base",
    }[props.size])
);
</script>
