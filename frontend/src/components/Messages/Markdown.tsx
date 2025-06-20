import { memo, useMemo } from "react";
import CodeBlock from "./CodeBlock";
import { CodeBlockProvider } from "@/providers/CodeBlockContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { preprocessLaTeX } from "@/utils/lateX";
import { langSubset } from "@/utils/languages";

type TCodeProps = {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
};

export const handleDoubleClick: React.MouseEventHandler<HTMLElement> = (
  event
) => {
  const range = document.createRange();
  range.selectNodeContents(event.target as Node);
  const selection = window.getSelection();
  if (!selection) {
    return;
  }
  selection.removeAllRanges();
  selection.addRange(range);
};

export const code: React.ElementType = memo(
  ({ className, children }: TCodeProps) => {
    const match = /language-(\w+)/.exec(className ?? "");
    const lang = match && match[1];
    const isMath = lang === "math";
    const isSingleLine =
      typeof children === "string" && children.split("\n").length === 1;

    if (isMath) {
      return <>{children}</>;
    } else if (isSingleLine) {
      return (
        <code onDoubleClick={handleDoubleClick} className={className}>
          {children}
        </code>
      );
    } else {
      return <CodeBlock lang={lang ?? "text"} codeChildren={children} />;
    }
  }
);
//
const Markdown = memo(({ content = "", isLatestMessage }: any) => {
  //TODO: kiểm tra lại logic parsing latex
  const LaTeXParsing = useSelector(
    (state: RootState) => state.settings.LaTeXParsing
  );
  // const LaTeXParsing = true;

  const isInitializing = content === "";

  const currentContent = useMemo(() => {
    if (isInitializing) {
      return "";
    }
    return LaTeXParsing ? preprocessLaTeX(content) : content;
  }, [content, LaTeXParsing, isInitializing]);

  const rehypePlugins = useMemo(
    () => [
      [rehypeKatex],
      [
        rehypeHighlight,
        {
          detect: true,
          ignoreMissing: true,
          subset: langSubset,
        },
      ],
    ],
    []
  );

  const remarkPlugins: any[] = [
    // supersub,
    remarkGfm,
    // remarkDirective,
    // artifactPlugin,
    //[remarkMath, { singleDollarTextMath: true }],
    //unicodeCitation,
  ];

  if (isInitializing) {
    return (
      <div className="absolute">
        <p className="relative">
          <span className={isLatestMessage ? "result-thinking" : ""} />
        </p>
      </div>
    );
  }

  return (
    <CodeBlockProvider>
      <ReactMarkdown
        /** @ts-ignore */
        remarkPlugins={remarkPlugins}
        /* @ts-ignore */
        rehypePlugins={rehypePlugins}
        components={
          {
            code,
            //   a,
            //   p,
            //   artifact: Artifact,
            //   citation: Citation,
            // "highlighted-text": HighlightedText,
            //   "composite-citation": CompositeCitation,
          } as {
            [nodeType: string]: React.ElementType;
          }
        }
      >
        {currentContent}
      </ReactMarkdown>
    </CodeBlockProvider>
  );
});

export default Markdown;
