import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  src,
  alt,
  caption,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `${alt || 'documentation-visual'}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      {/* QuickLook Toolbar */}
      <div
        className="w-full max-w-4xl flex items-center justify-between pb-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs font-normal text-neutral-300 truncate max-w-md">
          {alt || 'Preview'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-neutral-200 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div
        className="max-w-4xl max-h-[82vh] flex flex-col items-center justify-center overflow-hidden rounded-xl bg-black/30 border border-white/10 p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[76vh] w-auto object-contain rounded-lg"
        />
        {caption && (
          <p className="text-xs text-neutral-400 mt-2 text-center px-4 py-0.5">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
};
