import React, { useState } from 'react';

interface SymbolsPickerProps {
  onSelectSymbol: (symbol: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SymbolsPicker: React.FC<SymbolsPickerProps> = ({
  onSelectSymbol,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'common' | 'arrows' | 'keys' | 'math' | 'emojis'>('common');

  if (!isOpen) return null;

  const symbolGroups = {
    common: [
      '✓', '✔', '✕', '✖', '★', '☆', '⚡', '⚙', 'ℹ', '●', '○', '■', '□', '✦', '❖', '•', '◆', '▲', '▼', '►', '◄'
    ],
    arrows: [
      '→', '←', '↑', '↓', '↔', '↕', '⇄', '⇅', '⇒', '⇐', '⇑', '⇓', '➔', '➜', '➤', '↳', '↵', '⇢', '⇠', '⟹', '⟺'
    ],
    keys: [
      '⌘', '⌥', '⇧', '⌃', '⏎', '⌫', '⎋', '␣', '⇥', '⇪', '▲', '▼', '◀', '▶'
    ],
    math: [
      '±', '≠', '≈', '≤', '≥', '÷', '×', '∑', '∏', '√', '∞', 'µ', 'π', 'Ω', '°', '€', '£', '¥', '$', '¢', '§'
    ],
    emojis: [
      '💡', '⚠️', '🚨', 'ℹ️', '🚀', '🔒', '🔑', '📚', '🎓', '✨', '📝', '✅', '❌', '🔥', '📌', '🎯', '🛠️', '💻', '🌐', '🛡️', '⚡', '📊', '🔍', '📦'
    ],
  };

  const tabs = [
    { id: 'common', label: 'Symbols' },
    { id: 'arrows', label: 'Arrows' },
    { id: 'keys', label: 'Keys' },
    { id: 'math', label: 'Math' },
    { id: 'emojis', label: 'Emoji' },
  ] as const;

  return (
    <div 
      className="absolute z-50 left-0 top-full mt-1.5 w-72 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-neutral-200/90 p-2.5 animate-in fade-in duration-100 select-none"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
        <span className="text-[11px] font-semibold text-neutral-800">
          Special Characters
        </span>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-700 text-xs px-1"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 my-2 p-0.5 bg-neutral-100 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Symbol Grid */}
      <div className="grid grid-cols-6 gap-1 max-h-44 overflow-y-auto p-1">
        {symbolGroups[activeTab].map((sym, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSymbol(sym)}
            className="w-9 h-9 flex items-center justify-center text-base rounded-md hover:bg-neutral-100 text-neutral-800 transition-colors active:scale-95"
            title={`Insert ${sym}`}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
};
