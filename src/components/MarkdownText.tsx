import { useMemo } from 'react';
import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true,
});

export function MarkdownText({ content, className = '' }: { content: string; className?: string }) {
  const html = useMemo(() => {
    return marked.parse(content || '') as string;
  }, [content]);

  return (
    <div
      className={`prose-datapad ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
