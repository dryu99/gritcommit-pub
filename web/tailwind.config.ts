import type { Config } from "tailwindcss";

const config: Config = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      textColor: {
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        tertiary: "var(--color-text-tertiary)",
        icon: "var(--color-text-icon)",
        code: "var(--color-text-code)",
        btn: "var(--color-text-btn)",
        link: "var(--color-text-link)",
        placeholder: "var(--color-text-placeholder)",
      },
      backgroundColor: {
        primary: "var(--color-bg-primary)",
        secondary: "var(--color-bg-secondary)",
        tertiary: "var(--color-bg-tertiary)",
        brand: "var(--color-bg-brand)",
        hover: "var(--color-bg-hover)",
        code: "var(--color-bg-code)",
        tooltip: "var(--color-bg-tooltip)",
        op: "var(--color-bg-op)",
        btn: "var(--color-bg-btn)",
      },
      borderColor: {
        primary: "var(--color-border-primary)",
        secondary: "var(--color-border-secondary)",
        focus: "var(--color-border-focus)",
      },
      utilities: {
        ".line-clamp-2": {
          display: "-webkit-box",
          "-webkit-box-orient": "vertical",
          "-webkit-line-clamp": "2",
          overflow: "hidden",
        },
      },
    },
  },
  plugins: [],
};
export default config;
