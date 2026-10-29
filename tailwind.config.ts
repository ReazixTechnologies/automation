import type { Config } from "tailwindcss";

/**
 * Design tokens — see BRAND.md. Semantic colors (background, foreground, card,
 * muted, border) read from CSS variables in src/styles/brand.css so they flip
 * between the default dark theme and the optional light theme.
 * Copper is the only brand accent. `wa` / `ig` exist solely for authentic
 * WhatsApp / Instagram styling *inside* phone mockups and channel indicators.
 */
const withVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  // `dark:` applies under html.dark, except inside .force-light (phone screens keep real light skins).
  darkMode: ["variant", "&:is(.dark *):not(:is(.force-light, .force-light *))"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "80rem" }, // max-w-7xl
    },
    extend: {
      colors: {
        background: withVar("--background"),
        foreground: withVar("--foreground"),
        card: withVar("--card"),
        muted: {
          DEFAULT: withVar("--muted"),
          foreground: withVar("--muted-foreground"),
        },
        border: withVar("--border"),
        ring: withVar("--ring"),

        wa: {
          DEFAULT: "#25D366",
          deep: "#075E54",
          teal: "#128C7E",
          bubble: "#D9FDD3",
          "bubble-dark": "#005C4B",
          incoming: "#FFFFFF",
          "incoming-dark": "#202C33",
          header: "#075E54",
          "header-dark": "#202C33",
          tick: "#53BDEB",
          wallpaper: "#ECE5DD",
          "wallpaper-dark": "#0B141A",
        },
        ig: {
          orange: "#F58529",
          pink: "#DD2A7B",
          purple: "#8134AF",
          blue: "#515BD4",
        },
        copper: {
          300: "#FFB27A", // small text on dark
          400: "#F58A4B", // small text on dark, icons
          500: "#E8692E", // primary
          600: "#C4501F",
          700: "#8F3714", // copper text on light backgrounds (AA)
        },
        cream: "#F3E9DD",
        ink: {
          DEFAULT: "#0C0A08",
          900: "#070707",
          800: "#161412",
          700: "#221E1A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-inter)", "ui-sans-serif", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.25em",
      },
      borderRadius: {
        card: "12px",
        phone: "24px",
      },
      backgroundImage: {
        "ig-gradient": "linear-gradient(45deg, #F58529 0%, #DD2A7B 35%, #8134AF 70%, #515BD4 100%)",
        "wa-gradient": "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
        // Signature gradient (text highlights, marks).
        "copper-gradient": "linear-gradient(135deg, #FFB27A, #E8692E 50%, #C4501F)",
        // Lighter variant for filled buttons so dark label text keeps AA contrast end to end.
        "copper-button": "linear-gradient(135deg, #FFB27A, #F58A4B 45%, #E8692E)",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.12), 0 4px 12px rgb(0 0 0 / 0.12)",
        card: "0 1px 2px rgb(0 0 0 / 0.16), 0 8px 24px rgb(0 0 0 / 0.18), 0 24px 48px -12px rgb(0 0 0 / 0.25)",
        glass: "0 1px 0 rgb(255 255 255 / 0.06) inset, 0 8px 32px rgb(0 0 0 / 0.35)",
        // Thin copper edge glow around phone frames.
        phone:
          "0 0 0 1px rgb(232 105 46 / 0.45), 0 0 24px rgb(232 105 46 / 0.25), 0 30px 60px -12px rgb(0 0 0 / 0.6)",
        // Signature glow.
        "glow-copper": "0 0 24px rgb(232 105 46 / 0.35)",
        "glow-copper-strong": "0 0 36px rgb(232 105 46 / 0.55)",
      },
      spacing: {
        18: "4.5rem",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-line": {
          to: { strokeDashoffset: "-24" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "typing-dot": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-3px)", opacity: "1" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "pulse-line": "pulse-line 1.6s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out 1s infinite",
        "typing-dot": "typing-dot 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
