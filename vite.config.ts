import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/main.ts",
      name: "raliz",
      fileName: (format) => `raliz.${format}.js`,
      formats: ["umd"],
    },
    rollupOptions: {
      // 外部依赖，不打包进最终库
      external: ["d3"],
      output: {
        globals: {
          d3: "d3",
        },
      },
    },
  },
});
