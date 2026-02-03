import { page } from '$app/state';
import { resolve } from '$app/paths';
import { ui } from './alert.svelte';

// Helper for Nutri-Score colors
export const gradeColors = {
    a: 'bg-green-600',
    b: 'bg-green-400',
    c: 'bg-yellow-400',
    d: 'bg-orange-500',
    e: 'bg-red-600',
    unknown: 'bg-gray-300'
};

export const checkActive = (path: any | string) => {
    const resolvedPath = resolve(path);
    const currentPath = page.url.pathname;

    if (resolvedPath === resolve('/')) {
        return currentPath === resolvedPath;
    }
    return currentPath.startsWith(resolvedPath);
};

export function copyToClip(text: string) {
    navigator.clipboard.writeText(text)
        .then(() => {
            ui.show("success copy!" , "success")
        })
        .catch((err) => {
            ui.show(err instanceof Error ? err.message : "error copying!", "error")
        })
}
