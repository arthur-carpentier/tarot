import { ref, watchEffect } from "vue";

const STORAGE_KEY = "tarot.theme";

// Thème clair/sombre : préférence mémorisée, sinon celle du système.
const stored = localStorage.getItem(STORAGE_KEY);
const isDark = ref(
    stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches
);

watchEffect(() => {
    document.documentElement.classList.toggle("dark", isDark.value);
});

function toggle() {
    isDark.value = !isDark.value;
    localStorage.setItem(STORAGE_KEY, isDark.value ? "dark" : "light");
}

export function useTheme() {
    return { isDark, toggle };
}
