import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B465E",
        lime: "#A5CD39",
        "dark-green": "#1B9046",
        "sky-blue": "#17a1c7",
      },
    },
  },
  plugins: [],
}
export default config