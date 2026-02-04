/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, version, prerendered } from '$service-worker';

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files, ...prerendered];
const SHELL = prerendered.includes('/') ? '/' : prerendered[0];

self.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
        for (const file of ASSETS) {
            try {
                await cache.add(file)
            }
            catch {
                console.error(`[SW] failed to add files to cache: ${file}`)
            }
        }
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;


    async function respondNavigate(): Promise<Response> {
    	const cache = await caches.open(CACHE);

    	try {
    		const response = await fetch(event.request);

    		if (response.ok) return response;

    		console.warn('[SW] navigation fetch returned', response.status);
    	} catch (err) {
    		console.warn('[SW] navigation fetch failed', err);
    	}

    	const cached = await cache.match(SHELL);
    	if (cached) return cached;

    	return new Response('App shell not available', {
    		status: 503,
    		headers: { 'Content-Type': 'text/plain' }
    	});
    }


    async function respond(): Promise<Response> {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);

        if (ASSETS.includes(url.pathname)) {
            const cached = await cache.match(url.pathname);
            if (cached) return cached;
        }

        try {
            const response = await fetch(event.request);

            if (!response || !(response instanceof Response)) {
                throw new Error('Invalid fetch response');
            }

            if (response.ok || response.type === 'opaque') {
                cache.put(event.request, response.clone());
            }

            return response;
        } catch {
            const cached = await cache.match(event.request);
            if (cached) return cached;

            return new Response('Offline and not cached', {
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
            });
        }
    }


    if (event.request.mode === 'navigate') {
		event.respondWith(respondNavigate());
        return;

    } else {
        event.respondWith(respond());
	}
});
