import type { Alert, AlertType} from '$lib/types/alert';

class AlertState {
    private _alerts = $state<Alert[]>([]);
    private _nextId = 0;

    get items() {
        return this._alerts;
    }

    show(message: string, type: AlertType = 'info', duration = 3000) {
        const existing = this._alerts.find(
            a => a.message === message && a.type === type
        );

        if (existing) {
            const cooldown = 1000;

            if (existing.date + cooldown < Date.now()) {
                this.resetTimer(existing, duration);
                this._alerts = [...this._alerts]; // needed for svelte reactivity
            }

            return;
        }

        const id = ++this._nextId;

        const alert: Alert = {
            id, type, message, date: Date.now()
        };

        this._alerts = [...this._alerts, alert];

        this.resetTimer(alert, duration);
    }

    dismiss(id: number) {
        this._alerts = this._alerts.filter(a => a.id !== id);
    }

    private resetTimer(alert: Alert, duration: number) {
        if (alert.timeoutId) {
            clearTimeout(alert.timeoutId);
        }

        alert.timeoutId = setTimeout(() => {
            this.dismiss(alert.id);
        }, duration);

        alert.date = Date.now();
    }
}

export const ui = new AlertState();
