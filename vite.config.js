import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

function htmlInputs() {
  const files = fs.readdirSync(process.cwd());
  const inputs = {};
  for (const f of files) {
    if (f.endsWith(".html")) {
      inputs[path.parse(f).name] = path.resolve(process.cwd(), f);
    }
  }
  return inputs;
}

export default defineConfig({
  base: "/imcwf/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: htmlInputs(), // picks up index.html, wireframe.html, etc.
    },
  },
});
