import rawAdditives from "$lib/data/additives-min.json" with { type: "json" };

export type AdditiveRisk = 0 | 1 | 2 | 3;

export type AdditiveInfo = {
    tag: string;
    name: string;
    risk: AdditiveRisk;
    code: string;
};

export type AdditiveImpact = {
    penalty: number;
    hasHazardous: boolean;
    risks: ReadonlyMap<string, AdditiveRisk>;
};

const RISK_CODES: Record<AdditiveRisk, string> = {
    0: "?",
    1: "RISK",
    2: "MODERATE",
    3: "HAZARD"
};

const RISK_PENALTY: Record<AdditiveRisk, number> = { 0: 0, 1: 8, 2: 20, 3: 45 };

const SAFE_RISK: AdditiveInfo = { tag: "", name: "", risk: 0, code: "?" };

const database = rawAdditives as unknown as Record<string, { r?: number; n?: string }>;

class AdditiveService {
    readonly #cache = new Map<string, AdditiveInfo>();

    /** Resolve an Open Food Facts additive tag such as `en:e322i`. */
    info(tag: string): AdditiveInfo {
        const cached = this.#cache.get(tag);
        if (cached) return cached;

        const entry = database[tag];
        const risk = normaliseRisk(entry?.r);
        const info: AdditiveInfo = {
            tag,
            name: entry?.n || prettyTag(tag),
            risk,
            code: RISK_CODES[risk]
        };

        this.#cache.set(tag, info);
        return info;
    }

    list(tags: string[] | undefined): AdditiveInfo[] {
        return (tags ?? []).map(tag => this.info(tag));
    }

    /** Aggregate the additive penalty for a whole product in a single pass. */
    impact(tags: string[] | undefined): AdditiveImpact {
        const risks = new Map<string, AdditiveRisk>();
        let penalty = 0;
        let hasHazardous = false;

        for (const tag of tags ?? []) {
            const { risk } = this.info(tag);
            penalty += RISK_PENALTY[risk];
            if (risk === 3) hasHazardous = true;
            if (!risks.has(tag)) risks.set(tag, risk);
        }

        return { penalty, hasHazardous, risks };
    }

    /** Risk of an already-resolved impact map, defaulting to unknown. */
    riskOf(impact: AdditiveImpact, tag: string): AdditiveRisk {
        return impact.risks.get(tag) ?? SAFE_RISK.risk;
    }
}

function normaliseRisk(value: number | undefined): AdditiveRisk {
    return value === 1 || value === 2 || value === 3 ? value : 0;
}

function prettyTag(tag: string) {
    return tag.replace(/^\w\w:/, "").replace(/-/g, " ").toUpperCase();
}

export const additives = new AdditiveService();
