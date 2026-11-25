export interface HelpHeading {
  depth: 2 | 3;
  text: string;
  id: string;
}

function headingText(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/[*_~]/g, "")
    .trim();
}

function slugifyHeading(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "section";
}

export function extractHelpHeadings(markdown: string): HelpHeading[] {
  const usedIds = new Map<string, number>();
  const headings: HelpHeading[] = [];
  let codeFence: { marker: "`" | "~"; length: number } | undefined;

  for (const line of markdown.split(/\r?\n/)) {
    if (codeFence) {
      const closingFence = /^\s{0,3}(`+|~+)\s*$/.exec(line)?.[1];
      if (
        closingFence?.[0] === codeFence.marker &&
        closingFence.length >= codeFence.length
      ) {
        codeFence = undefined;
      }
      continue;
    }

    const fence = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      codeFence = {
        marker: fence[0] as "`" | "~",
        length: fence.length,
      };
      continue;
    }

    const match = /^\s{0,3}(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const depth = match[1].length as HelpHeading["depth"];
    const text = headingText(match[2]);
    if (!text) continue;

    const baseId = slugifyHeading(text);
    const occurrence = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, occurrence + 1);
    headings.push({
      depth,
      text,
      id: occurrence === 0 ? baseId : `${baseId}-${occurrence + 1}`,
    });
  }

  return headings;
}
