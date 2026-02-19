import { ui } from "$lib/ui/alert.svelte"

export function copyToClip(text: string) {
    navigator.clipboard.writeText(text)
        .then(() => {
            ui.show("success copy!" , "success")
        })
        .catch((err) => {
            ui.show(err instanceof Error ? err.message : "error copying!", "error")
        })
}
