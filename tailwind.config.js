import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{vue,js}"],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Poppins", "Figtree", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                dark: {
                    DEFAULT: "#0f0f0f",
                    lighter: "#202020",
                    lightest: "#404040",
                },
                green: {
                    bright: "#5dd62c",
                    dark: "#337418",
                },
                light: {
                    DEFAULT: "#f8f8f8",
                    darker: "#bbbbbb",
                },
            },
        },
    },

    plugins: [forms],
};
