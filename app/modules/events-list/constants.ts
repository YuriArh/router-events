/**
 * Константы для drawer мобильного layout
 */
export const SNAP_POINTS = {
  MINIMAL: "210px",
  FULL: 1,
} as const;

export const BREAKPOINTS = {
  MOBILE: 768,
} as const;

export const MOBILE_BREAKPOINT =
  `(max-width: ${BREAKPOINTS.MOBILE}px)` as const;

export const DRAWER_HEIGHT = "calc(100vh-8rem)";

export type SnapPoint = typeof SNAP_POINTS.MINIMAL | typeof SNAP_POINTS.FULL;
