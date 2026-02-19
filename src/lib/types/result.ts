export type LookupResult =
    | { type: "rate_limited" }
    | { type: "blacklisted" }
    | { type: "not_found"; code: string }
    | { type: "found"; code: string; fromCache: boolean }
    | { type: "error"; message: string };
