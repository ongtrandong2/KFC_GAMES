import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import autoprefixer from "autoprefixer";

const buildScript = process.env.npm_lifecycle_event;

const app = buildScript && buildScript.includes(":") ? buildScript.split(":")[1] : "o-an-quan";

const buildConfig = {
  outDir: `./${app}/dist`,
  rootHtml: `./${app}.html`
};

export default defineConfig({
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  plugins: [ViteImageOptimizer()],
  build: {
    outDir: buildConfig.outDir,
    rollupOptions: {
      input: {app: buildConfig.rootHtml},
    }
  }
});
