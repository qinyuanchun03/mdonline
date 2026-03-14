import React, { useState, useEffect, useRef, useDeferredValue, memo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Download, Upload, Save, LayoutTemplate, Check, Globe, 
  Edit2, Eye, Settings, Menu, Plus, Trash2, Sparkles, X,
  FileText, Code, Type, History, Clock, MoreVertical, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storageService } from './services/storage';
import { aiService } from './services/ai';
import { Document, EditorMode, AppSettings, Snapshot } from './types';

const translations = {
  en: {
    appName: "Super Convenient Editor",
    saved: "Saved",
    unsaved: "Unsaved...",
    import: "Import",
    export: "Export",
    save: "Save",
    markdownPane: "Markdown",
    previewPane: "Preview",
    chars: "chars",
    placeholder: "Start typing your markdown here...",
    saveSuccess: "Saved successfully",
    asMd: "As .md",
    asTxt: "As .txt",
    untitled: "Untitled document",
    edit: "Edit",
    preview: "Preview",
    settings: "Settings",
    labs: "Labs (Beta)",
    aiAssistant: "AI Assistant",
    supabaseSync: "Supabase Sync",
    editorMode: "Editor Mode",
    history: "History",
    newDoc: "New Document",
    delete: "Delete",
    apiKey: "Gemini API Key",
    apiKeyPlaceholder: "Enter your API key...",
    layoutFirst: "Layout-First Mode",
    experimental: "Experimental",
    versionHistory: "Version History",
    restore: "Restore",
    restoreConfirm: "Restore this version? Unsaved changes will be lost.",
    noHistory: "No history available.",
    currentVersion: "Current Version",
    actions: "Actions",
    saveVersion: "Save Version",
    htmlTemplate: "HTML Template",
    reactTemplate: "React Template",
    renderingIn: "Rendering in",
    rendered: "Rendered",
    overwriteConfirm: "This will overwrite your current code. Continue?"
  },
  zh: {
    appName: "超便利编辑器",
    saved: "已保存",
    unsaved: "未保存...",
    import: "导入",
    export: "导出",
    save: "保存",
    markdownPane: "编辑区",
    previewPane: "预览区",
    chars: "字符",
    placeholder: "在此开始输入 Markdown...",
    saveSuccess: "保存成功",
    asMd: "导出为 .md",
    asTxt: "导出为 .txt",
    untitled: "未命名文档",
    edit: "编辑",
    preview: "预览",
    settings: "设置",
    labs: "实验室 (测试版)",
    aiAssistant: "AI 助手",
    supabaseSync: "Supabase 同步",
    editorMode: "编辑器模式",
    history: "历史记录",
    newDoc: "新建文档",
    delete: "删除",
    apiKey: "Gemini API 密钥",
    apiKeyPlaceholder: "输入您的 API 密钥...",
    layoutFirst: "排版优先模式",
    experimental: "实验性",
    versionHistory: "历史版本",
    restore: "恢复此版本",
    restoreConfirm: "确定要恢复到此版本吗？当前未保存的更改将丢失。",
    noHistory: "暂无历史记录。",
    currentVersion: "当前版本",
    actions: "操作",
    saveVersion: "保存版本",
    htmlTemplate: "HTML 模板",
    reactTemplate: "React 模板",
    renderingIn: "渲染倒计时",
    rendered: "已渲染",
    overwriteConfirm: "这会覆盖您当前的代码，确定继续吗？"
  }
};

