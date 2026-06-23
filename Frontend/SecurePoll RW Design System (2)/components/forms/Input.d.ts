import * as React from "react";

/**
 * Labelled text field with hint, error, optional leading/trailing icons, and a
 * monospace mode for IDs, National IDs, and codes. Wraps a native <input>, so
 * any input attribute (type, value, onChange, placeholder…) passes through.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label rendered above the input. */
  label?: React.ReactNode;
  /** Helper text shown below when there is no error. */
  hint?: React.ReactNode;
  /** Error message — turns the field red and overrides the hint. */
  error?: React.ReactNode;
  /** Adds a required asterisk to the label. @default false */
  required?: boolean;
  /** Icon node rendered inside, on the left. */
  iconLeft?: React.ReactNode;
  /** Icon node rendered inside, on the right. */
  iconRight?: React.ReactNode;
  /** Monospace text — use for National IDs, voter IDs, hashes. @default false */
  mono?: boolean;
  /** @default "md" */
  size?: "md" | "lg";
}

export declare function Input(props: InputProps): React.JSX.Element;
