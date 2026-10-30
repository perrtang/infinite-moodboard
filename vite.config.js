import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("mammoth")) return "word-import";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("@firebase/firestore")) return "firebase-firestore";
          if (id.includes("@firebase/auth")) return "firebase-auth";
          if (id.includes("@firebase")) return "firebase-core";
          if (id.includes("react") || id.includes("scheduler")) return "react";
          if (id.includes("opencc-js")) return "opencc";
          if (id.includes("yjs") || id.includes("lib0")) return "collaboration-engine";
          return "vendor";
        },
      },
    },
  },
});
