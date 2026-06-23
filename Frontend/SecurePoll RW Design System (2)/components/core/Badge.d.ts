import * as React from "react";

/**
 * Compact status / category label. Five semantic tones map to the system's
 * verification language (green = approved, amber = review, red = rejected,
 * blue = info, neutral = default) across soft, solid, and outline styles.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic color. @default "neutral" */
  tone?: "neutral" | "green" | "blue" | "amber" | "red";
  /** Fill style. @default "soft" */
  variant?: "soft" | "solid" | "outline";
  /** @default "md" */
  size?: "sm" | "md";
  /** Show a leading status dot. @default false */
  dot?: boolean;
  children?: React.ReactNode;
}

export declare function Badge(props: BadgeProps): React.JSX.Element;
