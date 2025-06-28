import type { RefObject } from "react";

export type CodeBarProps = {
  lang: string;
  error?: boolean;
  plugin?: boolean;
  codeRef: RefObject<HTMLElement | null>;
};

export type HoverButtonType =
  | "copy"
  | "like"
  | "dislike"
  | "edit"
  | "regenerate"
  | "share";

export interface HoverButtonConfig {
  type: HoverButtonType;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  isVisible?: boolean;
}
