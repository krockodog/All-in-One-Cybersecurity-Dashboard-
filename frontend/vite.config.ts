import { UserConfig, defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const config: UserConfig = {
    plugins: [react()],
    define: {
      "process.env.REACT_APP_BACKEND_URL": JSON.stringify(env.REACT_APP_BACKEND_URL)
    },
    server: {
      host: "0.0.0.0",
      port: 3000
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    }
  };

  return config;
});
