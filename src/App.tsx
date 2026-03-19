import React, { useState, useEffect, useRef, useDeferredValue, memo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Download, Upload, Save, LayoutTemplate, Check, Globe, 
  Edit2, Eye, Settings, Menu, Plus, Trash2, Sparkles, X,
  FileText, Code, Type, History, Clock, MoreVertical, ChevronRight, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storageService } from './services/storage';
import { aiService } from './services/ai';
import { searchService } from './services/search';
import { viralScriptService, ViralScript } from './services/viralScriptService';
import { pb, isAuthenticated, getCurrentUser } from './services/pocketbase';
import { Document, EditorMode, AppSettings, Snapshot } from './types';

const translations = {
  en: {
    appName: "Super Convenient Editor",
    saved: "Saved",
    unsaved: "Unsaved...",
    import: "Import",
    export: "Export",
    save: "Save & Sync",
    markdownPane: "Markdown",
    previewPane: "Preview",
    chars: "chars",
    placeholder: "Start typing your markdown here...",
    saveSuccess: "Saved & Synced successfully",
    asMd: "As .md",
    asTxt: "As .txt",
    untitled: "Untitled document",
    edit: "Edit",
    preview: "Preview",
    settings: "Settings",
    labs: "Labs (Beta)",
    aiAssistant: "AI Assistant",
    pocketbaseSync: "PocketBase Sync",
    editorMode: "Editor Mode",
    history: "History",
    newDoc: "New Document",
    delete: "Delete",
    apiKey: "API Key",
    apiKeyPlaceholder: "Enter your OpenAI-compatible API key...",
    layoutFirst: "Layout-First Mode",
    experimental: "Experimental",
    versionHistory: "Version History",
    restore: "Restore",
    restoreConfirm: "Restore this version? Unsaved changes will be lost.",
    noHistory: "No history available.",
    currentVersion: "Current Version",
    actions: "Actions",
    saveVersion: "Save & Sync",
    htmlTemplate: "HTML Template",
    reactTemplate: "React Template",
    renderingIn: "Rendering in",
    rendered: "Rendered",
    overwriteConfirm: "This will overwrite your current code. Continue?",
    apiBaseUrl: "API Base URL",
    apiBaseUrlPlaceholder: "https://api.openai.com/v1",
    apiModelId: "Model ID",
    apiModelIdPlaceholder: "gpt-3.5-turbo",
    searchProvider: "Search Provider",
    bingApiKey: "Bing API Key",
    tavilyApiKey: "Tavily API Key",
    searchApiKeyPlaceholder: "Enter API key...",
    movieReview: "Movie Review Script",
    searchAndGenerate: "Search & Generate",
    autoSaving: "Auto-saving...",
    savedStatus: "Saved",
    manualSave: "Save Settings",
    searching: "Searching for references...",
    prewarming: "Pre-warming: Analyzing viral database...",
    reading: "Reading and analyzing content...",
    persona: "Persona",
    personaClassic: "Classic Humorist",
    personaImmersive: "Immersive Storyteller",
    generating: "Generating script...",
    references: "References",
    doubanPriority: "Prioritizing Douban...",
    collect: "Save & Sync",
    collectSuccess: "Successfully collected to viral library!",
    collectTitle: "Script Title",
    collectCategory: "Category",
    collectCategoryPlaceholder: "e.g. Suspense, Sci-Fi...",
    collectPublic: "Make Public",
    collectSubmit: "Confirm Collection",
    collectCancel: "Cancel",
    collectNotes: "Analysis Notes",
    collectNotesPlaceholder: "Add some insights or performance analysis...",
    viralLibrary: "Viral Library",
    download: "Download",
    useAsReference: "Use as Reference",
    referenceSelected: "Reference Selected: ",
    clearReference: "Clear Reference"
  },
  zh: {
    appName: "超便利编辑器",
    saved: "已保存",
    unsaved: "未保存...",
    import: "导入",
    export: "导出",
    save: "保存并同步",
    markdownPane: "编辑区",
    previewPane: "预览区",
    chars: "字符",
    placeholder: "在此开始输入 Markdown...",
    saveSuccess: "保存并同步成功",
    asMd: "导出为 .md",
    asTxt: "导出为 .txt",
    untitled: "未命名文档",
    edit: "编辑",
    preview: "预览",
    settings: "设置",
    labs: "实验室 (测试版)",
    aiAssistant: "AI 助手",
    pocketbaseSync: "PocketBase 同步",
    editorMode: "编辑器模式",
    history: "历史记录",
    newDoc: "新建文档",
    delete: "删除",
    apiKey: "API 密钥",
    apiKeyPlaceholder: "输入 OpenAI 兼容的 API 密钥...",
    layoutFirst: "排版优先模式",
    experimental: "实验性",
    versionHistory: "历史版本",
    restore: "恢复此版本",
    restoreConfirm: "确定要恢复到此版本吗？当前未保存的更改将丢失。",
    noHistory: "暂无历史记录。",
    currentVersion: "当前版本",
    actions: "操作",
    saveVersion: "保存并同步",
    htmlTemplate: "HTML 模板",
    reactTemplate: "React 模板",
    renderingIn: "渲染倒计时",
    rendered: "已渲染",
    overwriteConfirm: "这会覆盖您当前的代码，确定继续吗？",
    apiBaseUrl: "API 代理地址",
    apiBaseUrlPlaceholder: "https://api.openai.com/v1",
    apiModelId: "模型 ID",
    apiModelIdPlaceholder: "gpt-3.5-turbo",
    searchProvider: "搜索服务商",
    bingApiKey: "Bing API 密钥",
    tavilyApiKey: "Tavily API 密钥",
    searchApiKeyPlaceholder: "输入 API 密钥...",
    movieReview: "电影解说文案",
    searchAndGenerate: "搜索并生成",
    autoSaving: "自动保存中...",
    savedStatus: "已保存",
    manualSave: "保存设置",
    searching: "正在搜索参考资料...",
    prewarming: "预热中：正在分析爆款库...",
    reading: "正在阅读并分析内容...",
    persona: "解说人格",
    personaClassic: "幽默说书人",
    personaImmersive: "沉浸式分享者",
    generating: "正在生成文案...",
    references: "参考资料",
    doubanPriority: "优先检索豆瓣...",
    collect: "保存并同步",
    collectSuccess: "已成功收录到爆款库！",
    collectTitle: "文案标题",
    collectCategory: "所属类别",
    collectCategoryPlaceholder: "例如：悬疑、科幻、反转...",
    collectPublic: "公开分享",
    collectSubmit: "确认收录",
    collectCancel: "取消",
    collectNotes: "分析笔记",
    collectNotesPlaceholder: "添加一些见解或表现分析...",
    viralLibrary: "爆款文案库",
    download: "下载文案",
    useAsReference: "设为预热参考",
    referenceSelected: "当前预热参考：",
    clearReference: "取消参考"
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
  const [genProgress, setGenProgress] = useState<string | null>(null);
  const [searchSources, setSearchSources] = useState<{title: string, url: string}[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectData, setCollectData] = useState({ title: '', category: '', notes: '', isPublic: false });
  const [isCollecting, setIsCollecting] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pbConnected, setPbConnected] = useState<boolean | null>(null);
  const [settingsStatus, setSettingsStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [isViralLibraryOpen, setIsViralLibraryOpen] = useState(false);
  const [viralScripts, setViralScripts] = useState<ViralScript[]>([]);
  const [isLoadingViral, setIsLoadingViral] = useState(false);
  const [selectedViralScript, setSelectedViralScript] = useState<ViralScript | null>(null);
  const settingsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstSettingsChange = useRef(true);

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

  // PocketBase Connection Check
  useEffect(() => {
    const checkPocketBase = async () => {
      const isConnected = await viralScriptService.checkConnection();
      setPbConnected(isConnected);
    };
    checkPocketBase();
  }, [settings]);

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

  const handleUnifiedSave = async () => {
    // 1. Local Save (Version History)
    const updatedDocs = documents.map(doc => {
      if (doc.id === currentDoc.id) {
        const lastSnapshot = doc.snapshots?.[0];
        let newSnapshots = doc.snapshots || [];
        
        if (!lastSnapshot || lastSnapshot.content !== markdown) {
          const newSnapshot: Snapshot = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            content: markdown
          };
          newSnapshots = [newSnapshot, ...newSnapshots].slice(0, 15);
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

    // 2. Cloud Sync (PocketBase) if connected - Open Modal
    if (pbConnected) {
      setCollectData(prev => ({ ...prev, title: filename || t.untitled }));
      setIsCollectModalOpen(true);
    } else {
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
    }
  };

  const handleConfirmCloudSync = async () => {
    setIsCollecting(true);
    try {
      await viralScriptService.saveViralScript({
        title: collectData.title || filename || t.untitled,
        content: markdown,
        category: collectData.category,
        analysis_notes: collectData.notes,
        is_public: collectData.isPublic,
      });
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
      setIsCollectModalOpen(false);
    } catch (error) {
      console.error("Cloud sync failed:", error);
      alert("Cloud sync failed. Please check your configuration.");
    } finally {
      setIsCollecting(false);
    }
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

  const handleOpenViralLibrary = async () => {
    setIsViralLibraryOpen(true);
    if (!pbConnected) return;
    setIsLoadingViral(true);
    try {
      const scripts = await viralScriptService.getViralScripts();
      setViralScripts(scripts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingViral(false);
    }
  };

  const handleDownloadViral = (script: ViralScript) => {
    const blob = new Blob([script.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAiOptimize = async () => {
    setIsAiLoading(true);
    try {
      const result = await aiService.optimizeLayout(markdown, settings.aiApiKey, settings.aiBaseUrl, settings.aiModelId);
      setMarkdown(result.text);
      setIsSaved(false);
    } catch (error: any) {
      alert(error.message || "AI Error");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleMovieReview = async () => {
    if (!markdown.trim()) {
      alert(settings.language === 'zh' ? "请先输入电影名称或剧情梗概" : "Please enter movie name or plot summary first");
      return;
    }
    setIsAiLoading(true);
    setGenProgress(t.searching);
    setSearchSources([]);
    
    try {
      let searchContext = "";
      const currentProvider = settings.searchProvider || 'bing';
      const rawInput = markdown.trim();
      const isLongInput = rawInput.length > 50;
      const searchQuery = isLongInput ? rawInput.substring(0, 30) : rawInput;
      
      // 0. Pre-warmup: Search viral database or use selected
      let viralContext = "";
      let isFormattingMode = false;

      if (selectedViralScript) {
        viralContext = `[Selected Viral Reference]\nTitle: ${selectedViralScript.title}\nCategory: ${selectedViralScript.category}\nNotes: ${selectedViralScript.analysis_notes}\nContent: ${selectedViralScript.content}`;
      } else if (pbConnected) {
        setGenProgress(t.prewarming);
        try {
          const similarScripts = await viralScriptService.searchSimilarScripts(searchQuery);
          if (similarScripts && similarScripts.length > 0) {
            viralContext = similarScripts.map((s, i) => 
              `[Viral Reference ${i + 1}]\nTitle: ${s.title}\nCategory: ${s.category}\nNotes: ${s.analysis_notes}\nContent Snippet: ${s.content.substring(0, 500)}...`
            ).join('\n\n');
          } else {
            if (isLongInput) isFormattingMode = true;
          }
        } catch (e) {
          console.warn("Pre-warmup failed", e);
          if (isLongInput) isFormattingMode = true;
        }
      } else {
        if (isLongInput) isFormattingMode = true;
      }

      // 1. Search for references
      setGenProgress(t.searching);
      const doubanQuery = `${searchQuery} site:douban.com`;
      const generalQuery = `${searchQuery} 剧情 电影解说`;
      
      let allResults: any[] = [];
      
      if (currentProvider === 'bing' && settings.bingApiKey) {
        try {
          setGenProgress(t.doubanPriority);
          const doubanResults = await searchService.searchBing(doubanQuery, settings.bingApiKey);
          setGenProgress(t.searching);
          const generalResults = await searchService.searchBing(generalQuery, settings.bingApiKey);
          allResults = [...doubanResults, ...generalResults];
        } catch (searchError) {
          console.warn("Bing search failed", searchError);
        }
      } else if (currentProvider === 'tavily' && settings.tavilyApiKey) {
        try {
          setGenProgress(t.doubanPriority);
          const doubanResults = await searchService.searchTavily(doubanQuery, settings.tavilyApiKey);
          setGenProgress(t.searching);
          const generalResults = await searchService.searchTavily(generalQuery, settings.tavilyApiKey);
          allResults = [...doubanResults, ...generalResults];
        } catch (searchError) {
          console.warn("Tavily search failed", searchError);
        }
      }

      // Filter unique results by URL
      const uniqueResults = Array.from(new Map(allResults.map(item => [item.url, item])).values());
      setSearchSources(uniqueResults.map(r => ({ title: r.title, url: r.url })));
      
      setGenProgress(t.reading);
      searchContext = uniqueResults.map((r, i) => `[Reference ${i + 1}]\nTitle: ${r.title}\nContent: ${r.snippet}\nURL: ${r.url}`).join('\n\n');
      
      setGenProgress(t.generating);
      let finalContent = "";

      if (isFormattingMode) {
        const result = await aiService.formatMessyScript(
          rawInput,
          settings.aiApiKey,
          settings.aiBaseUrl,
          settings.aiModelId,
          searchContext
        );
        finalContent = result.text;
      } else {
        const result = await aiService.generateMovieReview(
          rawInput, 
          settings.aiApiKey, 
          settings.aiBaseUrl, 
          settings.aiModelId, 
          searchContext, 
          viralContext,
          settings.persona
        );
        finalContent = result.text;
      }

      setMarkdown(finalContent);
      setIsSaved(false);

      if (isFormattingMode) {
        setTimeout(() => {
          setIsCollectModalOpen(true);
        }, 500);
      }
    } catch (error: any) {
      alert(error.message || "AI Error");
    } finally {
      setIsAiLoading(false);
      setGenProgress(null);
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

  const saveSettingsToStorage = (newSettings: AppSettings) => {
    storageService.saveSettings(newSettings);
    setSettingsStatus('saved');
    setTimeout(() => setSettingsStatus('idle'), 2000);
  };

  const updateSettings = (newSettings: AppSettings, immediate = false) => {
    setSettings(newSettings);
    setSettingsStatus('saving');
    
    if (settingsTimerRef.current) {
      clearTimeout(settingsTimerRef.current);
    }
    
    if (immediate || isFirstSettingsChange.current) {
      isFirstSettingsChange.current = false;
      saveSettingsToStorage(newSettings);
    } else {
      settingsTimerRef.current = setTimeout(() => {
        saveSettingsToStorage(newSettings);
      }, 5000);
    }
  };

  const toggleLang = () => {
    const newLang: 'en' | 'zh' = settings.language === 'en' ? 'zh' : 'en';
    const newSettings: AppSettings = { ...settings, language: newLang };
    updateSettings(newSettings, true);
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
                  <div className={`w-2 h-2 rounded-full ${pbConnected ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  {t.pocketbaseSync}
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
              <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
                {pbConnected && (
                  <button 
                    onClick={handleOpenViralLibrary}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all text-emerald-700 hover:bg-white hover:shadow-sm"
                    title={t.viralLibrary}
                  >
                    <Globe size={14} />
                    <span>{t.viralLibrary}</span>
                  </button>
                )}
                <button 
                  onClick={handleAiOptimize}
                  disabled={isAiLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isAiLoading ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-700 hover:bg-white hover:shadow-sm'}`}
                  title={t.aiAssistant}
                >
                  <Sparkles size={14} className={isAiLoading ? 'animate-pulse' : ''} />
                  <span>{t.aiAssistant}</span>
                </button>
                <button 
                  onClick={handleMovieReview}
                  disabled={isAiLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isAiLoading ? 'text-gray-400 cursor-not-allowed' : 'text-violet-700 hover:bg-white hover:shadow-sm'}`}
                  title={(settings.searchProvider === 'bing' ? settings.bingApiKey : settings.tavilyApiKey) ? t.searchAndGenerate : t.movieReview}
                >
                  <FileText size={14} className={isAiLoading ? 'animate-pulse' : ''} />
                  <span>{(settings.searchProvider === 'bing' ? settings.bingApiKey : settings.tavilyApiKey) ? t.searchAndGenerate : t.movieReview}</span>
                </button>

              </div>
              
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
                onClick={handleUnifiedSave}
                disabled={isCollecting}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm ${
                  pbConnected 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isCollecting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={14} />
                )}
                <span>{pbConnected ? t.save : t.saveVersion}</span>
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
                onClick={handleUnifiedSave}
                disabled={isCollecting}
                className={`p-2 rounded-lg shadow-sm text-white ${pbConnected ? 'bg-emerald-600' : 'bg-indigo-600'}`}
              >
                {isCollecting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={16} />
                )}
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
                      <button onClick={() => { handleMovieReview(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-violet-700 bg-violet-50/50 hover:bg-violet-50 border-b border-gray-100">
                        <FileText size={16} /> {t.movieReview}
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

        {/* Selected Reference Banner */}
        {selectedViralScript && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-sm shrink-0">
            <div className="flex items-center gap-2 text-emerald-800">
              <Check size={16} className="text-emerald-500" />
              <span className="font-medium">{t.referenceSelected}</span>
              <span className="font-bold truncate max-w-xs md:max-w-md">{selectedViralScript.title}</span>
            </div>
            <button 
              onClick={() => setSelectedViralScript(null)}
              className="text-emerald-600 hover:text-emerald-800 text-xs font-medium flex items-center gap-1 bg-emerald-100/50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors"
            >
              <X size={14} />
              {t.clearReference}
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* AI Progress Overlay */}
          <AnimatePresence>
            {isAiLoading && genProgress && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="w-16 h-16 mb-6 relative">
                  <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{genProgress}</h3>
                
                {searchSources.length > 0 && (
                  <div className="max-w-md w-full mt-4 space-y-2 text-left">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.references}</p>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {searchSources.map((source, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                          <Globe size={14} className="text-gray-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">{source.title}</p>
                            <p className="text-[10px] text-gray-400 truncate">{source.url}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

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

                  {/* Persona Selection */}
                  <div className="space-y-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <label className="text-xs font-bold text-indigo-700 flex items-center gap-2">
                      <User size={14} />
                      {t.persona}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateSettings({ ...settings, persona: 'classic' })}
                        className={`py-2 px-3 rounded-lg border text-[10px] font-bold transition-all ${
                          settings.persona === 'classic'
                            ? 'bg-white border-indigo-500 text-indigo-700 shadow-sm'
                            : 'bg-white/50 border-gray-200 text-gray-500 hover:bg-white'
                        }`}
                      >
                        {t.personaClassic}
                      </button>
                      <button
                        onClick={() => updateSettings({ ...settings, persona: 'immersive' })}
                        className={`py-2 px-3 rounded-lg border text-[10px] font-bold transition-all ${
                          settings.persona === 'immersive'
                            ? 'bg-white border-indigo-500 text-indigo-700 shadow-sm'
                            : 'bg-white/50 border-gray-200 text-gray-500 hover:bg-white'
                        }`}
                      >
                        {t.personaImmersive}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs text-gray-500">{t.apiKey}</span>
                    <input 
                      type="password"
                      value={settings.aiApiKey || ''}
                      onChange={(e) => {
                        const newSettings: AppSettings = { ...settings, aiApiKey: e.target.value };
                        updateSettings(newSettings);
                      }}
                      placeholder={t.apiKeyPlaceholder}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs text-gray-500">{t.apiBaseUrl}</span>
                    <input 
                      type="text"
                      value={settings.aiBaseUrl || ''}
                      onChange={(e) => {
                        const newSettings: AppSettings = { ...settings, aiBaseUrl: e.target.value };
                        updateSettings(newSettings);
                      }}
                      placeholder={t.apiBaseUrlPlaceholder}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs text-gray-500">{t.apiModelId}</span>
                    <input 
                      type="text"
                      value={settings.aiModelId || ''}
                      onChange={(e) => {
                        const newSettings: AppSettings = { ...settings, aiModelId: e.target.value };
                        updateSettings(newSettings);
                      }}
                      placeholder={t.apiModelIdPlaceholder}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Globe size={16} className="text-emerald-500" />
                      {t.searchProvider}
                    </label>
                    <div className="flex gap-2">
                      {['bing', 'tavily'].map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            const newSettings: AppSettings = { ...settings, searchProvider: p as any };
                            updateSettings(newSettings);
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                            (settings.searchProvider || 'bing') === p
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {p.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    
                    {(settings.searchProvider || 'bing') === 'bing' ? (
                      <div className="space-y-1.5">
                        <span className="text-xs text-gray-500">{t.bingApiKey}</span>
                        <input 
                          type="password"
                          value={settings.bingApiKey || ''}
                          onChange={(e) => {
                            const newSettings: AppSettings = { ...settings, bingApiKey: e.target.value };
                            updateSettings(newSettings);
                          }}
                          placeholder={t.searchApiKeyPlaceholder}
                          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <span className="text-xs text-gray-500">{t.tavilyApiKey}</span>
                        <input 
                          type="password"
                          value={settings.tavilyApiKey || ''}
                          onChange={(e) => {
                            const newSettings: AppSettings = { ...settings, tavilyApiKey: e.target.value };
                            updateSettings(newSettings);
                          }}
                          placeholder={t.searchApiKeyPlaceholder}
                          className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Labs / Future */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.labs}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300 opacity-60">
                      <div className="flex items-center gap-3">
                        <History size={18} />
                        <span className="text-sm font-medium">{t.pocketbaseSync}</span>
                      </div>
                      <span className={`text-[10px] font-bold ${pbConnected ? 'text-emerald-500' : 'text-gray-400'}`}>
                        {pbConnected ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AnimatePresence mode="wait">
                    {settingsStatus === 'saving' && (
                      <motion.div 
                        key="saving"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2 text-xs text-indigo-500 font-medium"
                      >
                        <Clock size={12} className="animate-spin" />
                        {t.autoSaving}
                      </motion.div>
                    )}
                    {settingsStatus === 'saved' && (
                      <motion.div 
                        key="saved"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2 text-xs text-emerald-500 font-medium"
                      >
                        <Check size={12} />
                        {t.savedStatus}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      saveSettingsToStorage(settings);
                      setIsSettingsOpen(false);
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={16} />
                    {t.manualSave}
                  </button>
                </div>
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

      {/* Viral Library Modal */}
      <AnimatePresence>
        {isViralLibraryOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden relative z-10"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50 shrink-0">
                <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                  <Globe size={18} />
                  {t.viralLibrary}
                </h3>
                <button onClick={() => setIsViralLibraryOpen(false)} className="p-1 hover:bg-emerald-100 rounded-full transition-colors text-emerald-600">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
                {isLoadingViral ? (
                  <div className="flex flex-col items-center justify-center h-64 text-emerald-600 gap-4">
                    <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium">Loading viral scripts...</p>
                  </div>
                ) : viralScripts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
                    <FileText size={48} className="opacity-20" />
                    <p>No viral scripts found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viralScripts.map((script) => (
                      <div key={script.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-gray-800 line-clamp-2">{script.title}</h4>
                          {script.category && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase shrink-0">
                              {script.category}
                            </span>
                          )}
                        </div>
                        {script.analysis_notes && (
                          <p className="text-xs text-gray-500 line-clamp-2 bg-gray-50 p-2 rounded">
                            <span className="font-semibold text-gray-700">Notes: </span>
                            {script.analysis_notes}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                          {script.content.substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
                          <button 
                            onClick={() => handleDownloadViral(script)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                          >
                            <Download size={14} />
                            {t.download}
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedViralScript(script);
                              setIsViralLibraryOpen(false);
                            }}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                              selectedViralScript?.id === script.id
                                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            }`}
                          >
                            <Check size={14} />
                            {selectedViralScript?.id === script.id ? 'Selected' : t.useAsReference}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViralLibraryOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-0"
            />
          </div>
        )}
      </AnimatePresence>

      {/* Collect Modal */}
      <AnimatePresence>
        {isCollectModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50">
                <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                  <Save size={18} />
                  {t.collect}
                </h3>
                <button onClick={() => setIsCollectModalOpen(false)} className="p-1 hover:bg-emerald-100 rounded-full transition-colors text-emerald-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">{t.collectTitle}</label>
                  <input 
                    type="text"
                    value={collectData.title}
                    onChange={(e) => setCollectData({ ...collectData, title: e.target.value })}
                    placeholder={filename || t.untitled}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">{t.collectCategory}</label>
                  <input 
                    type="text"
                    value={collectData.category}
                    onChange={(e) => setCollectData({ ...collectData, category: e.target.value })}
                    placeholder={t.collectCategoryPlaceholder}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">{t.collectNotes}</label>
                  <textarea 
                    value={collectData.notes}
                    onChange={(e) => setCollectData({ ...collectData, notes: e.target.value })}
                    placeholder={t.collectNotesPlaceholder}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm h-24 resize-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox"
                    id="isPublic"
                    checked={collectData.isPublic}
                    onChange={(e) => setCollectData({ ...collectData, isPublic: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">{t.collectPublic}</label>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={() => setIsCollectModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
                >
                  {t.collectCancel}
                </button>
                <button 
                  onClick={handleConfirmCloudSync}
                  disabled={isCollecting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  {isCollecting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={16} />}
                  {t.collectSubmit}
                </button>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCollectModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-0"
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
