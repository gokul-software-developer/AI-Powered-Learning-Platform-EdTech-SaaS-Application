import path from "path"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import tailwindcss from 'tailwindcss'

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
        plugins: [tailwindcss()],
    },   
}, 
})
