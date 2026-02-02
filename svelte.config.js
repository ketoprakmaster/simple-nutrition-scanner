import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

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
			base: process.env.NODE_ENV === 'production'
				? '/simple-nutriscore-scanner'
				: ''
		},

		alias: {
			$components: 'src/components'
		}
	}
};

export default config;
