const { heroui } = require("@heroui/theme");

/** @type {import("tailwindcss").Config} */
module.exports = {
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.{js,jsx,ts,tsx}",
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                sams: {
                    bg: "rgb(var(--sams-bg) / <alpha-value>)",
                    surface: "rgb(var(--sams-surface) / <alpha-value>)",
                    surface2: "rgb(var(--sams-surface-2) / <alpha-value>)",
                    border: "rgb(var(--sams-border) / <alpha-value>)",
                    text: "rgb(var(--sams-text) / <alpha-value>)",
                    muted: "rgb(var(--sams-muted) / <alpha-value>)",
                    accent: "rgb(var(--sams-accent) / <alpha-value>)",
                    accent2: "rgb(var(--sams-accent-2) / <alpha-value>)",
                },
            },
        },
    },
    plugins: [heroui()],
};
