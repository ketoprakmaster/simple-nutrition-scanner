class ThemeController {
    theme = $state<'light' | 'dark'>('light');

    constructor() {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;

            if (stored) {
                this.theme = stored;
            } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.theme = prefersDark ? 'dark' : 'light';
            }

            this.apply();
        }

        // Reactively sync changes
        $effect.root(() => {
            $effect(() => {
                this.apply();
            });
        });
    }

    get isDark() {
        return this.theme === 'dark';
    }

    toggle() {
        this.theme = this.isDark ? 'light' : 'dark';
    }

    set(theme: 'light' | 'dark') {
        this.theme = theme;
    }

    private apply() {
        if (typeof document === 'undefined') return;

        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
    }
}

export const theme = new ThemeController();
