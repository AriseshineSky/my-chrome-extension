/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
	plugins: [
		react(),
		viteStaticCopy({
			targets: [
				{
					src: "public/manifest.json",
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
		outDir: "build",
		rollupOptions: {
			input: {
				main: "./index.html",
				background: "./background/background.ts",
				content: "./content/content.ts",
			},
			output: {
				entryFileNames: "[name].js",
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
