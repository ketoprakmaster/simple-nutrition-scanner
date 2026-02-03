// File: lib/global.svelte.ts
class GlobalSettings {
    // Load from localStorage or use defaults
    appName = $state(localStorage.getItem('app_name') || 'EatWise');
    showNutriscoreOnCards = $state(localStorage.getItem('show_nutriscore') !== 'false');
    landingTitle = $state(localStorage.getItem('landing_title') || 'Hello!')
    landingSubtitle = $state(localStorage.getItem('landing_subtitle') || "Ready to see what's inside your food today?")

    // Sync changes to localStorage whenever they happen
    constructor() {
        $effect.root(() => {
            $effect(() => {
                console.log(`saving GlobalSettings`)

                localStorage.setItem('app_name', this.appName);
                localStorage.setItem('show_nutriscore', String(this.showNutriscoreOnCards));
                localStorage.setItem('landing_title', String(this.landingTitle));
                localStorage.setItem('landing_subtitle', this.landingSubtitle);
            });
        });
    }
}

export const settings = new GlobalSettings();
