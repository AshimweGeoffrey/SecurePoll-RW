import * as React from "react";

interface BreakdownRow {
  label: string;
  value: number | string;
}

/**
 * The signature explainable-AI result panel. Renders a verification decision
 * (APPROVED / MANUAL REVIEW / REJECTED) with a color-coded header, the fused
 * confidence, a per-signal breakdown (face, fingerprint, liveness…), a
 * plain-language explanation, and any fraud flags — mirroring the AI Service's
 * decision payload so officers always see *why*.
 *
 * @startingPoint section="Status" subtitle="Explainable AI verification result" viewport="520x560"
 */
export interface DecisionPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Force a verdict. Omit to derive it from confidence + threshold. */
  decision?: "approved" | "review" | "rejected";
  /** Fused confidence 0–1. Drives the header %, the meter, and the auto-verdict. */
  confidence?: number;
  /** Auto-approve threshold. @default 0.8 */
  threshold?: number;
  /** Voter name shown under the verdict. */
  voterName?: string;
  /** Per-signal scores — an object ({face_score: 0.94, liveness: "LIVE"}) or rows. */
  breakdown?: Record<string, number | string> | BreakdownRow[];
  /** One-line natural-language reason for the decision. */
  explanation?: React.ReactNode;
  /** Fraud / anomaly flags rendered as chips. */
  flags?: string[];
  /** Show the "officer decision required" footer. */
  reviewRequired?: boolean;
}

export declare function DecisionPanel(props: DecisionPanelProps): React.JSX.Element;
