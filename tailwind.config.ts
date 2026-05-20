import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FFE2F4",
        paper: "#fff4fa",
        pink: "#F11787",
        yellow: "#FDE047",
        red: "#FF0000",
        ink: "#0a0608",
        felt: "#0F5132",
        gold: "#C9A23B",
      },
      fontFamily: {
        sans: ["var(--font-bricolage)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["72px", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        h1: ["56px", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        h2: ["40px", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        h3: ["28px", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        body: ["18px", { lineHeight: "1.5" }],
        small: ["14px", { lineHeight: "1.5" }],
        tab: ["13px", { lineHeight: "1", letterSpacing: "0.15em" }],
        marquee: ["14px", { lineHeight: "1", letterSpacing: "0.12em" }],
      },
      boxShadow: {
        sticker: "8px 8px 0 #0a0608",
        btn: "6px 6px 0 #0a0608",
        "btn-press": "4px 4px 0 #0a0608",
      },
      borderWidth: {
        ink: "4px",
        "ink-thin": "3px",
      },
    },
  },
  plugins: [],
};

export default config;
