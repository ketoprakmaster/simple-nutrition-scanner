# AGENTS.md - Simple Nutrition Scanner

## Project Overview
A Yuka-like Progressive Web App (PWA) built with **Svelte 5** and **SvelteKit** that scans food barcodes and displays nutrition information from the Open Food Facts API.

### Tech Stack
- **Framework:** Svelte 5 (with runes) + SvelteKit
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + DaisyUI v5
- **Barcode Scanning:** Quagga2 (`@ericblade/quagga2`)
- **Database:** IndexedDB via Dexie.js
- **Package Manager:** npm or bun

---

## Build/Lint/Test Commands

### Development
```bash
npm run dev          # Start Vite dev server at http://localhost:5173
npm run build        # Build static site to build/ directory
npm run preview      # Preview production build locally
```

### Type Checking
```bash
npm run check              # Run svelte-check for type/syntax validation
npm run check:watch        # Watch mode for type checking
```

### PWA Assets
```bash
npm run generate-pwa-assets   # Generate PWA icons and manifest
```

### Tests (Vitest)
```bash
bun run test          # Everything, including the live API checks
bun run test:watch    # Watch mode
bun run test:live     # Only the live Open Food Facts checks; network required
```

Without a network, skip the live suite:

```bash
bunx vitest run --exclude '**/*.live.test.ts'
```

### Notes
- **Vitest** is the test runner, driven by the project's `bun`. It is not
  installed as a global; use `bun run test` or `bunx vitest`.
- **No ESLint/Prettier** - No linting or formatting scripts available
- Type safety is enforced via `svelte-check` and strict TypeScript
- `npm run check` reports one pre-existing error in `src/components/bottom-nav.svelte`
  (`resolve(item.path)` with a widened `string`); unrelated to the test setup

### Held-back major upgrades

Dependencies are on the latest **within-major** versions. These majors are
deliberately not adopted, because they are inseparable from a SvelteKit 3
migration rather than a version bump:

| Package | Current | Latest | Blocked by |
|---|---|---|---|
| `typescript` | 5.9.3 | 7.0.2 | No current SvelteKit or `svelte-check` release accepts TS 7 |
| `vite` | 7.3.7 | 8.3.4 | Required only for the SvelteKit 3 tier |
| `@sveltejs/kit` | 2.70.3 | 3.1.0 | See migration notes below |
| `@sveltejs/vite-plugin-svelte` | 6.2.4 | 7.3.1 | v7 requires Vite 8 |
| `@sveltejs/adapter-static` / `adapter-auto` | 3.0.10 / 7.0.1 | 4.0.0 / 8.0.0 | Require SvelteKit 3 |

Note that `svelte-check` and `@sveltejs/kit` both cap their TypeScript peer
range at `^6.0.0`, and TypeScript 6 is still only a beta — so even the
SvelteKit 3 tier cannot use stable TypeScript 7 today.

**Migrating to SvelteKit 3 is a code migration, not a bump.** Per the
[official guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3) it requires:

1. Deleting `svelte.config.js` — configuration moves into the `sveltekit()`
   Vite plugin, including the `$components` alias.
2. The `$lib` alias is no longer generated; it becomes a `#lib` subpath import
   declared in `package.json` `imports`. This renames `$lib` → `#lib` **and
   requires explicit `.js` extensions**, touching nearly every file.
3. `$app/environment` → `$app/env`; `$app/stores` and `$service-worker` removed.
4. Minimum Node 22.17, Svelte 5.57.1, Vite 8.0.12, TypeScript 6.
5. Then `npx sv migrate sveltekit-3` for the remainder.

`vitest.config.ts` and the `$lib` imports inside `tests/` must be updated as
part of step 2.

---

## Code Style Guidelines

### Svelte 5 Runes (Required)
Always use Svelte 5 rune syntax, never legacy Svelte 4 patterns:

```typescript
// CORRECT - Using runes
let count = $state(0);
const doubled = $derived(count * 2);
let { name, age = 18 }: Props = $props();

// WRONG - Legacy syntax
let count = 0;
export let name;
```

### File Naming Conventions
| Pattern | Example | Purpose |
|---------|---------|---------|
| `*.svelte.ts` | `scanner.svelte.ts` | UI state controllers (singleton exports) |
| `*.ts` | `productService.ts` | Business logic / services |
| `PascalCase.svelte` | `FoodCardList.svelte` | Components |
| `camelCase.svelte.ts` | `scanner.svelte.ts` | Controllers |

