import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './vendor/laravel/jetstream/**/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.vue',
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'Figtree', ...defaultTheme.fontFamily.sans],
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

    plugins: [forms, typography],
};
