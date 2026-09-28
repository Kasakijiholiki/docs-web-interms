import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, ArrowRight, X } from 'lucide-react';
import type { DocItem } from '../types/doc';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocItem[];
  onSelectDoc: (doc: DocItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  documents,
  onSelectDoc,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? documents.filter((doc) => {
        const q = query.toLowerCase();
        return (
          doc.title.toLowerCase().includes(q) ||
          doc.category.toLowerCase().includes(q) ||
          doc.description?.toLowerCase().includes(q) ||
          doc.content.toLowerCase().includes(q)
        );
      })
    : documents.slice(0, 5);

  const getSnippet = (content: string, q: string) => {
    const plain = content.replace(/<[^>]*>/g, ' ');
    if (!q) return plain.slice(0, 90) + '...';
    const index = plain.toLowerCase().indexOf(q.toLowerCase());
    if (index === -1) return plain.slice(0, 90) + '...';
    const start = Math.max(0, index - 25);
    const end = Math.min(plain.length, index + 65);
    return (start > 0 ? '...' : '') + plain.slice(start, end) + '...';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/25 backdrop-blur-md p-4 animate-in fade-in duration-100"
      onClick={onClose}
    >
      {/* Spotlight Window */}
      <div
        className="w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-neutral-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-neutral-100 gap-3">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder-neutral-400 text-neutral-900"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-neutral-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-neutral-400 bg-neutral-100 rounded border border-neutral-200">
            esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-400">
              No results found
            </div>
          ) : (
            <div className="space-y-0.5">
              {results.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    onSelectDoc(doc);
                    onClose();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-100/80 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 shrink-0 transition-colors" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-neutral-900 truncate">
                          {doc.title}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-normal">
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {getSnippet(doc.content, query)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-700 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
