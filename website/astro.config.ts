import { defineConfig } from "astro/config";
import type { AstroIntegration } from "astro";
import mdx from "@astrojs/mdx";
import compress from "astro-compress";
import path from "node:path";
import fs from "node:fs/promises";
import { globby } from "globby";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkToc from "remark-toc";
import react from "@astrojs/react";

function inlineCSS(): AstroIntegration {
	return {
		name: "inlineCSS",
		hooks: {
			"astro:build:done": async ({ dir }) => {
				const files = await globby(`${dir.pathname}/**/*.html`);

				await Promise.all(
					files.map(async (htmlPath) => {
						const stylesPaths: string[] = [];

						let file = await fs.readFile(htmlPath, "utf8");

						file = file.replace(
							/<link rel="stylesheet" href="(.*?)"\s*\/?>/g,
							(match, p1) => {
								stylesPaths.push(p1);
								return `{{${p1}}}`;
							},
						);

						const pageStyles: string[] = await Promise.all(
							stylesPaths.map(async (_stylesPath, i) => {
								let stylesPath;
								if (_stylesPath[0] === "/") {
									stylesPath = `${dir.pathname}${_stylesPath}`;
								} else {
									stylesPath = path.resolve(
										path.join(path.dirname(htmlPath), _stylesPath),
									);
								}
								const styles = await fs.readFile(stylesPath, "utf8");
								return styles;
							}),
						);

						stylesPaths.forEach((p, i) => {
							file = file.replace(
								`{{${p}}}`,
								`<style>${pageStyles[i]}</style>`,
							);
						});

						await fs.writeFile(htmlPath, file);
					}),
				);
			},
		},
	};
}
// https://astro.build/config
export default defineConfig({
	site: "https://rome.tools",
	output: "static",
	outDir: "build",

	integrations: [
		react(),
		inlineCSS(),
		mdx(),
		compress({
			path: "./build",
		}),
	],

	build: {
		format: "directory",
	},

	markdown: {
		syntaxHighlight: "prism",
		remarkPlugins: [remarkToc],
		rehypePlugins: [
			rehypeSlug,
			[
				rehypeAutolinkHeadings,
				{
					behavior: "append",
					content: [],
				},
			],
		],
		extendDefaultPlugins: true,
	},

	vite: {
		plugins: [],

		worker: {
			format: "es",
		},

		server: {
			fs: {
				// https://vitejs.dev/config/server-options.html#server-fs-allow
				allow: [process.cwd(), "../npm/wasm-web"],
			},
		},
	},
});