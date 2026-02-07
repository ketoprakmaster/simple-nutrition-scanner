/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, version, prerendered, base } from '$service-worker';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

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
try {
    registerRoute(new NavigationRoute(
        createHandlerBoundToURL(SHELL)
));
} catch (error) {
	console.error('Workbox NavigationRoute failed. Falling back to manual shell.', error);
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});
