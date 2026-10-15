import type { Rating } from "$lib/models/productAnalysis";

/**
 * Tailwind only compiles class names it can see as complete literals, so the
 * score palette lives here as whole strings instead of being interpolated from
 * a colour token. Everything is written out in full and statically analysable.
 *
 * `ring` colours the radial-progress arc, `dot`/`text` colour the small legend
 * dot and the rating caption. All three use the 500/600 weights so they stay
 * legible on both the light and the dark daisyUI theme.
 */
export type RatingClasses = {
    ring: string;
    dot: string;
    text: string;
};

const PALETTE: Record<Rating["grade"], RatingClasses> = {
    A: { ring: "text-green-600", dot: "bg-green-600", text: "text-green-600" },
    B: { ring: "text-green-500", dot: "bg-green-500", text: "text-green-500" },
    C: { ring: "text-yellow-500", dot: "bg-yellow-500", text: "text-yellow-500" },
    D: { ring: "text-orange-500", dot: "bg-orange-500", text: "text-orange-500" },
    E: { ring: "text-red-600", dot: "bg-red-600", text: "text-red-600" },
    "?": { ring: "text-gray-400", dot: "bg-gray-400", text: "text-gray-400" }
};

export function ratingClasses(rating: Rating): RatingClasses {
    return PALETTE[rating.grade] ?? PALETTE["?"];
}
