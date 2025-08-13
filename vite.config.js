import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:[{
    host: true, // Permite acesso externo
    port: 5000, // Porta do servidor de desenvolvimento
    strictPort: true, // Garante que a porta especificada esteja disponível
  }],
})
