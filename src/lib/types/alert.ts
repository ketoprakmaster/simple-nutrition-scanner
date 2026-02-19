export type AlertType = 'success' | 'error' | 'info' | 'warning';

export type Alert = {
    id: number;
    type: AlertType;
    message: string;
}
