<template>
  <div class="relative select-none" :style="{ height: height + 'px' }">
    <!-- Bande de sélection centrale -->
    <div
      class="absolute inset-x-0 pointer-events-none rounded-lg bg-chartreuse/25 ring-1 ring-chartreuse z-0"
      :style="{ top: padding + 'px', height: itemHeight + 'px' }"
    ></div>

    <div
      ref="container"
      class="wheel-scroll relative h-full overflow-y-auto z-10"
      @scroll="onScroll"
    >
      <div :style="{ height: padding + 'px' }"></div>
      <div
        v-for="value in values"
        :key="value"
        class="snap-item flex items-center justify-center font-bold cursor-pointer transition-all duration-100 tabular-nums"
        :style="{ height: itemHeight + 'px' }"
        :class="value === modelValue ? 'text-2xl' : 'text-base opacity-50'"
        @click="select(value)"
      >
        {{ format(value) }}
      </div>
      <div :style="{ height: padding + 'px' }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 91 },
  step: { type: Number, default: 0.5 },
});

const emit = defineEmits(["update:modelValue"]);

const itemHeight = 40;
const visibleItems = 5;
const height = itemHeight * visibleItems;
const padding = (height - itemHeight) / 2;

const container = ref(null);
let scrollTimer = null;

const values = computed(() => {
  const list = [];
  for (let v = props.min; v <= props.max + 1e-9; v += props.step) {
    list.push(Math.round(v * 2) / 2);
  }
  return list;
});

const format = (value) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

const indexOfValue = (value) =>
  Math.min(
    values.value.length - 1,
    Math.max(0, Math.round((value - props.min) / props.step))
  );

const scrollToValue = (value, smooth) => {
  container.value?.scrollTo({
    top: indexOfValue(value) * itemHeight,
    behavior: smooth ? "smooth" : "auto",
  });
};

onMounted(() => scrollToValue(props.modelValue, false));

const onScroll = () => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    const index = Math.min(
      values.value.length - 1,
      Math.max(0, Math.round(container.value.scrollTop / itemHeight))
    );
    const value = values.value[index];
    if (value !== props.modelValue) emit("update:modelValue", value);
  }, 90);
};

const select = (value) => {
  emit("update:modelValue", value);
  scrollToValue(value, true);
};

// Synchronise la roue quand la valeur change ailleurs (reset du formulaire…)
watch(
  () => props.modelValue,
  (value) => {
    if (!container.value) return;
    const currentIndex = Math.round(container.value.scrollTop / itemHeight);
    if (currentIndex !== indexOfValue(value)) scrollToValue(value, true);
  }
);
</script>

<style scoped>
.wheel-scroll {
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent,
    black 28%,
    black 72%,
    transparent
  );
  mask-image: linear-gradient(to bottom, transparent, black 28%, black 72%, transparent);
}

.wheel-scroll::-webkit-scrollbar {
  display: none;
}

.snap-item {
  scroll-snap-align: center;
}
</style>
