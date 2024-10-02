import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Ensure that the build output goes to the correct directory (Netlify expects it in 'dist' by default)
  },
  base: '/', // Ensures that the base URL is correct when deploying to Netlify
})