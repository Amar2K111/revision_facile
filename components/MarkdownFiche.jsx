"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { normalizeLatexDelimiters } from "../lib/normalizeLatexDelimiters";

import "katex/dist/katex.min.css";

const articleBaseClass =
  "fiche-markdown rounded-2xl border border-white/80 bg-white/90 px-5 py-8 shadow-lg shadow-slate-200/50 sm:px-10 sm:py-10 print:shadow-none [&_.katex]:text-[1em]";

export const ficheMdComponents = {
  h1: (props) => (
    <h1
      className="mt-10 scroll-mt-20 font-[family-name:var(--font-geist-sans)] text-2xl font-bold tracking-tight text-slate-900 first:mt-0 print:text-xl"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-8 scroll-mt-20 border-b border-slate-200 pb-2 font-[family-name:var(--font-geist-sans)] text-xl font-semibold text-slate-900 print:text-lg"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="mt-6 text-lg font-semibold text-slate-800 print:text-base" {...props} />
  ),
  p: (props) => <p className="mt-3 text-[15px] leading-relaxed text-slate-800" {...props} />,
  ul: (props) => (
    <ul className="mt-3 list-inside list-disc space-y-1.5 pl-1 text-[15px] text-slate-800" {...props} />
  ),
  ol: (props) => (
    <ol className="mt-3 list-inside list-decimal space-y-1.5 pl-1 text-[15px] text-slate-800" {...props} />
  ),
  li: (props) => <li className="leading-relaxed [&>p]:mt-0" {...props} />,
  strong: (props) => <strong className="font-semibold text-slate-900" {...props} />,
  hr: () => <hr className="my-10 border-0 border-t-2 border-dashed border-indigo-200 print:my-8" />,
  blockquote: (props) => (
    <blockquote
      className="mt-4 border-l-4 border-amber-300 bg-amber-50/60 py-2 pl-4 text-slate-800 italic"
      {...props}
    />
  ),
  code: ({ className, children, ...props }) =>
    className ? (
      <code className={className} {...props}>
        {children}
      </code>
    ) : (
      <code
        className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800"
        {...props}
      >
        {children}
      </code>
    ),
  pre: (props) => (
    <pre
      className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800"
      {...props}
    />
  ),
};

/** Une section Markdown (une « page » logique). */
export function FicheMarkdownSection({ markdown, className = "" }) {
  const normalized = normalizeLatexDelimiters(markdown);
  return (
    <article className={`${articleBaseClass} print:border ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={ficheMdComponents}
      >
        {normalized}
      </ReactMarkdown>
    </article>
  );
}

export default function MarkdownFiche({ markdown }) {
  return <FicheMarkdownSection markdown={markdown} />;
}
