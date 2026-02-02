import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isProd = process.env.NODE_ENV === 'production';

const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			fallback: 'index.html'
        }),

        paths: {
			base: isProd ? process.env.BASE_PATH ?? '' : '',
		},

		alias: {
			$components: 'src/components'
		}
	}
};

export default config;