### Type Definitions
- Define shared types in `src/lib/types/`
- Use discriminated unions for result types:
```typescript
// src/lib/types/result.ts
export type LookupResult =
    | { type: "rate_limited" }
    | { type: "not_found"; code: string }
    | { type: "found"; code: string; fromCache: boolean }
    | { type: "error"; message: string };
```

### Imports
```typescript
// Absolute paths using $lib alias
import { ProductService } from "$lib/services/productService";
import type { Product } from "$lib/types/product";

// Component alias from svelte.config.js
import Alert from "$components/alert.svelte";

// Type imports always
import type { Alert, AlertType } from '$lib/types/alert';

// JSON imports require type annotation
import additivesMap from '$lib/data/additives-min.json' with { type: "json" };
```

### Service/Controller Pattern
```
src/lib/
├── ui/           # State controllers (singleton exported)
│   ├── scanner.svelte.ts   # Export: export const Scanner = new ScannerController()
│   └── theme.svelte.ts     # Export: export const theme = new ThemeController()
├── services/     # Business logic (class-based, injected dependencies)
│   ├── productService.ts   # ProductService class
│   └── scannerEngine.ts    # ScannerEngine class
├── types/        # Shared TypeScript types
└── models/       # Data transformation/analysis classes
```

### Error Handling
```typescript
// Prefer type-safe error handling with result types
async lookup(code: string): Promise<LookupResult> {
    try {
        const data = await fetchProduct(code);
        return { type: "found", data };
    } catch (err) {
        return {
            type: "error",
            message: err instanceof Error ? err.message : "Unknown error"
        };
    }
}
```

### Class-Based Controllers (UI State)
```typescript
// src/lib/ui/scanner.svelte.ts
class ScannerController {
    isActive = $state(false);
    #privateField = $state(true);

    async start(target: HTMLElement) { /* ... */ }
}

export const Scanner = new ScannerController(); // Singleton export
```

### Svelte Component Props
```typescript
<script lang="ts">
    type Props = {
        items: Product[];
        toggleDelete?: boolean;
        messageEmpty?: string;
    };

    let {
        items,
        toggleDelete = false,
        messageEmpty = "Nothing Here..."
    }: Props = $props();
</script>
```

### CSS/Styling
- Use Tailwind utility classes exclusively in templates
- DaisyUI components for common UI patterns
- Custom CSS in `<style>` blocks only when necessary
- No inline styles except dynamic Tailwind classes

### General Guidelines
- **No comments** unless explaining complex business logic
- Use **4-space indentation** (matches existing code)
- Prefer **const** over **let** for variables
- Use **private** fields (`#field`) for class internals
- Console logging format: `logger.log("[scanner] message")` (using `$lib/ui/logger.svelte`)
- Component event handlers: `onclick`, `onchange`, `onkeydown`

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/ui/scanner.svelte.ts` | Scanning lifecycle controller |
| `src/lib/services/productService.ts` | API lookup orchestration |
| `src/lib/services/productRepository.ts` | Dexie persistence layer |
| `src/lib/services/api/productParse.ts` | Open Food Facts response → `Product` parsing |
| `src/lib/services/additiveService.ts` | Additive risk lookup and penalty aggregation |
| `src/lib/models/productAnalysis.ts` | Nutrition scoring logic |
| `src/lib/config/database.ts` | IndexedDB schema |
| `src/service-worker.ts` | PWA offline caching |
| `svelte.config.js` | SvelteKit + path aliases |
| `vitest.config.ts` | Test runner / SvelteKit alias resolution |

---

## Testing Notes
Vitest is configured. Four suites live in `tests/`:

| File | Covers |
|------|--------|
| `tests/productParse.test.ts` | Open Food Facts envelope parsing, using real captured payloads |
| `tests/productAnalysis.test.ts` | Scoring, ratings, nutrient rows, calories, additives |
| `tests/productService.test.ts` | Ingestion orchestration with an injected fetch and store |
| `tests/apiIngestion.live.test.ts` | Live Open Food Facts calls; needs network access |

Conventions to follow when adding tests:
1. Prefer real captured API payloads over invented ones; refresh them with
   `tests/capture-fixtures.ps1` (writes into `tests/fixtures/`).
2. Inject dependencies (`fetchImpl`, `repo`, `limiter`) instead of reaching for
   the network, IndexedDB, or module-level shared state.
3. Pass `{ useCustomScore: "app" | "nutriscore" }` to `ProductAnalysis` rather
   than mutating global settings, so tests stay order-independent.
4. Keep live tests in a `*.live.test.ts` file so they can be excluded offline.
