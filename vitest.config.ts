import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: false,
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "json-summary"],
			include: ["src/utils/**/*.ts"],
			exclude: ["src/**/*.test.ts"],
			thresholds: {
				lines: 80,
				statements: 80,
				functions: 80,
				branches: 80,
			},
		},
	},
	resolve: {
		alias: {
			"~": new URL("./src", import.meta.url).pathname,
		},
	},
});
