import copy from "copy-to-clipboard";
import React, { useRef, useState } from "react";
import type { CodeBarProps } from "@/common/types";
import Clipboard from "@/assets/clipboard.svg";
import CheckMark from "@/assets/check-mark.svg";
import { cn } from "@/lib/utils";

type CodeBlockProps = Pick<CodeBarProps, "lang" | "error"> & {
  codeChildren: React.ReactNode;
  classProp?: string;
};

const CodeBar: React.FC<
  Omit<CodeBarProps, "codeRef"> & {
    codeRef: React.RefObject<HTMLElement | null>;
  }
> = React.memo(({ lang, error, codeRef }) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <div className="relative flex items-center justify-between bg-code-block-background px-4 py-1.5 pt-4 font-sans text-xs text-gray-200">
      <span className="lowercase">{lang}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="ml-auto flex items-center gap-1.5"
          onClick={async () => {
            const codeString = codeRef.current?.textContent;
            if (codeString) {
              setIsCopied(true);
              copy(codeString, { format: "text/plain" });
              setTimeout(() => setIsCopied(false), 2000);
            }
          }}
        >
          {isCopied ? (
            <img src={CheckMark} alt="Check mark" width={16} height={16} />
          ) : (
            <img src={Clipboard} alt="Clipboard" width={16} height={16} />
          )}
          {isCopied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
});

const CodeBlock: React.FC<CodeBlockProps> = ({
  lang,
  codeChildren,
  classProp = "",
  error,
}) => {
  const codeRef = useRef<HTMLElement | null>(null);

  return (
    <pre className={cn("overflow-visible!", classProp)}>
      <div className="relative contain-inline-size my-4 overflow-hidden rounded-md bg-code-block-background text-sm text-white/80">
        <div className="not-prose">
          <CodeBar lang={lang} error={error} codeRef={codeRef} />
        </div>
        <div className="overflow-auto" dir="ltr">
          <code
            ref={codeRef}
            className={cn(
              "hljs",
              `language-${lang}`,
              "!whitespace-pre",
              error && "!whitespace-pre-wrap"
            )}
          >
            {codeChildren}
          </code>
        </div>
      </div>
    </pre>
  );
};

export default CodeBlock;
