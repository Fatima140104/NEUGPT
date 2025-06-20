import type { RefObject } from "react";

export type CodeBarProps = {
  lang: string;
  error?: boolean;
  plugin?: boolean;
  codeRef: RefObject<HTMLElement | null>;
};
