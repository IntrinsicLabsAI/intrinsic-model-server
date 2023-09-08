/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

export default {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "../intrinsic-ui/src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
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
        themes: ["business", "forest", "dark"],
    },
};
