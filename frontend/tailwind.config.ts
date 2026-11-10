import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aws: {
          nav: "#232f3e",
          navHover: "#2e3f53",
          navSearch: "#161e2e",
          orange: "#ec7211",
          orangeHover: "#eb5f07",
          blue: "#0972d3",
          blueHover: "#033160",
          border: "#d5dbdb",
          darkBorder: "#414d5c",
          bg: "#f2f3f3",
          darkBg: "#0f1b2a",
          darkCard: "#161e2e",
          tableHeader: "#fafafa",
          text: "#16191f",
          secondaryText: "#5f6b7a",
          success: "#037f0c",
          error: "#d91535",
          warning: "#8d6605",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
