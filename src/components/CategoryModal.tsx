import React, { useState } from 'react';
import { X, Folder, BookOpen, Compass, ShieldCheck, GraduationCap, Webhook, Layers, Settings, Sparkles } from 'lucide-react';
import type { Category } from '../types/doc';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: Category) => void;
  existingCategories: Category[];
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
  existingCategories,
}) => {
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('BookOpen');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const availableIcons = [
    { name: 'BookOpen', icon: BookOpen, label: 'Docs' },
    { name: 'Compass', icon: Compass, label: 'Guide' },
    { name: 'ShieldCheck', icon: ShieldCheck, label: 'Security' },
    { name: 'GraduationCap', icon: GraduationCap, label: 'Course' },
    { name: 'Webhook', icon: Webhook, label: 'API' },
    { name: 'Layers', icon: Layers, label: 'System' },
    { name: 'Settings', icon: Settings, label: 'Settings' },
    { name: 'Sparkles', icon: Sparkles, label: 'New' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      iconName,
      order: existingCategories.length + 1,
      description: description.trim(),
    };

    onAddCategory(newCat);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200/90 w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-neutral-600" />
            <span className="text-xs font-semibold text-neutral-900">New Category</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1">
              Category Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Account & Billing"
              className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
              Icon
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {availableIcons.map((item) => {
                const Icon = item.icon;
                const isSelected = iconName === item.name;
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => setIconName(item.name)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'border-[#0071e3] bg-blue-50/50 text-[#0071e3] font-medium'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mb-1" />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Topic summary..."
              className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-neutral-600 hover:text-neutral-800 rounded-md hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-3.5 py-1.5 font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-md transition-colors disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
