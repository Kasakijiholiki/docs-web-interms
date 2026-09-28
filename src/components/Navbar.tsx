import React, { useState, useRef } from 'react';
import {
  Search,
  Download,
  Upload,
  RotateCcw,
  Menu,
  X,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  siteTitle: string;
  currentMode: 'reader' | 'editor' | 'manage';
  onSelectMode: (mode: 'reader' | 'editor' | 'manage') => void;
  onOpenSearch: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onResetData: () => void;
  isMobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  siteTitle,
  currentMode,
  onSelectMode,
  onOpenSearch,
  onExportJSON,
  onImportJSON,
  onResetData,
  isMobileSidebarOpen,
  onToggleMobileSidebar,
}) => {
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-12 bg-white/80 backdrop-blur-xl border-b border-neutral-200/70 px-4 sm:px-6 flex items-center justify-between select-none">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 text-neutral-500 hover:text-neutral-900 rounded-md hover:bg-black/5"
          title="Toggle Navigation"
        >
          {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-2">
          {/* Apple-style Minimal Monochrome Glyph */}
          <div className="w-6 h-6 rounded-md bg-neutral-900 text-white flex items-center justify-center font-semibold text-xs tracking-tighter">
            
          </div>
          <span className="text-[13px] font-semibold text-neutral-900 tracking-tight">
            {siteTitle}
          </span>
          <span className="text-neutral-300 mx-1 text-xs">/</span>
          <span className="text-xs text-neutral-500 font-normal">Docs</span>
        </div>
      </div>

      {/* Middle: Apple Spotlight-style Quick Search */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-neutral-400 bg-neutral-100/70 hover:bg-neutral-100 hover:text-neutral-600 rounded-lg transition-colors border border-transparent hover:border-neutral-200"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[12px]">Search documentation...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 bg-white border border-neutral-200/80 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Apple Segmented Pill & Actions */}
      <div className="flex items-center gap-3">
        {/* Search trigger on small screens */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-1.5 text-neutral-500 hover:text-neutral-900 rounded-md hover:bg-neutral-100"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Apple Segmented Control Pill (Reader / Editor / Manage) */}
        <div className="flex bg-neutral-100/90 p-0.5 rounded-full border border-neutral-200/60">
          <button
            onClick={() => onSelectMode('reader')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              currentMode === 'reader'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Reader
          </button>
          <button
            onClick={() => onSelectMode('editor')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              currentMode === 'editor'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => onSelectMode('manage')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              currentMode === 'manage'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Manage
          </button>
        </div>

        {/* Flat Minimal JSON Menu */}
        <div className="relative">
          <button
            onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/70 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-3 h-3 text-neutral-500" />
            <span className="hidden sm:inline">JSON</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {isDataMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDataMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-50 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-neutral-200/80 py-1 text-xs animate-in fade-in duration-100">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Data Store
                </div>

                <button
                  onClick={() => {
                    setIsDataMenuOpen(false);
                    onExportJSON();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100/80 transition-colors text-left"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={() => {
                    setIsDataMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100/80 transition-colors text-left"
                >
                  <Upload className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Import JSON</span>
                </button>

                <div className="my-1 border-t border-neutral-100" />

                <button
                  onClick={() => {
                    setIsDataMenuOpen(false);
                    if (confirm('Reset documentation to clean default guides?')) {
                      onResetData();
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50/50 transition-colors text-left"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </header>
  );
};
