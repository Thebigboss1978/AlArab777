import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 7777,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
        'process.env.ELEVENLABS_API_KEY': JSON.stringify(env.ELEVENLABS_API_KEY || env.VITE_ELEVENLABS_API_KEY),
        'process.env.ELEVENLABS_VOICE_ID': JSON.stringify(env.ELEVENLABS_VOICE_ID || env.VITE_ELEVENLABS_VOICE_ID),
        'process.env.GROQ_API_KEY_1': JSON.stringify(env.GROQ_API_KEY_1 || env.VITE_GROQ_API_KEY_1),
        'process.env.GROQ_API_KEY_2': JSON.stringify(env.GROQ_API_KEY_2 || env.VITE_GROQ_API_KEY_2),
        'process.env.GROQ_API_KEY_3': JSON.stringify(env.GROQ_API_KEY_3 || env.VITE_GROQ_API_KEY_3)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
