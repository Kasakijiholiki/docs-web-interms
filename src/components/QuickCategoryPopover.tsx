import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, BookOpen, Compass, ShieldCheck, GraduationCap, Webhook, Layers, Settings, Sparkles } from 'lucide-react';
import type { Category } from '../types/doc';

interface QuickCategoryPopoverProps {
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onCategoryCreated?: (categoryName: string) => void;
}

export const QuickCategoryPopover: React.FC<QuickCategoryPopoverProps> = ({
  categories,
  onAddCategory,
  onCategoryCreated,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('BookOpen');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableIcons = [
    { name: 'BookOpen', icon: BookOpen },
    { name: 'Compass', icon: Compass },
    { name: 'ShieldCheck', icon: ShieldCheck },
    { name: 'GraduationCap', icon: GraduationCap },
    { name: 'Webhook', icon: Webhook },
    { name: 'Layers', icon: Layers },
    { name: 'Settings', icon: Settings },
    { name: 'Sparkles', icon: Sparkles },
  ];

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const trimmed = name.trim();
    // Check if category already exists
    const existing = categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      onCategoryCreated?.(existing.name);
      setName('');
      setIsOpen(false);
      return;
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      iconName,
      order: categories.length + 1,
    };

    onAddCategory(newCat);
    onCategoryCreated?.(trimmed);
    setName('');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex items-center" ref={popoverRef}>
      {/* Small '+' icon button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1 text-neutral-500 hover:text-neutral-900 border rounded-md transition-colors flex items-center justify-center shrink-0 ${
          isOpen
            ? 'bg-neutral-200 border-neutral-300 text-neutral-900'
            : 'bg-white hover:bg-neutral-100 border-neutral-200/90'
        }`}
        title="Add new category"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Floating Popover Dialog */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-neutral-200/90 p-3 animate-in fade-in zoom-in-95 duration-100 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
            <span className="font-semibold text-neutral-800 text-[11px]">
              Add Category
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-medium text-neutral-500 mb-1">
                Name
              </label>
              <input
                ref={inputRef}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Integrations"
                className="w-full px-2 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-neutral-500 mb-1">
                Icon
              </label>
              <div className="grid grid-cols-4 gap-1">
                {availableIcons.map((item) => {
                  const Icon = item.icon;
                  const isSelected = iconName === item.name;
                  return (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => setIconName(item.name)}
                      className={`flex items-center justify-center p-1.5 rounded-md border transition-all ${
                        isSelected
                          ? 'border-[#0071e3] bg-blue-50/50 text-[#0071e3]'
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 text-neutral-600 hover:text-neutral-800 rounded-md hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-3 py-1 font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-md transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
