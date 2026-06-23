import * as React from "react";

/**
 * Horizontal confidence gauge (0–1) with a threshold marker. The fill color
 * follows the verification bands — green at/above threshold, amber 0.60–0.79,
 * red below 0.60 — so a score reads as APPROVE / REVIEW / REJECT at a glance.
 *
 * @startingPoint section="Status" subtitle="AI confidence gauge with threshold" viewport="700x150"
 */
export interface ConfidenceMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Score in the range 0–1. */
  value: number;
  /** Auto-approve threshold, drawn as a tick. @default 0.8 */
  threshold?: number;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Show the numeric value. @default true */
  showValue?: boolean;
  /** Show a 0 / 0.5 / 1 scale below the track. @default false */
  showScale?: boolean;
  /** Overline label. @default "Confidence" */
  label?: React.ReactNode;
}

export declare function ConfidenceMeter(props: ConfidenceMeterProps): React.JSX.Element;
