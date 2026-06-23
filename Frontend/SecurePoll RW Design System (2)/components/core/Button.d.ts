import * as React from "react";

/**
 * Primary action control for SecurePoll RW. Solid electoral-green primary,
 * outlined secondary, quiet ghost, and a danger variant for destructive /
 * REJECTED-style actions. Sizes scale from dense admin tables (sm) up to
 * kiosk touch targets (xl).
 *
 * @startingPoint section="Core" subtitle="Buttons — primary, secondary, ghost, danger" viewport="700x220"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "primary" */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Control height. Use "xl" for polling-station kiosk touch targets. @default "md" */
  size?: "sm" | "md" | "lg" | "xl";
  /** Icon element rendered before the label (e.g. a Lucide <i> or <svg>). */
  iconLeft?: React.ReactNode;
  /** Icon element rendered after the label. */
  iconRight?: React.ReactNode;
  /** Shows a spinner and disables the button. @default false */
  loading?: boolean;
  /** Stretch to fill the container width. @default false */
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export declare function Button(props: ButtonProps): React.JSX.Element;
