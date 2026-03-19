
import { Document, AppSettings } from '../types';

const STORAGE_KEYS = {
  DOCUMENTS: 'convenient-docs',
  SETTINGS: 'convenient-settings',
  CURRENT_DOC_ID: 'convenient-current-id',
};

export const storageService = {
  // Settings
  getSettings: (): AppSettings => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaultSettings: AppSettings = {
      language: navigator.language.startsWith('zh') ? 'zh' : 'en',
      theme: 'light',
      autoSave: true,
      searchProvider: 'bing',
      persona: 'classic',
      backupMode: 'both'
    };
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Documents
  getDocuments: (): Document[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return saved ? JSON.parse(saved) : [];
  },

  saveDocuments: (docs: Document[]) => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  },

  getCurrentDocId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_DOC_ID);
  },

  setCurrentDocId: (id: string) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_DOC_ID, id);
  },

  // Helper to migrate old single-doc data if needed
  migrateLegacyData: () => {
    const oldMarkdown = localStorage.getItem('saved-markdown');
    const oldFilename = localStorage.getItem('saved-filename');
    
    if (oldMarkdown) {
      const docs = storageService.getDocuments();
      if (docs.length === 0) {
        const newDoc: Document = {
          id: crypto.randomUUID(),
          title: oldFilename || 'Migrated Doc',
          content: oldMarkdown,
          lastModified: Date.now(),
          mode: 'markdown',
        };
        storageService.saveDocuments([newDoc]);
        storageService.setCurrentDocId(newDoc.id);
        
        // Clear old keys
        localStorage.removeItem('saved-markdown');
        localStorage.removeItem('saved-filename');
      }
    }
  }
};
