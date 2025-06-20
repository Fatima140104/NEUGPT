// Pre-compile all regular expressions for better performance
const MHCHEM_CE_REGEX = /\$\\ce\{/g;
const MHCHEM_PU_REGEX = /\$\\pu\{/g;
const MHCHEM_CE_ESCAPED_REGEX = /\$\\\\ce\{[^}]*\}\$/g;
const MHCHEM_PU_ESCAPED_REGEX = /\$\\\\pu\{[^}]*\}\$/g;
const CURRENCY_REGEX =
  /(?<![\\$])\$(?!\$)(?=\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?(?:\s|$|[^a-zA-Z\d]))/g;
const SINGLE_DOLLAR_REGEX =
  /(?<!\\)\$(?!\$)((?:[^$\n]|\\[$])+?)(?<!\\)\$(?!\$)/g;

/**
 * Escapes mhchem package notation in LaTeX by converting single dollar delimiters to double dollars
 * and escaping backslashes in mhchem commands.
 *
 * @param text - The input text containing potential mhchem notation
 * @returns The processed text with properly escaped mhchem notation
 */
function escapeMhchem(text: string): string {
  // First escape the backslashes in mhchem commands
  let result = text.replace(MHCHEM_CE_REGEX, "$\\\\ce{");
  result = result.replace(MHCHEM_PU_REGEX, "$\\\\pu{");

  // Then convert single dollar mhchem to double dollar
  result = result.replace(MHCHEM_CE_ESCAPED_REGEX, (match) => `$${match}$`);
  result = result.replace(MHCHEM_PU_ESCAPED_REGEX, (match) => `$${match}$`);

  return result;
}

/**
 * Efficiently finds all code block regions in the content
 * @param content The content to analyze
 * @returns Array of code block regions [start, end]
 */
function findCodeBlockRegions(content: string): Array<[number, number]> {
  const regions: Array<[number, number]> = [];
  let inlineStart = -1;
  let multilineStart = -1;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    // Check for multiline code blocks
    if (
      char === "`" &&
      i + 2 < content.length &&
      content[i + 1] === "`" &&
      content[i + 2] === "`"
    ) {
      if (multilineStart === -1) {
        multilineStart = i;
        i += 2; // Skip the next two backticks
      } else {
        regions.push([multilineStart, i + 2]);
        multilineStart = -1;
        i += 2;
      }
    }
    // Check for inline code blocks (only if not in multiline)
    else if (char === "`" && multilineStart === -1) {
      if (inlineStart === -1) {
        inlineStart = i;
      } else {
        regions.push([inlineStart, i]);
        inlineStart = -1;
      }
    }
  }

  return regions;
}

/**
 * Checks if a position is inside any code block region using binary search
 * @param position The position to check
 * @param codeRegions Array of code block regions
 * @returns True if position is inside a code block
 */
function isInCodeBlock(
  position: number,
  codeRegions: Array<[number, number]>
): boolean {
  let left = 0;
  let right = codeRegions.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const [start, end] = codeRegions[mid];

    if (position >= start && position <= end) {
      return true;
    } else if (position < start) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return false;
}

/**
 * Preprocesses LaTeX content by escaping currency indicators and converting single dollar math delimiters.
 * Optimized for high-frequency execution.
 * @param content The input string containing LaTeX expressions.
 * @returns The processed string with escaped currency indicators and converted math delimiters.
 */
export function preprocessLaTeX(content: string): string {
  // Find all code block regions to avoid processing math inside them
  const codeRegions = findCodeBlockRegions(content);

  // This regex looks for either \[...\] or \(...\)
  const unifiedRegex = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g;

  const replacer = (
    match: string,
    bracketContent: string, // Captured content from \[...\]
    parenContent: string, // Captured content from \(...\)
    offset: number
  ) => {
    // If the match is inside a code block, leave it untouched
    if (isInCodeBlock(offset, codeRegions)) {
      return match;
    }

    // If bracketContent is captured, it's display math
    if (bracketContent !== undefined) {
      return `$$${bracketContent}$$`;
    }

    // If parenContent is captured, it's inline math
    if (parenContent !== undefined) {
      return `$${parenContent}$`;
    }

    // Fallback, should not be reached
    return match;
  };

  return content.replace(unifiedRegex, replacer);
}
