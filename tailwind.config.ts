import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // 👇 Khai báo đường dẫn vào thư mục src để Tailwind biết chỗ tô màu
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        luxury: ['"Cinzel"', "serif"], // Font chữ sang trọng của bạn
      },
    },
  },
  plugins: [],
};
export default config;