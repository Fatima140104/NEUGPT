import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  maxHeight?: number | string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, autoResize = false, maxHeight, style, onInput, ...props },
    ref
  ) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const setRef = (el: HTMLTextAreaElement) => {
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
      internalRef.current = el;
    };
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (autoResize && internalRef.current) {
        internalRef.current.style.height = "auto";
        internalRef.current.style.height =
          internalRef.current.scrollHeight + "px";
      }
      if (onInput) onInput(e);
    };
    React.useEffect(() => {
      if (autoResize && internalRef.current) {
        internalRef.current.style.height = "auto";
        internalRef.current.style.height =
          internalRef.current.scrollHeight + "px";
      }
    }, [autoResize, props.value]);
    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={setRef}
        style={{
          minHeight: 40,
          maxHeight: maxHeight || 208,
          overflowY: "auto",
          ...style,
        }}
        onInput={handleInput}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
