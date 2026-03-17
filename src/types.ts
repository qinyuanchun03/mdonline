export type EditorMode = 'markdown' | 'richtext' | 'code';

export interface Snapshot {
  id: string;
  timestamp: number;
  content: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  lastModified: number;
  mode: EditorMode;
  snapshots?: Snapshot[];
}

export interface AppSettings {
  language: 'en' | 'zh';
  theme: 'light' | 'dark' | 'system';
  aiApiKey?: string;
  aiBaseUrl?: string;
  aiModelId?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  autoSave: boolean;
}

export interface AIResponse {
  text: string;
  layoutSuggestions?: string[];
}
