import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import type { TocHeading } from '../types/doc';

interface TableOfContentsProps {
  content: string;
  readTime?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  content,
  readTime = '4 min read',
}) => {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const foundHeadings: TocHeading[] = [];

    const headingNodes = tempDiv.querySelectorAll('h2, h3');
    headingNodes.forEach((node, idx) => {
      const text = node.textContent?.trim() || '';
      if (text) {
        const id =
          node.id ||
          text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') ||
          `section-${idx}`;
        const level = node.tagName.toLowerCase() === 'h2' ? 2 : 3;
        foundHeadings.push({ id, text, level });
      }
    });

    setHeadings(foundHeadings);
    if (foundHeadings.length > 0) {
      setActiveId(foundHeadings[0].id);
    }
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map((h) => document.getElementById(h.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside className="hidden xl:block w-56 shrink-0 py-10 px-4 sticky top-12 h-[calc(100vh-3rem)] overflow-y-auto select-none">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-3 pl-2">
        On This Page
      </div>

      {headings.length === 0 ? (
        <p className="text-xs text-neutral-400 italic pl-2">No sections</p>
      ) : (
        <nav className="space-y-0.5">
          {headings.map((h) => {
            const isActive = activeId === h.id;
            return (
              <button
                key={h.id}
                onClick={() => scrollToHeading(h.id)}
                className={`block w-full text-left text-xs transition-colors py-1 leading-snug rounded ${
                  h.level === 3 ? 'pl-4' : 'pl-2'
                } ${
                  isActive
                    ? 'font-medium text-neutral-900 border-l-2 border-[#0071e3] bg-neutral-100/50'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {h.text}
              </button>
            );
          })}
        </nav>
      )}

      <div className="mt-8 pt-4 border-t border-neutral-200/60 pl-2 space-y-2 text-[11px] text-neutral-400">
        <div>{readTime}</div>
        <button
          onClick={scrollToTop}
          className="flex items-center gap-1 hover:text-neutral-800 transition-colors"
        >
          <ArrowUp className="w-3 h-3" />
          <span>Top</span>
        </button>
      </div>
    </aside>
  );
};
