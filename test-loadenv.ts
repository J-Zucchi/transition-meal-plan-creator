import { loadEnv } from 'vite';
const env = loadEnv('development', process.cwd(), '');
console.log(Object.keys(env).filter(k => k.includes('KEY') || k.includes('API') || k.includes('GEMINI')));
