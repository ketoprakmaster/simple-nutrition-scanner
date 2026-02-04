// File: lib/global.svelte.ts
class GlobalSettings {
    // Load from localStorage or use defaults
    appName = $state(localStorage.getItem('app_name') || 'EatWise');
    showNutriscoreOnCards = $state(localStorage.getItem('show_nutriscore') !== 'false');
    landingTitle = $state(localStorage.getItem('landing_title') || 'Hello!')
    landingSubtitle = $state(localStorage.getItem('landing_subtitle') || "Ready to see what's inside your food today?")
    // Generate a random ID once for each installation
    instanceId = $state(localStorage.getItem('instance_id') || this.generateID());

    // Sync changes to localStorage whenever they happen
    constructor() {
        $effect.root(() => {
            $effect(() => {
                localStorage.setItem('app_name', this.appName);
                localStorage.setItem('show_nutriscore', String(this.showNutriscoreOnCards));
                localStorage.setItem('landing_title', String(this.landingTitle));
                localStorage.setItem('landing_subtitle', this.landingSubtitle);
            });
        });
    }

    private generateID()  {
        const id = crypto.randomUUID();
        localStorage.setItem('instance_id', id);
        return id;
    }
}

export const settings = new GlobalSettings();

// identification
export const APP_VERSION : string =  __APP_VERSION__;
export const APP_NAME    : string = "Simple-Nutrition-Scanner";
export const APP_ID      : string = settings.instanceId;
export const DEV_CONTACT : string = "veteran_lively047@aleeas.com";
