class GlobalSettings {
    appName = $state(localStorage.getItem('app_name') || 'Leeka');
    showNutriscoreOnCards = $state(localStorage.getItem('show_nutriscore') !== 'false');
    landingTitle = $state(localStorage.getItem('landing_title') || 'Hello!')
    landingSubtitle = $state(localStorage.getItem('landing_subtitle') || "Ready to see what's inside your food today?")
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
