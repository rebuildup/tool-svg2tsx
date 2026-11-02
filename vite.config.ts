import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	// The artifact is served from a sub-path by the host
	// (`/tools/svg2tsx/`), so every asset reference in
	// `dist/index.html` has to stay relative. The default (`/`) would
	// point at the host root and 404.
	base: "./",
	plugins: [react()],
});
