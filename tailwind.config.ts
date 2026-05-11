/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Profitia Brand
        brand: {
          navy: "#242F44",
          blue: "#006D9E",
          "bright-blue": "#0092D9",
          purple: "#48103F",
          magenta: "#8E0055",
        },
        // Advisory UI semantic tokens
        advisory: {
          bg: "#FAFAFA",
          surface: "#FFFFFF",
          border: "#E5E7EB",
          "border-subtle": "#F3F4F6",
          text: "#111827",
          "text-muted": "#6B7280",
          "text-subtle": "#9CA3AF",
          accent: "#242F44",
          "accent-hover": "#1a2235",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      letterSpacing: {
        widest: "0.25em",
        "extra-wide": "0.15em",
      },
      transitionTimingFunction: {
        "advisory-ease": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "indicator-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 0.2s ease-out",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
        "indicator-blink": "indicator-blink 1.4s ease-in-out infinite",
      },
      boxShadow: {
        "advisory-sm": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        advisory: "0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        "advisory-lg": "0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)",
        "advisory-xl": "0 32px 64px rgba(0,0,0,0.14), 0 16px 32px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        "2.5xl": "1.25rem",
        "3xl": "1.5rem",
      },
      zIndex: {
        advisory: "9999",
        "advisory-modal": "10000",
      },
    },
  },
  plugins: [],
};
