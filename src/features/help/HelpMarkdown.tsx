import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { extractHelpHeadings } from "./markdown-headings";

function isHelpImage(src: string): boolean {
  if (!src.startsWith("/help/") || src.includes("\\")) return false;

  try {
    const pathname = decodeURIComponent(src.split(/[?#]/, 1)[0]);
    return !pathname.split("/").some((segment) => segment === "." || segment === "..");
  } catch {
    return false;
  }
}

export function HelpMarkdown({ source }: { source: string }) {
  const headings = extractHelpHeadings(source);
  let headingIndex = 0;

  const getNextHeading = () => headings[headingIndex++];

  return (
    <div className="help-markdown min-w-0 break-words text-base leading-7 text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          h1: () => null,
          h2: ({ children }) => {
            const heading = getNextHeading();
            return (
              <h2
                id={heading?.id}
                className="mb-4 mt-10 scroll-mt-24 text-2xl font-semibold tracking-tight text-foreground first:mt-0"
              >
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const heading = getNextHeading();
            return (
              <h3
                id={heading?.id}
                className="mb-3 mt-8 scroll-mt-24 text-xl font-semibold tracking-tight text-foreground"
              >
                {children}
              </h3>
            );
          },
          p: ({ children }) => <p className="my-5">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-5 list-disc space-y-2 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-5 list-decimal space-y-2 pl-6">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          a: ({ href = "", children }) => {
            const isInternalPath =
              href.startsWith("/") &&
              !href.startsWith("//") &&
              !href.startsWith("/\\");
            if (isInternalPath || href.startsWith("#")) {
              return (
                <Link
                  href={href}
                  className="font-medium text-primary underline underline-offset-4"
                >
                  {children}
                </Link>
              );
            }

            if (/^https?:\/\//i.test(href)) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  {children}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              );
            }

            if (/^(mailto|tel):/i.test(href)) {
              return (
                <a
                  href={href}
                  className="font-medium text-primary underline underline-offset-4"
                >
                  {children}
                </a>
              );
            }

            return <>{children}</>;
          },
          img: ({ src = "", alt = "" }) =>
            isHelpImage(src) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt}
                loading="lazy"
                className="my-6 h-auto max-w-full rounded-xl border border-border"
              />
            ) : null,
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-primary/40 pl-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-max border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border bg-muted px-4 py-3 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border px-4 py-3 align-top">
              {children}
            </td>
          ),
          code: ({ children }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-6 overflow-x-auto rounded-xl bg-muted p-4 text-sm">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-8 border-border" />,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
