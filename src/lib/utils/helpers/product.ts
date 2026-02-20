// Helper for Nutri-Score colors
export const gradeColors = {
    a: 'text-green-600',
    b: 'text-green-400',
    c: 'text-yellow-400',
    d: 'text-orange-500',
    e: 'text-red-600',
    unknown: 'text-gray-300'
};

export const gradeBgColors = {
    a: 'bg-green-600',
    b: 'bg-green-400',
    c: 'bg-yellow-400',
    d: 'bg-orange-500',
    e: 'bg-red-600',
    unknown: 'bg-gray-300'
};

export type ScoreLevel = "excellent" | "good" | "mediocre" | "bad";

export function getScoreLevel(grade: string | undefined): ScoreLevel {
    switch (grade?.toLowerCase()) {
        case 'a': return "excellent";
        case 'b': return "good";
        case 'c': return "mediocre";
        case 'd':
        case 'e': return "bad";
        default: return "mediocre";
    }
}

export function getScoreLabel(grade: string | undefined): string {
    switch (grade?.toLowerCase()) {
        case 'a': return "Excellent";
        case 'b': return "Good";
        case 'c': return "Mediocre";
        case 'd': return "Bad";
        case 'e': return "Poor";
        default: return "Unknown";
    }
}

export function getScoreValue(grade: string | undefined): number {
    switch (grade?.toLowerCase()) {
        case 'a': return 90;
        case 'b': return 70;
        case 'c': return 50;
        case 'd': return 30;
        case 'e': return 10;
        default: return 0;
    }
}

export function getNutrientLevelLabel(level: string | undefined): string {
    switch (level) {
        case 'low': return "Low";
        case 'moderate': return "Moderate";
        case 'high': return "High";
        default: return "Unknown";
    }
}

export function getNutrientLevelColor(level: string | undefined): string {
    switch (level) {
        case 'low': return "text-green-600";
        case 'moderate': return "text-yellow-500";
        case 'high': return "text-red-600";
        default: return "text-gray-400";
    }
}

export function getNutrientLevelBg(level: string | undefined): string {
    switch (level) {
        case 'low': return "bg-green-600";
        case 'moderate': return "bg-yellow-500";
        case 'high': return "bg-red-600";
        default: return "bg-gray-400";
    }
}
