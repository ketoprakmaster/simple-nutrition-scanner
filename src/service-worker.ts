/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, version, prerendered, base } from '$service-worker';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

// Resolve the SHELL URL
const SHELL = prerendered.find(p => p === base || p === `${base}/` || p.endsWith('index.html')) || '/';

// Ignored Files:
const IGNORED_FILES = [
	'.nojekyll',
	'.DS_Store',
	// Add other patterns here
];

// define static assets
const manifest = [
	...build,
	...files,
	...prerendered
]
.filter((file) => !IGNORED_FILES.some(ignored => file.endsWith(ignored)))
.map((url) => ({
	url,
	revision: version
}));

// Precache all static assets
precacheAndRoute(manifest);

// Delete all old cache
cleanupOutdatedCaches();

// SHELL fallback logic
registerRoute(new NavigationRoute(
    createHandlerBoundToURL(SHELL)
));

// Cache API calls
registerRoute(
	({ url }) => url.origin === 'https://world.openfoodfacts.org',
	new StaleWhileRevalidate({
		cacheName: 'food-api-cache',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds:  24 * 60 * 60, // 1 day
			}),
		],
	})
);

// Cache Food Images
registerRoute(
	({ url }) => url.origin === 'https://images.openfoodfacts.org',
	new CacheFirst({
		cacheName: 'food-images-cache',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
			}),
		],
	})
);

// Cache Static Assets
registerRoute(
	({ url }) => url.origin === 'https://static.openfoodfacts.org',
	new CacheFirst({
		cacheName: 'off-static-assets',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 60 * 60 * 24 * 90, // 90 Days
			}),
		],
	})
);

self.addEventListener('install', () => {
    self.skipWaiting()
});

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});
