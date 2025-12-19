/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "node:path";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	plugins: [
		react(),
		viteStaticCopy({
			targets: [
				{
					src: "src/manifest.json",
					dest: ".",
				},
			],
		}),
	],
	test: {
		environment: "jsdom",
		globals: true,
		// setupFiles: ".src/test/setupTests.ts"
	},
	build: {
		sourcemap: 'inline',
		outDir: "build",
		rollupOptions: {
			input: {
				main: "./index.html",
				background: "./src/background/background.ts",
				content: "./src/content/content-entry.ts",
			},
			output: {
				entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
			},
		},
		minify: false,
	},
	server: {
		hmr: {
			protocol: "ws",
			host: "localhost",
		},
	},
});
