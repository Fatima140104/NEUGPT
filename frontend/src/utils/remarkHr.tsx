const SECTION_KEYWORDS = [
  "result",
  "summary",
  "conclusion",
  "tips",
  "note",
  "highlights",
  "example",
];

function isSectionParagraph(node: any) {
  if (node.type !== "paragraph" || !node.children || !node.children[0])
    return false;
  const text = node.children[0].value?.toLowerCase?.() || "";
  return SECTION_KEYWORDS.some((keyword) => text.startsWith(keyword));
}

export default function remarkHr() {
  return (tree: any) => {
    let i = 0;
    while (i < tree.children.length - 1) {
      const current = tree.children[i];
      const next = tree.children[i + 1];

      // Insert <hr> before major headings (e.g., ### or higher)
      if (
        (current.type === "heading" || isSectionParagraph(current)) &&
        next.type === "heading" &&
        next.depth <= 3
      ) {
        tree.children.splice(i + 1, 0, { type: "thematicBreak" });
        i++;
      }
      // Insert <hr> after code/table if next is a major heading
      else if (
        (current.type === "code" || current.type === "table") &&
        next.type === "heading" &&
        next.depth <= 3
      ) {
        tree.children.splice(i + 1, 0, { type: "thematicBreak" });
        i++;
      }
      // Insert <hr> after code/table if next is a "section" paragraph
      else if (
        (current.type === "code" || current.type === "table") &&
        isSectionParagraph(next)
      ) {
        tree.children.splice(i + 1, 0, { type: "thematicBreak" });
        i++;
      }
      // Insert <hr> after a list if next is a major heading
      else if (
        current.type === "list" &&
        next.type === "heading" &&
        next.depth <= 3
      ) {
        tree.children.splice(i + 1, 0, { type: "thematicBreak" });
        i++;
      }
      i++;
    }
  };
}
