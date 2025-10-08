import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig(({ mode }) => {
  const common = {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3001, // 👈 你想要的 port，例如 5175
      open: true, // 啟動時自動開啟瀏覽器（可選）
    },
  }
  if (mode === "production") {
    return { ...common, base: "/lativ-nextjs-fastapi/" }
  } else {
    return common
  }
})