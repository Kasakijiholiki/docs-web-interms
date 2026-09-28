import React, { useState } from 'react';
import {
  Folder,
  FileText,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import type { Category, DocItem } from '../types/doc';
import { QuickCategoryPopover } from './QuickCategoryPopover';

interface SidebarProps {
  categories: Category[];
  documents: DocItem[];
  activeDoc: DocItem;
  onSelectDoc: (doc: DocItem) => void;
  onAddDoc: (categoryName: string) => void;
  onDeleteDoc: (docId: string) => void;
  onAddCategory: () => void;
  onAddCategoryDirect: (category: Category) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  documents,
  activeDoc,
  onSelectDoc,
  onAddDoc,
  onDeleteDoc,
  onAddCategory,
  onAddCategoryDirect,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (catName: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  const filteredDocs = documents.filter((d) => {
    const matchesFilter =
      d.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
    return matchesFilter && matchesCategory;
  });

  const displayCategories =
    selectedCategory === 'all'
      ? categories
      : categories.filter((c) => c.name === selectedCategory);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-12 bottom-0 left-0 z-40 w-64 bg-[#fbfbfd] border-r border-neutral-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* macOS Search & Category Dropdown Filter */}
        <div className="p-3 border-b border-neutral-200/60 space-y-2">
          {/* Category Dropdown Filter with Quick '+' Button */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none pl-2.5 pr-7 py-1 text-xs bg-neutral-200/60 hover:bg-neutral-200/80 border border-neutral-200/80 rounded-md text-neutral-800 font-medium cursor-pointer focus:outline-none focus:bg-white focus:border-neutral-400 transition-colors"
                title="Filter by category"
              >
                <option value="all">All Categories ({documents.length})</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} ({documents.filter((d) => d.category === cat.name).length})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <QuickCategoryPopover
              categories={categories}
              onAddCategory={onAddCategoryDirect}
              onCategoryCreated={(newCatName) => setSelectedCategory(newCatName)}
            />
          </div>

          {/* Quick text filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter topics..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1 text-xs bg-neutral-200/50 hover:bg-neutral-200/70 focus:bg-white border border-transparent focus:border-neutral-300 rounded-md placeholder-neutral-400 text-neutral-800 outline-none transition-all"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tree Hierarchy */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {displayCategories.map((cat) => {
            const catDocs = filteredDocs.filter((d) => d.category === cat.name);
            const isCollapsed = collapsedCategories[cat.name];

            if (filterQuery && catDocs.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-0.5">
                {/* Category Header */}
                <div className="flex items-center justify-between group px-2 py-1 rounded-md hover:bg-black/5 transition-colors">
                  <button
                    onClick={() => toggleCategoryCollapse(cat.name)}
                    className="flex-1 flex items-center gap-1.5 text-left text-[11px] font-semibold tracking-wider uppercase text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
                    )}
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] text-neutral-400 font-normal ml-auto mr-1">
                      {catDocs.length}
                    </span>
                  </button>

                  <button
                    onClick={() => onAddDoc(cat.name)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-neutral-800 rounded transition-all"
                    title={`Add page to ${cat.name}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Document Items List */}
                {!isCollapsed && (
                  <div className="space-y-0.5 pt-0.5">
                    {catDocs.length === 0 ? (
                      <div className="text-[11px] text-neutral-400 italic py-1 pl-5">
                        No pages
                      </div>
                    ) : (
                      catDocs.map((doc) => {
                        const isActive = activeDoc.id === doc.id;
                        return (
                          <div
                            key={doc.id}
                            className={`group flex items-center justify-between rounded-lg px-2 py-1.5 transition-all ${
                              isActive
                                ? 'bg-white text-neutral-900 font-medium shadow-2xs'
                                : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/4'
                            }`}
                          >
                            <button
                              onClick={() => {
                                onSelectDoc(doc);
                                onCloseMobile();
                              }}
                              className="flex-1 flex items-center gap-2 text-xs text-left truncate"
                            >
                              <FileText
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isActive ? 'text-neutral-900' : 'text-neutral-400'
                                }`}
                              />
                              <span className="truncate">{doc.title}</span>
                            </button>

                            {documents.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete "${doc.title}"?`)) {
                                    onDeleteDoc(doc.id);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-red-600 rounded transition-all ml-1"
                                title="Delete document"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Flat Bottom Toolbar */}
        <div className="p-2 border-t border-neutral-200/60 flex items-center justify-between gap-1.5 bg-[#fbfbfd]">
          <button
            onClick={() => onAddDoc(categories[0]?.name || 'General')}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-neutral-800 bg-white hover:bg-neutral-100 border border-neutral-200/80 rounded-md transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-neutral-600" />
            <span>New Page</span>
          </button>
          <button
            onClick={onAddCategory}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-black/5 rounded-md transition-colors"
            title="Create Category"
          >
            <Folder className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
};
