/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

export default {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "../intrinsic-ui/src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    600: "#34ae8e",
                    500: "#53b79a",
                    400: "#6cc0a6",
                    300: "#83cab2",
                    200: "#98d3bf",
                    100: "#addccb",
                },
                purple: {
                    600: "#978AD4",
                },
                red: {
                    600: "#e3144b",
                    500: "#ea435d",
                    400: "#f1616f",
                    300: "#f67a82",
                    200: "#fa9196",
                    100: "#fea8aa",
                },
                blue: {
                    700: "#61bac7",
                    600: "#82BEC7",
                    500: "#79a3a9",
                    400: "#89aeb4",
                    300: "#9ab9be",
                    200: "#abc5c9",
                    100: "#bbd0d3",
                },
                white: "#FFFFFF",
                black: "#111418",
                dark: {
                    100: "#1C2127",
                    200: "#252A31",
                    300: "#2F343C",
                    400: "#383E47",
                    500: "#404854",
                },
                gray: {
                    100: "#404854",
                    200: "#DCE0E5",
                    300: "#E5E8EB",
                    400: "#F6F7F9",
                    500: "#FAFBFC",
                },
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        "--tw-prose-body": theme("colors.gray.300"),
                        "--tw-prose-headings": theme("colors.gray.200"),
                        "--tw-prose-lead": theme("colors.gray.300"),
                        "--tw-prose-links": theme("colors.cyan.500"),
                        "--tw-prose-bold": theme("colors.gray.500"),
                        "--tw-prose-counters": theme("colors.gray.300"),
                        "--tw-prose-bullets": theme("colors.gray.300"),
                        "--tw-prose-hr": theme("colors.gray.300"),
                        "--tw-prose-quotes": theme("colors.gray.200"),
                        "--tw-prose-quote-borders": theme("colors.gray.300"),
                        "--tw-prose-captions": theme("colors.gray.300"),
                        "--tw-prose-code": theme("colors.gray.200"),
                        "--tw-prose-pre-code": theme("colors.gray.500"),
                        "--tw-prose-pre-bg": theme("colors.gray.700"),
                    },
                },
            }),
        },
    },
    plugins: [
        require("@tailwindcss/forms"),
        require("@tailwindcss/typography"),
        require("daisyui"),
    ],
    daisyui: {
        themes: ["business", "light", "dark", "cupcake"],
    },
};
