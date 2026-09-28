import React, { useState } from 'react';
import { Upload, Link2, X } from 'lucide-react';

interface ImageInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (htmlSnippet: string) => void;
}

export const ImageInsertModal: React.FC<ImageInsertModalProps> = ({
  isOpen,
  onClose,
  onInsertImage,
}) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, SVG, WebP)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          if (!altText) {
            setAltText(file.name.replace(/\.[^/.]+$/, ''));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsert = () => {
    if (!imageUrl) return;

    const captionHtml = caption
      ? `<p class="image-caption">${caption}</p>`
      : '';
    const alt = altText || caption || 'Documentation visual';

    const snippet = `
      <div class="doc-image-container">
        <img src="${imageUrl}" alt="${alt}" class="doc-image" />
        ${captionHtml}
      </div>
    `;

    onInsertImage(snippet);
    setImageUrl('');
    setCaption('');
    setAltText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200/90 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
          <span className="text-xs font-semibold text-neutral-900">
            Insert Image
          </span>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Apple Segmented Control */}
        <div className="px-5 pt-4">
          <div className="flex rounded-lg bg-neutral-100 p-0.5 border border-neutral-200/60">
            <button
              onClick={() => setTab('upload')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs font-medium rounded-md transition-all ${
                tab === 'upload'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Upload Local</span>
            </button>
            <button
              onClick={() => setTab('url')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs font-medium rounded-md transition-all ${
                tab === 'url'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Link2 className="w-3 h-3" />
              <span>Web Link</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5">
          {tab === 'upload' ? (
            <div>
              <label className="border border-dashed border-neutral-300 hover:border-neutral-400 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                <Upload className="w-6 h-6 text-neutral-400 mb-1.5" />
                <span className="text-xs font-medium text-neutral-800">Choose image file</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">PNG, JPG, SVG, WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
              />
            </div>
          )}

          {imageUrl && (
            <div className="border border-neutral-200 rounded-lg p-2 bg-neutral-50 text-center">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-h-32 w-auto mx-auto rounded object-contain"
              />
            </div>
          )}

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-0.5">
                Caption
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Figure description..."
                className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-neutral-50/50 border-t border-neutral-100">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-800 rounded-md hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!imageUrl}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              imageUrl
                ? 'bg-[#0071e3] text-white hover:bg-[#0077ed]'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};
