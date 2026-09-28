import React, { useState } from 'react';
import {
  Trash2,
  Edit2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Plus,
  Search,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  Compass,
  ShieldCheck,
  GraduationCap,
  Webhook,
  Layers,
  Settings,
  Sparkles,
} from 'lucide-react';
import type { Category, DocItem, DocStoreData } from '../types/doc';

interface ManagementDashboardProps {
  store: DocStoreData;
  onUpdateStore: (newStore: DocStoreData) => void;
  onSelectDoc: (doc: DocItem) => void;
  onOpenEditorForDoc: (doc: DocItem) => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onResetData: () => void;
}

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  store,
  onUpdateStore,
  onSelectDoc,
  onOpenEditorForDoc,
  onExportJSON,
  onImportJSON,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'documents' | 'settings'>('categories');

  // Category renaming state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState<string>('');

  // Delete category with reassignment state
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [reassignCategoryName, setReassignCategoryName] = useState<string>('');

  // New Category inline form
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('BookOpen');

  // Documents Table Filter & Search
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState('all');

  // Site title edit state
  const [siteTitle, setSiteTitle] = useState(store.siteTitle);
  const [isTitleSaved, setIsTitleSaved] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return Compass;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'GraduationCap':
        return GraduationCap;
      case 'Webhook':
        return Webhook;
      case 'Layers':
        return Layers;
      case 'Settings':
        return Settings;
      case 'Sparkles':
        return Sparkles;
      default:
        return BookOpen;
    }
  };

  // CATEGORY ACTIONS
  const startRenameCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setEditCategoryName(cat.name);
  };

  const saveRenameCategory = (cat: Category) => {
    if (!editCategoryName.trim() || editCategoryName.trim() === cat.name) {
      setEditingCategoryId(null);
      return;
    }
    const newName = editCategoryName.trim();

    // Update category and all linked documents
    const updatedCategories = store.categories.map((c) =>
      c.id === cat.id ? { ...c, name: newName } : c
    );
    const updatedDocs = store.documents.map((d) =>
      d.category === cat.name ? { ...d, category: newName } : d
    );

    onUpdateStore({
      ...store,
      categories: updatedCategories,
      documents: updatedDocs,
    });
    setEditingCategoryId(null);
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newCategories = [...store.categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    onUpdateStore({
      ...store,
      categories: newCategories,
    });
  };

  const handleDeleteCategoryClick = (cat: Category) => {
    const linkedDocs = store.documents.filter((d) => d.category === cat.name);
    if (linkedDocs.length === 0) {
      // Safe to delete immediately
      onUpdateStore({
        ...store,
        categories: store.categories.filter((c) => c.id !== cat.id),
      });
    } else {
      // Has documents - prompt for reassignment
      const otherCategories = store.categories.filter((c) => c.id !== cat.id);
      setReassignCategoryName(otherCategories[0]?.name || 'General');
      setCategoryToDelete(cat);
    }
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    const targetCategory = reassignCategoryName.trim() || 'General';

    // If target category doesn't exist, create it
    let updatedCategories = store.categories.filter((c) => c.id !== categoryToDelete.id);
    if (!updatedCategories.some((c) => c.name === targetCategory)) {
      updatedCategories.push({
        id: `cat-${Date.now()}`,
        name: targetCategory,
        iconName: 'BookOpen',
        order: updatedCategories.length + 1,
      });
    }

    // Reassign all documents
    const updatedDocs = store.documents.map((d) =>
      d.category === categoryToDelete.name ? { ...d, category: targetCategory } : d
    );

    onUpdateStore({
      ...store,
      categories: updatedCategories,
      documents: updatedDocs,
    });
    setCategoryToDelete(null);
  };

  const handleCreateNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const trimmed = newCatName.trim();
    if (store.categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('A category with this name already exists.');
      return;
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      iconName: newCatIcon,
      order: store.categories.length + 1,
    };

    onUpdateStore({
      ...store,
      categories: [...store.categories, newCat],
    });
    setNewCatName('');
    setIsAddingCategory(false);
  };

  // DOCUMENT ACTIONS
  const handleDocCategoryChange = (docId: string, newCategory: string) => {
    const updatedDocs = store.documents.map((d) =>
      d.id === docId ? { ...d, category: newCategory } : d
    );
    onUpdateStore({
      ...store,
      documents: updatedDocs,
    });
  };

  const handleDeleteDoc = (docId: string, title: string) => {
    if (confirm(`Permanently delete "${title}"?`)) {
      onUpdateStore({
        ...store,
        documents: store.documents.filter((d) => d.id !== docId),
      });
    }
  };

  // Calculate storage size
  const storageString = JSON.stringify(store);
  const storageBytes = new Blob([storageString]).size;
  const storageKb = (storageBytes / 1024).toFixed(1);

  // Filtered docs for documents table
  const filteredDocs = store.documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(docSearchQuery.toLowerCase());
    const matchesCategory =
      docCategoryFilter === 'all' || doc.category === docCategoryFilter;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full animate-in fade-in duration-150 select-none">
      {/* Title & Introduction */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Management
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Organize categories, review all documentation pages, and manage local storage.
        </p>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/60 max-w-md mb-8">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
            activeTab === 'categories'
              ? 'bg-white text-neutral-900 shadow-2xs'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Categories ({store.categories.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
            activeTab === 'documents'
              ? 'bg-white text-neutral-900 shadow-2xs'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          All Documents ({store.documents.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
            activeTab === 'settings'
              ? 'bg-white text-neutral-900 shadow-2xs'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Settings & Storage
        </button>
      </div>

      {/* TAB 1: CATEGORIES MANAGER */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              Category Hierarchy
            </span>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Category</span>
            </button>
          </div>

          {/* New Category Inline Form */}
          {isAddingCategory && (
            <form
              onSubmit={handleCreateNewCategory}
              className="p-4 bg-white border border-neutral-200/90 rounded-xl space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-900">
                  Create Category
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Developer APIs"
                    className="w-full px-2.5 py-1.5 border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Icon
                  </label>
                  <div className="flex gap-1">
                    {availableIcons.map((item) => {
                      const Icon = item.icon;
                      const isSelected = newCatIcon === item.name;
                      return (
                        <button
                          type="button"
                          key={item.name}
                          onClick={() => setNewCatIcon(item.name)}
                          className={`p-1.5 rounded-md border transition-all ${
                            isSelected
                              ? 'border-[#0071e3] bg-blue-50/50 text-[#0071e3]'
                              : 'border-neutral-200 text-neutral-600'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-3 py-1 text-xs text-neutral-600 hover:text-neutral-800 rounded-md hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="px-3.5 py-1 text-xs font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-md disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="bg-white border border-neutral-200/80 rounded-xl overflow-hidden divide-y divide-neutral-100">
            {store.categories.map((cat, idx) => {
              const Icon = getCategoryIcon(cat.iconName);
              const count = store.documents.filter((d) => d.category === cat.name).length;
              const isEditing = editingCategoryId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="p-3.5 flex items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Name / Inline Rename */}
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 max-w-xs">
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRenameCategory(cat);
                            if (e.key === 'Escape') setEditingCategoryId(null);
                          }}
                          autoFocus
                          className="w-full px-2 py-1 text-xs border border-[#0071e3] rounded-md focus:outline-none"
                        />
                        <button
                          onClick={() => saveRenameCategory(cat)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingCategoryId(null)}
                          className="p-1 text-neutral-400 hover:bg-neutral-100 rounded"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-neutral-900 truncate">
                            {cat.name}
                          </span>
                          <button
                            onClick={() => startRenameCategory(cat)}
                            className="p-0.5 text-neutral-400 hover:text-neutral-700"
                            title="Rename Category"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          {count} {count === 1 ? 'document' : 'documents'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Reorder & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => moveCategory(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 rounded hover:bg-neutral-100 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveCategory(idx, 'down')}
                      disabled={idx === store.categories.length - 1}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 rounded hover:bg-neutral-100 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    {store.categories.length > 1 && (
                      <button
                        onClick={() => handleDeleteCategoryClick(cat)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors ml-1"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delete Category Confirmation Dialog */}
          {categoryToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-xl border border-neutral-200/90 w-full max-w-sm p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                    !
                  </div>
                  <h3 className="text-xs font-semibold text-neutral-900">
                    Delete Category "{categoryToDelete.name}"?
                  </h3>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  This category contains{' '}
                  <strong>
                    {store.documents.filter((d) => d.category === categoryToDelete.name).length}
                  </strong>{' '}
                  documents. Reassign them to another category so they are not lost:
                </p>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Reassign Documents To:
                  </label>
                  <select
                    value={reassignCategoryName}
                    onChange={(e) => setReassignCategoryName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md bg-white focus:outline-none focus:border-neutral-400"
                  >
                    {store.categories
                      .filter((c) => c.id !== categoryToDelete.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    <option value="General">General (New)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => setCategoryToDelete(null)}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-800 rounded-md hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteCategory}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                  >
                    Reassign & Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL DOCUMENTS TABLE */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {/* Table Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-neutral-200/80 rounded-xl">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents by title or category..."
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                className="w-full pl-7 pr-3 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] text-neutral-400 font-medium">Category:</span>
              <select
                value={docCategoryFilter}
                onChange={(e) => setDocCategoryFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-neutral-200 rounded-md bg-white focus:outline-none focus:border-neutral-400"
              >
                <option value="all">All ({store.documents.length})</option>
                {store.categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-neutral-200/80 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 border-b border-neutral-200/70 text-neutral-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Badge</th>
                  <th className="py-2.5 px-3">Words</th>
                  <th className="py-2.5 px-3">Updated</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400 italic">
                      No documents match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const words = doc.content
                      .replace(/<[^>]*>/g, ' ')
                      .split(/\s+/)
                      .filter(Boolean).length;
                    const date = new Date(doc.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <tr key={doc.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-neutral-900 max-w-xs truncate">
                          {doc.title}
                        </td>
                        <td className="py-2.5 px-3">
                          {/* Inline Category Change */}
                          <select
                            value={doc.category}
                            onChange={(e) => handleDocCategoryChange(doc.id, e.target.value)}
                            className="bg-transparent hover:bg-neutral-100 border border-transparent hover:border-neutral-200 rounded px-1.5 py-0.5 text-xs text-neutral-700 cursor-pointer"
                          >
                            {store.categories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          {doc.badge ? (
                            <span className="text-[10px] font-medium text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200/70">
                              {doc.badge}
                            </span>
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-500 font-mono text-[11px]">
                          ~{words}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-400 text-[11px]">{date}</td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onSelectDoc(doc)}
                              className="px-2 py-0.5 text-[11px] text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                              title="Read"
                            >
                              View
                            </button>
                            <button
                              onClick={() => onOpenEditorForDoc(doc)}
                              className="px-2 py-0.5 text-[11px] text-[#0071e3] hover:text-[#0077ed] hover:bg-blue-50/50 rounded transition-colors"
                              title="Edit in Editor"
                            >
                              Edit
                            </button>
                            {store.documents.length > 1 && (
                              <button
                                onClick={() => handleDeleteDoc(doc.id, doc.title)}
                                className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS & STORAGE */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Site Title Settings */}
          <div className="p-5 bg-white border border-neutral-200/80 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              Site Title
            </h3>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="Documentation Portal"
                className="flex-1 px-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
              />
              <button
                onClick={() => {
                  onUpdateStore({ ...store, siteTitle: siteTitle.trim() || 'DocFlow Studio' });
                  setIsTitleSaved(true);
                  setTimeout(() => setIsTitleSaved(false), 2000);
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-md transition-colors"
              >
                {isTitleSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          {/* LocalStorage Usage */}
          <div className="p-5 bg-white border border-neutral-200/80 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-neutral-600" />
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                Local Browser Storage
              </h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Your documentation is saved directly inside your browser's LocalStorage. No server or
              cloud database is needed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/60">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                  Storage Used
                </span>
                <div className="text-lg font-semibold text-neutral-900 mt-0.5">
                  {storageKb} KB
                </div>
                <span className="text-[10px] text-neutral-400">of ~5MB browser quota</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/60">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                  Categories
                </span>
                <div className="text-lg font-semibold text-neutral-900 mt-0.5">
                  {store.categories.length}
                </div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/60">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                  Documents
                </span>
                <div className="text-lg font-semibold text-neutral-900 mt-0.5">
                  {store.documents.length}
                </div>
              </div>
            </div>
          </div>

          {/* Backup & Data Actions */}
          <div className="p-5 bg-white border border-neutral-200/80 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              Data Backup & Restore
            </h3>
            <p className="text-xs text-neutral-500">
              Download your entire documentation library as a portable JSON file, or restore from a
              previous backup.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={onExportJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON File</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 rounded-md transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON File</span>
              </button>
              <button
                onClick={() => {
                  if (confirm('Reset to original sample documentation? All custom changes will be replaced.')) {
                    onResetData();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100/60 border border-red-200 rounded-md transition-colors ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImportJSON(file);
              }}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};
