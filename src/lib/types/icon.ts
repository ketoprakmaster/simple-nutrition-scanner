import type { Component } from "svelte";

/**
 * A single icon from `@lucide/svelte`.
 *
 * In v1 the barrel's `Icon` export became a generic component that requires an
 * `icon` prop, so it can no longer describe the individual icon components this
 * app imports. Those accept only optional SVG props and are always rendered
 * without props here.
 */
export type IconComponent = Component<Record<string, never>>;
