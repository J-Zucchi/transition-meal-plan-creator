import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Stringify the key so it appears as a string literal in the client code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process.env to prevent crashes if libraries try to access it
      'process.env': {},
    },
  };
});