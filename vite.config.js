import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import path from "path";

/**
 * @see https://vitejs.dev/config/#build-target
 */
export default defineConfig({
	plugins: [solidPlugin()],
	root: path.join(__dirname, 'src'),
	entry: './src/index.html',
	build: {
		target: 'esnext',
		polyfillDynamicImport: false,
		outDir: '../public',
		emptyOutDir: true,
	},
	server: {
		port: 50000
	}
});
