/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, version, prerendered } from '$service-worker';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const SHELL = '/';

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
registerRoute(new NavigationRoute(createHandlerBoundToURL(SHELL)));

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});
