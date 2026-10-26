import * as React from "react";
import { ARTICLE_ICON_MAP } from "@/lib/article-icons";
import { cn } from "@/lib/utils";

const INLINE_PATTERN =
  /:icon\[([a-z0-9-]+)\]|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

function safeHref(raw: string) {
  const href = raw.trim();
  return /^(https?:\/\/|mailto:|\/|#)/i.test(href) ? href : "#";
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = new RegExp(INLINE_PATTERN.source, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    const key = `${keyPrefix}-${index}`;

    if (match[1]) {
      const Icon = ARTICLE_ICON_MAP[match[1]];
      nodes.push(
        Icon ? (
          <Icon
            key={key}
            aria-hidden="true"
            className="mr-1 inline h-[1.15em] w-[1.15em] align-[-0.15em] text-forest-700"
          />
        ) : (
          match[0]
        )
      );
    } else if (match[2] && match[3]) {
      const href = safeHref(match[3]);
      const external = /^https?:\/\//i.test(href);
      nodes.push(
        <a
          key={key}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="font-semibold text-forest-700 underline decoration-forest-300 underline-offset-2 hover:text-forest-900"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      nodes.push(
        <strong key={key} className="font-bold text-forest-950">
          {renderInline(match[4], `${key}-bold`)}
        </strong>
      );
    } else if (match[5]) {
      nodes.push(
        <em key={key} className="italic">
          {renderInline(match[5], `${key}-italic`)}
        </em>
      );
    }

    lastIndex = match.index + match[0].length;
    index += 1;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function isList(block: string, ordered: boolean) {
  const pattern = ordered ? /^\d+[.)]\s+/ : /^[-*]\s+/;
  return block.split("\n").every((line) => pattern.test(line));
}

/**
 * Renderer isi berita yang dipakai bersama oleh pratinjau admin dan halaman
 * publik. Mendukung paragraf, **tebal**, *miring*, tautan, sub-judul, daftar,
 * kutipan, garis pemisah, dan token ikon `:icon[nama]`.
 */
export function ArticleContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const normalized = (content ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .flatMap((line) => (/^#{2,3}\s+/.test(line) ? ["", line, ""] : [line]))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!normalized) return null;

  const blocks = normalized.split(/\n{2,}/).filter((block) => block.trim());

  return (
    <div className={cn("flex flex-col gap-4 text-[15px] leading-relaxed text-stone-700", className)}>
      {blocks.map((raw, blockIndex) => {
        const block = raw.trim();
        const key = `block-${blockIndex}`;
        const lines = block.split("\n");

        if (/^(-{3,}|\*{3,}|_{3,})$/.test(block)) {
          return <hr key={key} className="my-2 border-forest-100" />;
        }

        if (lines.length === 1) {
          const heading = block.match(/^(#{2,3})\s+(.+)$/);
          if (heading) {
            const text = renderInline(heading[2], `${key}-heading`);
            return heading[1].length === 2 ? (
              <h2 key={key} className="text-xl font-extrabold tracking-tight text-forest-950">
                {text}
              </h2>
            ) : (
              <h3 key={key} className="text-lg font-extrabold tracking-tight text-forest-950">
                {text}
              </h3>
            );
          }
        }

        if (block.startsWith(">")) {
          const quote = lines
            .map((line) => line.replace(/^>\s?/, ""))
            .join("\n")
            .trim();
          return (
            <blockquote
              key={key}
              className="rounded-r-lg border-l-4 border-gold-400 bg-forest-50/70 px-4 py-3 text-stone-700"
            >
              <p className="whitespace-pre-line">{renderInline(quote, `${key}-quote`)}</p>
            </blockquote>
          );
        }

        if (isList(block, true)) {
          return (
            <ol key={key} className="flex list-decimal flex-col gap-1.5 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={`${key}-li-${lineIndex}`} className="pl-1">
                  {renderInline(line.replace(/^\d+[.)]\s+/, ""), `${key}-li-${lineIndex}`)}
                </li>
              ))}
            </ol>
          );
        }

        if (isList(block, false)) {
          return (
            <ul key={key} className="flex list-disc flex-col gap-1.5 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={`${key}-li-${lineIndex}`} className="pl-1">
                  {renderInline(line.replace(/^[-*]\s+/, ""), `${key}-li-${lineIndex}`)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={key} className="whitespace-pre-line">
            {renderInline(block, key)}
          </p>
        );
      })}
    </div>
  );
}
