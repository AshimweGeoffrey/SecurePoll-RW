import * as React from "react";

/**
 * Surface container with optional header (title + subtitle + trailing slot)
 * and an optional top accent bar in a semantic color. The base building block
 * for dashboards, panels, and list items.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shadow depth. @default "raised" */
  elevation?: "flat" | "raised" | "floating";
  /** Adds hover lift + pointer cursor. @default false */
  interactive?: boolean;
  /** Top accent bar — a semantic key (green/blue/amber/red) or any CSS color. */
  accent?: "green" | "blue" | "amber" | "red" | string;
  /** Header title. */
  title?: React.ReactNode;
  /** Header subtitle, shown under the title. */
  subtitle?: React.ReactNode;
  /** Element pinned to the right of the header (e.g. a Badge or Button). */
  headerEnd?: React.ReactNode;
  /** Extra class on the inner body. */
  bodyClassName?: string;
  children?: React.ReactNode;
}

export declare function Card(props: CardProps): React.JSX.Element;
