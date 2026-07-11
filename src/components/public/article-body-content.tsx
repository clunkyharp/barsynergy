'use client';

import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

function slugifyHeading(text: string): string {
  if (typeof text === 'string') {
    return text
      .toLowerCase()
      .replace(/[^а-яёa-z0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  return '';
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!node || typeof node !== 'object') return '';
  if (Array.isArray(node)) return node.map(extractText).join('');
  if ('props' in node) {
    const el = node as { props?: { children?: React.ReactNode } };
    if (el.props?.children) return extractText(el.props.children);
  }
  return '';
}

export function ArticleBodyContent({ markdown }: { markdown: string }) {
  const components: Partial<Components> = {
    h2: ({ children, ...props }) => {
      const text = extractText(children);
      const id = slugifyHeading(text);
      return <h2 id={id} {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }) => {
      const text = extractText(children);
      const id = slugifyHeading(text);
      return <h3 id={id} {...props}>{children}</h3>;
    },
    h4: ({ children, ...props }) => {
      const text = extractText(children);
      const id = slugifyHeading(text);
      return <h4 id={id} {...props}>{children}</h4>;
    },
    table: ({ children }) => (
      <div className="article-table-wrapper">
        <table>{children}</table>
      </div>
    ),
    img: ({ src, alt, ...props }) => (
      <figure className="article-figure">
        <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" {...props} />
        {alt ? <figcaption>{alt}</figcaption> : null}
      </figure>
    ),
    blockquote: ({ children }) => (
      <blockquote>{children}</blockquote>
    )
  };

  return (
    <div className="article-body">
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
