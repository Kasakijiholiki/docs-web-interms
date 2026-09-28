import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Edit2,
  Share2,
  Check,
  ArrowLeft,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import type { DocItem } from '../types/doc';
import { ImageLightbox } from './ImageLightbox';

interface DocViewerProps {
  doc: DocItem;
  prevDoc?: DocItem;
  nextDoc?: DocItem;
  onSelectDoc: (doc: DocItem) => void;
  onEditDoc: () => void;
}

export const DocViewer: React.FC<DocViewerProps> = ({
  doc,
  prevDoc,
  nextDoc,
  onSelectDoc,
  onEditDoc,
}) => {
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    src: string;
    alt: string;
    caption?: string;
  }>({
    isOpen: false,
    src: '',
    alt: '',
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    const handleDocumentClicks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.tagName.toLowerCase() === 'img' && target.classList.contains('doc-image')) {
        const img = target as HTMLImageElement;
        const container = img.closest('.doc-image-container');
        const caption = container?.querySelector('.image-caption')?.textContent || '';
        setLightboxData({
          isOpen: true,
          src: img.src,
          alt: img.alt || 'Document Image',
          caption,
        });
      }

      if (target.classList.contains('copy-button')) {
        const codeBlock = target.closest('.code-block');
        const codeEl = codeBlock?.querySelector('pre code');
        if (codeEl?.textContent) {
          navigator.clipboard.writeText(codeEl.textContent);
          const originalText = target.textContent;
          target.textContent = 'Copied';
          setTimeout(() => {
            target.textContent = originalText;
          }, 2000);
        }
      }
    };

    document.addEventListener('click', handleDocumentClicks);
    return () => document.removeEventListener('click', handleDocumentClicks);
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formattedDate = new Date(doc.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex-1 max-w-3xl mx-auto px-6 sm:px-8 py-10 w-full animate-in fade-in duration-150">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-6">
        <span>Docs</span>
        <ChevronRight className="w-3 h-3 text-neutral-300" />
        <span className="text-neutral-500">{doc.category}</span>
        <ChevronRight className="w-3 h-3 text-neutral-300" />
        <span className="text-neutral-900 font-medium truncate max-w-xs">{doc.title}</span>
      </nav>

      {/* Header Section */}
      <header className="pb-6 mb-8 border-b border-neutral-200/70">
        <div className="flex items-center justify-between gap-4 mb-2">
          {doc.badge && (
            <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 border border-neutral-200/80 rounded-full px-2.5 py-0.5">
              {doc.badge}
            </span>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 px-2.5 py-1 rounded-md hover:bg-neutral-100 transition-colors"
              title="Copy page link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3 h-3" />
                  <span>Share</span>
                </>
              )}
            </button>
            <button
              onClick={onEditDoc}
              className="flex items-center gap-1 text-xs font-medium text-[#0071e3] hover:text-[#0077ed] px-2.5 py-1 rounded-md hover:bg-blue-50/50 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
          {doc.title}
        </h1>

        {doc.description && (
          <p className="text-base text-neutral-500 mt-2 font-normal leading-relaxed">
            {doc.description}
          </p>
        )}

        <div className="flex items-center gap-4 mt-4 text-xs text-neutral-400">
          <span>{doc.author || 'Platform Team'}</span>
          <span>•</span>
          <span>Updated {formattedDate}</span>
        </div>
      </header>

      {/* Content Article */}
      <article
        className="doc-content min-h-[300px]"
        dangerouslySetInnerHTML={{ __html: doc.content }}
      />

      {/* Minimal Flat Feedback */}
      <div className="my-10 p-5 bg-[#fbfbfd] border border-neutral-200/70 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-neutral-600 font-medium">
          Was this page helpful?
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFeedback('yes')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md border transition-all ${
              feedback === 'yes'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>Yes</span>
          </button>
          <button
            onClick={() => setFeedback('no')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md border transition-all ${
              feedback === 'no'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <ThumbsDown className="w-3 h-3" />
            <span>No</span>
          </button>
          {feedback && (
            <span className="text-xs text-neutral-400 ml-1">Thank you.</span>
          )}
        </div>
      </div>

      {/* Prev / Next Pagination */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-neutral-200/70">
        {prevDoc ? (
          <button
            onClick={() => onSelectDoc(prevDoc)}
            className="flex flex-col items-start p-3.5 text-left border border-neutral-200/70 hover:border-neutral-400 rounded-xl hover:bg-white transition-colors group"
          >
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 mb-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Previous</span>
            </div>
            <span className="text-xs font-medium text-neutral-800 group-hover:text-[#0071e3] line-clamp-1">
              {prevDoc.title}
            </span>
          </button>
        ) : (
          <div />
        )}

        {nextDoc ? (
          <button
            onClick={() => onSelectDoc(nextDoc)}
            className="flex flex-col items-end p-3.5 text-right border border-neutral-200/70 hover:border-neutral-400 rounded-xl hover:bg-white transition-colors group"
          >
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 mb-1">
              <span>Next</span>
              <ArrowRight className="w-3 h-3" />
            </div>
            <span className="text-xs font-medium text-neutral-800 group-hover:text-[#0071e3] line-clamp-1">
              {nextDoc.title}
            </span>
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Lightbox */}
      <ImageLightbox
        isOpen={lightboxData.isOpen}
        src={lightboxData.src}
        alt={lightboxData.alt}
        caption={lightboxData.caption}
        onClose={() => setLightboxData({ ...lightboxData, isOpen: false })}
      />
    </div>
  );
};
