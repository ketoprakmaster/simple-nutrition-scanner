import { resolve } from "$app/paths";
import { page } from "$app/state";

export const checkActive = (path: any | string) => {
    const resolvedPath = resolve(path);
    const currentPath = page.url.pathname;

    if (resolvedPath === resolve('/')) {
        return currentPath === resolvedPath;
    }
    return currentPath.startsWith(resolvedPath);
};
