import type { DocStoreData } from '../types/doc';
import { DEFAULT_CATEGORIES, DEFAULT_DOCS } from '../data/defaultDocs';

const STORAGE_KEY = 'INTERMS_DOC_STORE_V2';

export const StorageService = {
  loadStore(): DocStoreData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DocStoreData;
        if (parsed.documents && parsed.categories) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse localStorage data, falling back to defaults', e);
    }

    const defaultStore: DocStoreData = {
      version: '2.0.0',
      siteTitle: 'DocFlow Studio',
      categories: DEFAULT_CATEGORIES,
      documents: DEFAULT_DOCS,
    };
    this.saveStore(defaultStore);
    return defaultStore;
  },

  saveStore(store: DocStoreData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  },

  resetToDefault(): DocStoreData {
    const defaultStore: DocStoreData = {
      version: '2.0.0',
      siteTitle: 'DocFlow Studio',
      categories: DEFAULT_CATEGORIES,
      documents: DEFAULT_DOCS,
    };
    this.saveStore(defaultStore);
    return defaultStore;
  },

  exportJSON(store: DocStoreData): void {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(store, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `documentation-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  parseImportedJSON(jsonText: string): DocStoreData | null {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed.documents) && Array.isArray(parsed.categories)) {
        return {
          version: parsed.version || '2.0.0',
          siteTitle: parsed.siteTitle || 'Documentation Portal',
          categories: parsed.categories,
          documents: parsed.documents,
        };
      }
    } catch (e) {
      console.error('Invalid JSON file format', e);
    }
    return null;
  },
};
