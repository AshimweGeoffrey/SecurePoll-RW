import * as React from "react";

interface SelectOption {
  value: string;
  label: string;
}

/**
 * Styled wrapper around a native <select> with a custom chevron, matching the
 * Input field's label/hint/error chrome. Pass options as an array or provide
 * <option> children directly.
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Field label. */
  label?: React.ReactNode;
  /** Helper text shown when there is no error. */
  hint?: React.ReactNode;
  /** Error message — turns the control red and overrides the hint. */
  error?: React.ReactNode;
  /** Adds a required asterisk. @default false */
  required?: boolean;
  /** @default "md" */
  size?: "md" | "lg";
  /** Options as strings or {value,label}. Omit and pass <option> children instead. */
  options?: Array<string | SelectOption>;
  /** Disabled, hidden first option used as a prompt. */
  placeholder?: string;
}

export declare function Select(props: SelectProps): React.JSX.Element;
