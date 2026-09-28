import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import type { Category, DocItem, DocStoreData } from './types/doc';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DocViewer } from './components/DocViewer';
import { DocEditor } from './components/DocEditor';
import { TableOfContents } from './components/TableOfContents';
import { SearchModal } from './components/SearchModal';
import { CategoryModal } from './components/CategoryModal';
import { ManagementDashboard } from './components/ManagementDashboard';

export const App: React.FC = () => {
  const [store, setStore] = useState<DocStoreData>(() => StorageService.loadStore());
  const [activeDocId, setActiveDocId] = useState<string>(() => {
    return store.documents[0]?.id || '';
  });
  const [viewMode, setViewMode] = useState<'reader' | 'editor' | 'manage'>('reader');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Synchronize localStorage whenever store changes
  useEffect(() => {
    StorageService.saveStore(store);
  }, [store]);

  const activeDoc =
    store.documents.find((d) => d.id === activeDocId) ||
    store.documents[0] || {
      id: 'empty',
      slug: 'empty',
      title: 'No Documents Found',
      category: 'General',
      order: 1,
      content: '<p>Please create a new document using the sidebar.</p>',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

  // Find previous and next docs in current category or global list for footer navigation
  const currentIndex = store.documents.findIndex((d) => d.id === activeDoc.id);
  const prevDoc = currentIndex > 0 ? store.documents[currentIndex - 1] : undefined;
  const nextDoc =
    currentIndex < store.documents.length - 1 ? store.documents[currentIndex + 1] : undefined;

  // Handle document selection
  const handleSelectDoc = (doc: DocItem) => {
    setActiveDocId(doc.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save modified document
  const handleSaveDoc = (updatedDoc: DocItem) => {
    setStore((prev) => ({
      ...prev,
      documents: prev.documents.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)),
    }));
  };

  // Add a new document
  const handleAddDoc = (categoryName: string) => {
    const newDocId = `doc-${Date.now()}`;
    const newDoc: DocItem = {
      id: newDocId,
      slug: `new-page-${Date.now().toString().slice(-4)}`,
      title: 'Untitled Document',
      category: categoryName,
      order: store.documents.filter((d) => d.category === categoryName).length + 1,
      badge: 'Draft',
      badgeColor: 'amber',
      description: 'Add a brief summary of what this document explains.',
      content: `
        <h2>Overview</h2>
        <p>Start writing your documentation here using the lightweight editor toolbar above.</p>
        
        <div class="callout callout-tip">
          <div class="callout-icon">💡</div>
          <div class="callout-body">
            <strong>Pro Tip</strong>
            <p>You can insert images, symbols, headers, and callouts with one click!</p>
          </div>
        </div>
      `,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Editor',
      readTime: '2 min read',
    };

    setStore((prev) => ({
      ...prev,
      documents: [newDoc, ...prev.documents],
    }));
    setActiveDocId(newDocId);
    setViewMode('editor');
  };

  // Delete a document
  const handleDeleteDoc = (docId: string) => {
    setStore((prev) => {
      const remaining = prev.documents.filter((d) => d.id !== docId);
      if (activeDocId === docId && remaining.length > 0) {
        setActiveDocId(remaining[0].id);
      }
      return {
        ...prev,
        documents: remaining,
      };
    });
  };

  // Add new category
  const handleAddCategory = (newCategory: Category) => {
    setStore((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
  };

  // Export JSON
  const handleExportJSON = () => {
    StorageService.exportJSON(store);
  };

  // Import JSON
  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const imported = StorageService.parseImportedJSON(content);
        if (imported) {
          setStore(imported);
          if (imported.documents.length > 0) {
            setActiveDocId(imported.documents[0].id);
          }
          alert('Documentation library imported successfully!');
        } else {
          alert('Invalid JSON file format. Please upload a valid documentation export.');
        }
      }
    };
    reader.readAsText(file);
  };

  // Reset to default sample data
  const handleResetData = () => {
    const reset = StorageService.resetToDefault();
    setStore(reset);
    if (reset.documents.length > 0) {
      setActiveDocId(reset.documents[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex flex-col text-[#1d1d1f]">
      {/* Top Navbar */}
      <Navbar
        siteTitle={store.siteTitle}
        currentMode={viewMode}
        onSelectMode={(mode) => setViewMode(mode)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onResetData={handleResetData}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Dynamic Root Layout */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar
          categories={store.categories}
          documents={store.documents}
          activeDoc={activeDoc}
          onSelectDoc={(doc) => {
            handleSelectDoc(doc);
            if (viewMode === 'manage') setViewMode('reader');
          }}
          onAddDoc={(catName) => {
            handleAddDoc(catName);
          }}
          onDeleteDoc={handleDeleteDoc}
          onAddCategory={() => setIsCategoryModalOpen(true)}
          onAddCategoryDirect={handleAddCategory}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Center & Right Content Container */}
        <main className="flex-1 lg:pl-64 flex min-w-0">
          {viewMode === 'manage' ? (
            <ManagementDashboard
              store={store}
              onUpdateStore={(newStore) => setStore(newStore)}
              onSelectDoc={(doc) => {
                handleSelectDoc(doc);
                setViewMode('reader');
              }}
              onOpenEditorForDoc={(doc) => {
                handleSelectDoc(doc);
                setViewMode('editor');
              }}
              onExportJSON={handleExportJSON}
              onImportJSON={handleImportJSON}
              onResetData={handleResetData}
            />
          ) : viewMode === 'editor' ? (
            <DocEditor
              doc={activeDoc}
              categories={store.categories}
              onSaveDoc={handleSaveDoc}
              onAddCategory={handleAddCategory}
              onCancel={() => setViewMode('reader')}
            />
          ) : (
            <div className="flex-1 flex justify-center min-w-0">
              {/* Document Reader View */}
              <DocViewer
                doc={activeDoc}
                prevDoc={prevDoc}
                nextDoc={nextDoc}
                onSelectDoc={handleSelectDoc}
                onEditDoc={() => setViewMode('editor')}
              />

              {/* Right Table of Contents */}
              <TableOfContents
                content={activeDoc.content}
                readTime={activeDoc.readTime}
              />
            </div>
          )}
        </main>
      </div>

      {/* Global Search Dialog (Cmd+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        documents={store.documents}
        onSelectDoc={handleSelectDoc}
      />

      {/* New Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
        existingCategories={store.categories}
      />
    </div>
  );
};

export default App;
