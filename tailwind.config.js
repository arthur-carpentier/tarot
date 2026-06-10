import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{vue,js}"],

    darkMode: "class",

    theme: {
        extend: {
            fontFamily: {
                sans: ["Mulish", ...defaultTheme.fontFamily.sans],
                display: ["Poppins", ...defaultTheme.fontFamily.sans],
            },
            // Charte graphique vorteX-io
            colors: {
                navy: {
                    DEFAULT: "#113B54",
                    deep: "#0A2434",
                },
                chartreuse: "#DBE64C",
                periwinkle: "#BBD1FF",
                watergreen: "#E2F4DF",
                pine: "#024442",
            },
        },
    },

    plugins: [forms],
};