const DEFAULT_CODE_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    h1 { color: #2563eb; }
  </style>
</head>
<body>
  <h1>Hello HTML!</h1>
  <p>Edit this code to see changes after 3 seconds.</p>
  <button onclick="alert('Clicked!')">Click Me</button>
</body>
</html>`;

const DEFAULT_CODE_REACT = `<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .card { padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    button { background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #4338ca; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module">
    function App() {
      const [count, React.useState] = React.useState(0);
      return (
        <div className="card">
          <h1>Hello React!</h1>
          <p>Count: {count}</p>
          <button onClick={() => React.useState(c => c + 1)}>Increment</button>
        </div>
      );
    }
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`;

const DEFAULT_MARKDOWN = {
  en: `# Welcome to Super Convenient Editor

This is a modern, responsive Markdown editor with live preview.

## Features

- **Live Preview**: See your changes instantly.
- **Auto Save**: Your work is saved to your browser.
- **Import/Export**: Easily load and save \`.md\` or \`.txt\` files.
- **GitHub Flavored Markdown**: Supports tables, task lists, and more.

### Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet('World');
\`\`\`

### Task List

- [x] Write some markdown
- [ ] Export the file
- [ ] Share with friends
`,
  zh: `# 欢迎使用超便利编辑器

这是一个现代化、响应式的 Markdown 编辑器，支持实时预览。

## 功能特性

- **实时预览**：所见即所得，立即看到修改效果。
- **自动保存**：您的工作会自动保存在浏览器中。
- **导入/导出**：轻松加载和保存 \`.md\` 或 \`.txt\` 文件。
- **GitHub 风格 Markdown**：支持表格、任务列表等扩展语法。

### 代码示例

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet('World');
\`\`\`

### 任务列表

- [x] 编写 Markdown
- [ ] 导出文件
- [ ] 分享给朋友
`
};

// Memoized Markdown component to prevent unnecessary re-renders
const MemoizedMarkdown = memo(({ content }: { content: string }) => (
  <Markdown remarkPlugins={[remarkGfm]}>
    {content}
  </Markdown>
));
MemoizedMarkdown.displayName = 'MemoizedMarkdown';

export default function App() {
  // --- State Management ---
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [documents, setDocuments] = useState<Document[]>(() => {
    storageService.migrateLegacyData();
    return storageService.getDocuments();
  });
  const [currentDocId, setCurrentDocId] = useState<string | null>(() => storageService.getCurrentDocId());
  
  // UI State
  const [isSaved, setIsSaved] = useState(true);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [activePane, setActivePane] = useState<'editor' | 'preview' | null>(null);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[settings.language];
  
  // Get current document
  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0] || {
    id: 'default',
    title: '',
    content: DEFAULT_MARKDOWN[settings.language],
    mode: 'markdown',
    lastModified: Date.now(),
    snapshots: []
  };

  const [markdown, setMarkdown] = useState(currentDoc.content);
  const [filename, setFilename] = useState(currentDoc.title);
  const [editorMode, setEditorMode] = useState<EditorMode>(currentDoc.mode as EditorMode);
  
  // Code Preview State
  const [debouncedCode, setDebouncedCode] = useState(currentDoc.content);
  const [renderCountdown, setRenderCountdown] = useState<number | null>(null);

  // useDeferredValue keeps the UI responsive during heavy markdown rendering
  const deferredMarkdown = useDeferredValue(markdown);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  
  // Sync state when current document changes
  useEffect(() => {
    if (currentDoc) {
      setMarkdown(currentDoc.content);
      setDebouncedCode(currentDoc.content);
      setFilename(currentDoc.title);
      setEditorMode(currentDoc.mode as EditorMode);
      storageService.setCurrentDocId(currentDoc.id);
    }
  }, [currentDocId]);

  // click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = () => {
      setIsExportOpen(false);
      setIsMobileMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Auto-save debounced
  useEffect(() => {
    if (!settings.autoSave) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [markdown, filename, editorMode]);

  // History modal auto-select first snapshot
  useEffect(() => {
    if (isHistoryOpen && currentDoc.snapshots && currentDoc.snapshots.length > 0) {
      setSelectedSnapshot(currentDoc.snapshots[0]);
    } else if (!isHistoryOpen) {
      setSelectedSnapshot(null);
    }
  }, [isHistoryOpen, currentDoc.snapshots]);

  // Code preview debounce logic
  useEffect(() => {
    if (editorMode !== 'code') return;
    
    setRenderCountdown(3);
    
    const interval = setInterval(() => {
      setRenderCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      setDebouncedCode(markdown);
      setRenderCountdown(null);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [markdown, editorMode]);

  // --- Handlers ---

  const handleSave = () => {
    const updatedDocs = documents.map(doc => {
      if (doc.id === currentDoc.id) {
        return { ...doc, content: markdown, title: filename, mode: editorMode, lastModified: Date.now() };
      }
      return doc;
    });
    
    // If it's the default/first doc and not in list, add it
    if (!documents.find(d => d.id === currentDoc.id)) {
      const newDoc: Document = {
        id: currentDoc.id === 'default' ? crypto.randomUUID() : currentDoc.id,
        title: filename,
        content: markdown,
        mode: editorMode,
        lastModified: Date.now(),
        snapshots: []
      };
      updatedDocs.push(newDoc);
      setCurrentDocId(newDoc.id);
    }

    setDocuments(updatedDocs);
    storageService.saveDocuments(updatedDocs);
    setIsSaved(true);
  };

  const handleManualSave = () => {
    const updatedDocs = documents.map(doc => {
      if (doc.id === currentDoc.id) {
        const lastSnapshot = doc.snapshots?.[0];
        let newSnapshots = doc.snapshots || [];
        
        // Only create a snapshot if content changed since last snapshot
        if (!lastSnapshot || lastSnapshot.content !== markdown) {
          const newSnapshot: Snapshot = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            content: markdown
          };
          newSnapshots = [newSnapshot, ...newSnapshots].slice(0, 15); // Keep last 15
        }
        
        return { ...doc, content: markdown, title: filename, mode: editorMode, lastModified: Date.now(), snapshots: newSnapshots };
      }
      return doc;
    });
    
    if (!documents.find(d => d.id === currentDoc.id)) {
      const newSnapshot: Snapshot = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        content: markdown
      };
      const newDoc: Document = {
        id: currentDoc.id === 'default' ? crypto.randomUUID() : currentDoc.id,
        title: filename,
        content: markdown,
        mode: editorMode,
        lastModified: Date.now(),
        snapshots: [newSnapshot]
      };
      updatedDocs.push(newDoc);
      setCurrentDocId(newDoc.id);
    }

    setDocuments(updatedDocs);
    storageService.saveDocuments(updatedDocs);
    setIsSaved(true);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleCreateNew = () => {
    const newDoc: Document = {
      id: crypto.randomUUID(),
      title: '',
      content: DEFAULT_MARKDOWN[settings.language],
      mode: 'markdown',
      lastModified: Date.now(),
      snapshots: []
    };
    const newDocs = [newDoc, ...documents];
    setDocuments(newDocs);
    storageService.saveDocuments(newDocs);
    setCurrentDocId(newDoc.id);
    setIsSidebarOpen(false);
  };

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newDocs = documents.filter(d => d.id !== id);
    setDocuments(newDocs);
    storageService.saveDocuments(newDocs);
    if (currentDocId === id) {
      setCurrentDocId(newDocs[0]?.id || null);
    }
  };

  const handleAiOptimize = async () => {
    setIsAiLoading(true);
    try {
      const result = await aiService.optimizeLayout(markdown, settings.aiApiKey);
      setMarkdown(result.text);
      setIsSaved(false);
    } catch (error: any) {
      alert(error.message || "AI Error");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setIsSaved(false);
  };

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(e.target.value);
    setIsSaved(false);
  };

  const handleExport = (format: 'md' | 'txt') => {
    const blob = new Blob([markdown], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeFilename = filename.trim() || t.untitled;
    a.download = `${safeFilename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newDoc: Document = {
          id: crypto.randomUUID(),
          title: nameWithoutExt,
          content: event.target.result as string,
          mode: 'markdown',
          lastModified: Date.now(),
          snapshots: []
        };
        const newDocs = [newDoc, ...documents];
        setDocuments(newDocs);
        storageService.saveDocuments(newDocs);
        setCurrentDocId(newDoc.id);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRestore = (snapshot: Snapshot) => {
    if (window.confirm(t.restoreConfirm)) {
      setMarkdown(snapshot.content);
      setIsSaved(false);
      setIsHistoryOpen(false);
    }
  };

  const toggleLang = () => {
    const newLang: 'en' | 'zh' = settings.language === 'en' ? 'zh' : 'en';
    const newSettings: AppSettings = { ...settings, language: newLang };
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  const loadTemplate = (type: 'html' | 'react') => {
    if (markdown.trim() && !window.confirm(t.overwriteConfirm)) return;
    const newContent = type === 'html' ? DEFAULT_CODE_HTML : DEFAULT_CODE_REACT;
    setMarkdown(newContent);
    setDebouncedCode(newContent);
    setIsSaved(false);
  };

  // Sync scrolling
  const handleScroll = (e: React.UIEvent<HTMLElement>, source: 'editor' | 'preview') => {
    if (window.innerWidth < 768) return;
    if (activePane !== source) return;
    
    const target = e.target as HTMLElement;
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
    
    if (source === 'editor' && previewRef.current) {
      previewRef.current.scrollTop = percentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
    } else if (source === 'preview' && editorRef.current) {
      editorRef.current.scrollTop = percentage * (editorRef.current.scrollHeight - editorRef.current.clientHeight);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-[#f5f5f5] text-gray-900 font-sans overflow-hidden">
      {/* Sidebar - Document Management */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 z-50 shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-800">{t.history}</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-3">
                <button 
                  onClick={handleCreateNew}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                >
                  <Plus size={18} />
                  {t.newDoc}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {documents.map(doc => (
                  <div 
                    key={doc.id}
                    onClick={() => { setCurrentDocId(doc.id); setIsSidebarOpen(false); }}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${currentDocId === doc.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText size={18} className="shrink-0" />
                      <span className="truncate text-sm font-medium">{doc.title || t.untitled}</span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteDoc(doc.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  {t.supabaseSync} (Coming Soon)
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
          </>
        )}
      </AnimatePresence>

      {/* Main App Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Responsive Header */}
        <header className="flex items-center justify-between px-3 md:px-6 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors shrink-0"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex p-1.5 md:p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
              <LayoutTemplate size={20} className="md:w-6 md:h-6" />
            </div>
            <input
              value={filename}
              onChange={handleFilenameChange}
              className="text-base md:text-xl font-semibold tracking-tight bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none transition-colors w-full max-w-[150px] sm:max-w-xs md:max-w-md px-1 py-0.5 placeholder-gray-400 truncate"
              placeholder={t.untitled}
            />
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500 whitespace-nowrap">
              {isSaved ? (
                <span className="flex items-center gap-1"><Check size={14} /> {t.saved}</span>
              ) : (
                <span className="italic">{t.unsaved}</span>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={handleAiOptimize}
                disabled={isAiLoading}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${isAiLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-100 hover:shadow-md'}`}
                title={t.aiAssistant}
              >
                <Sparkles size={16} className={isAiLoading ? 'animate-pulse' : ''} />
                <span>{t.aiAssistant}</span>
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <input type="file" ref={fileInputRef} onChange={handleImport} accept=".md,.txt" className="hidden" />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload size={14} />
                <span>{t.import}</span>
              </button>
              
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={14} />
                  <span>{t.export}</span>
                </button>
                {isExportOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-200 z-50">
                    <button onClick={() => { handleExport('md'); setIsExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg">{t.asMd}</button>
                    <button onClick={() => { handleExport('txt'); setIsExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 last:rounded-b-lg">{t.asTxt}</button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Clock size={14} />
                <span>{t.versionHistory}</span>
              </button>
              
              <button 
                onClick={handleManualSave}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Save size={14} />
                <span>{t.saveVersion}</span>
              </button>

              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              >
                <Settings size={20} />
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-1.5">
              <button 
                onClick={handleManualSave}
                className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm"
              >
                <Save size={16} />
              </button>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg"
                >
                  <MoreVertical size={18} />
                </button>
                <AnimatePresence>
                  {isMobileMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <button onClick={() => { handleAiOptimize(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border-b border-gray-100">
                        <Sparkles size={16} /> {t.aiAssistant}
                      </button>
                      <button onClick={() => { setIsHistoryOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                        <Clock size={16} /> {t.versionHistory}
                      </button>
                      <button onClick={() => { fileInputRef.current?.click(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                        <Upload size={16} /> {t.import}
                      </button>
                      <button onClick={() => { setIsExportOpen(!isExportOpen); }} className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-2"><Download size={16} /> {t.export}</div>
                        <ChevronRight size={14} />
                      </button>
                      {isExportOpen && (
                        <div className="bg-gray-50 border-b border-gray-100">
                          <button onClick={() => { handleExport('md'); setIsMobileMenuOpen(false); setIsExportOpen(false); }} className="w-full text-left px-10 py-2 text-sm hover:bg-gray-100">{t.asMd}</button>
                          <button onClick={() => { handleExport('txt'); setIsMobileMenuOpen(false); setIsExportOpen(false); }} className="w-full text-left px-10 py-2 text-sm hover:bg-gray-100">{t.asTxt}</button>
                        </div>
                      )}
                      <button onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings size={16} /> {t.settings}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Editor Pane */}
          <div 
            className={`w-full md:w-1/2 flex-col border-r border-gray-200 bg-white h-full ${mobileView === 'editor' ? 'flex' : 'hidden md:flex'}`}
            onMouseEnter={() => setActivePane('editor')}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider shrink-0">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  {editorMode === 'markdown' && <FileText size={14} />}
                  {editorMode === 'code' && <Code size={14} />}
                  {editorMode === 'richtext' && <Type size={14} />}
                  {t.markdownPane}
                </span>
                {/* Mode Switcher Placeholder */}
                <div className="flex bg-gray-200 p-0.5 rounded-md">
                  <button onClick={() => setEditorMode('markdown')} className={`px-1.5 py-0.5 rounded ${editorMode === 'markdown' ? 'bg-white shadow-sm' : ''}`}><FileText size={12} /></button>
                  <button onClick={() => setEditorMode('richtext')} className={`px-1.5 py-0.5 rounded ${editorMode === 'richtext' ? 'bg-white shadow-sm' : ''}`}><Type size={12} /></button>
                  <button onClick={() => setEditorMode('code')} className={`px-1.5 py-0.5 rounded ${editorMode === 'code' ? 'bg-white shadow-sm' : ''}`}><Code size={12} /></button>
                </div>
                {editorMode === 'code' && (
                  <div className="flex gap-1.5 ml-2">
                    <button onClick={() => loadTemplate('html')} className="px-2 py-0.5 bg-indigo-100 hover:bg-indigo-200 rounded text-[10px] font-bold text-indigo-700 transition-colors">{t.htmlTemplate}</button>
                    <button onClick={() => loadTemplate('react')} className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 rounded text-[10px] font-bold text-blue-700 transition-colors">{t.reactTemplate}</button>
                  </div>
                )}
              </div>
              <span className="font-mono">{markdown.length} {t.chars}</span>
            </div>
            <textarea
              ref={editorRef}
              value={markdown}
              onChange={handleTextChange}
              onScroll={(e) => handleScroll(e, 'editor')}
              className="flex-1 w-full p-4 md:p-6 resize-none outline-none font-mono text-sm leading-relaxed text-gray-800 bg-transparent"
              placeholder={t.placeholder}
              spellCheck="false"
            />
          </div>

          {/* Preview Pane */}
          <div 
            className={`w-full md:w-1/2 flex-col bg-[#fcfcfc] h-full ${mobileView === 'preview' ? 'flex' : 'hidden md:flex'}`}
            onMouseEnter={() => setActivePane('preview')}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider shrink-0">
              <span>{t.previewPane}</span>
              {editorMode === 'code' && (
                <span className={`flex items-center gap-1.5 ${renderCountdown !== null ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {renderCountdown !== null ? (
                    <><Clock size={12} className="animate-pulse" /> {t.renderingIn} {renderCountdown}s...</>
                  ) : (
                    <><Check size={12} /> {t.rendered}</>
                  )}
                </span>
              )}
            </div>
            <div 
              ref={previewRef}
              onScroll={(e) => handleScroll(e, 'preview')}
              className={`flex-1 overflow-y-auto pb-24 md:pb-8 ${editorMode === 'code' ? 'p-0' : 'p-4 md:p-8'}`}
            >
              {editorMode === 'code' ? (
                <iframe
                  srcDoc={debouncedCode}
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts"
                  title="Code Preview"
                />
              ) : (
                <div className="prose prose-sm md:prose-base prose-indigo max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-headings:font-semibold prose-a:text-indigo-600 hover:prose-a:text-indigo-500 break-words">
                  <MemoizedMarkdown content={deferredMarkdown} />
                </div>
              )}
            </div>
          </div>

          {/* Mobile View Toggle */}
          <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-xl border border-gray-200 flex p-1 z-40">
            <button onClick={() => setMobileView('editor')} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${mobileView === 'editor' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><Edit2 size={16} />{t.edit}</button>
            <button onClick={() => setMobileView('preview')} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${mobileView === 'preview' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}><Eye size={16} />{t.preview}</button>
          </div>
        </main>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Clock size={18} className="text-indigo-600" />
                  {t.versionHistory} - {currentDoc.title || t.untitled}
                </h3>
                <button onClick={() => setIsHistoryOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Snapshot List */}
                <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/50 overflow-y-auto p-3 shrink-0 h-1/3 md:h-auto">
                  {currentDoc.snapshots && currentDoc.snapshots.length > 0 ? (
                    <div className="space-y-2">
                      {currentDoc.snapshots.map(snap => (
                        <button 
                          key={snap.id}
                          onClick={() => setSelectedSnapshot(snap)}
                          className={`w-full text-left p-3 rounded-xl transition-all border ${selectedSnapshot?.id === snap.id ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-500' : 'bg-transparent border-transparent hover:bg-gray-100'}`}
                        >
                          <div className={`text-sm font-semibold ${selectedSnapshot?.id === snap.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                            {new Date(snap.timestamp).toLocaleString(settings.language === 'zh' ? 'zh-CN' : 'en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {snap.content.slice(0, 40)}...
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                      <History size={32} className="mb-3 opacity-20" />
                      <p className="text-sm">{t.noHistory}</p>
                    </div>
                  )}
                </div>
                
                {/* Snapshot Preview */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                  {selectedSnapshot ? (
                    <>
                      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
                        <span className="text-sm font-medium text-gray-500">
                          {new Date(selectedSnapshot.timestamp).toLocaleString(settings.language === 'zh' ? 'zh-CN' : 'en-US')}
                        </span>
                        <button 
                          onClick={() => handleRestore(selectedSnapshot)}
                          className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          {t.restore}
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#fcfcfc]">
                        <div className="prose prose-sm md:prose-base prose-indigo max-w-none">
                          <Markdown remarkPlugins={[remarkGfm]}>{selectedSnapshot.content}</Markdown>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50/30">
                      <p className="text-sm">{t.versionHistory}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]"
            />
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Settings size={18} />
                  {t.settings}
                </h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Language */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">{t.settings} - {t.appName}</label>
                  <button 
                    onClick={toggleLang}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={18} className="text-gray-500" />
                      <span className="text-sm font-medium">Language / 语言</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600">{settings.language === 'en' ? 'English' : '简体中文'}</span>
                  </button>
                </div>

                {/* AI Config */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Sparkles size={16} className="text-indigo-500" />
                      {t.aiAssistant}
                    </label>
                    <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded font-bold uppercase">{t.experimental}</span>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs text-gray-500">{t.apiKey}</span>
                    <input 
                      type="password"
                      value={settings.aiApiKey || ''}
                      onChange={(e) => {
                        const newSettings: AppSettings = { ...settings, aiApiKey: e.target.value };
                        setSettings(newSettings);
                        storageService.saveSettings(newSettings);
                      }}
                      placeholder={t.apiKeyPlaceholder}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                {/* Labs / Future */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.labs}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300 opacity-60">
                      <div className="flex items-center gap-3">
                        <History size={18} />
                        <span className="text-sm font-medium">{t.supabaseSync}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">OFF</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[-1]"
            />
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 md:bottom-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-6 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg shadow-xl z-50 whitespace-nowrap"
          >
            <Check size={18} className="text-emerald-400" />
            <span className="text-sm font-medium">{t.saveSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
