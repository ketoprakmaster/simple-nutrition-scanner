import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const BASE_PATH = process.env.BASE_PATH ?? '';

const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			fallback: 'index.html'
        }),

		output: {
		    bundleStrategy: 'single'
		},

        paths: {
            relative: false,
			base:  BASE_PATH,
		},

		alias: {
			$components: 'src/components'
		}
	}
};

export default config;
