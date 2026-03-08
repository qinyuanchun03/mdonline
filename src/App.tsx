import React, { useState, useEffect, useRef, useDeferredValue, memo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Download, Upload, Save, LayoutTemplate, Check, Globe, Edit2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    preview: "Preview"
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
    preview: "预览"
  }
};

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

### Table

| Feature | Status |
| :--- | :---: |
| Markdown | ✅ |
| Live Preview | ✅ |
| Export | ✅ |
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

### 表格

| 功能 | 状态 |
| :--- | :---: |
| Markdown | ✅ |
| 实时预览 | ✅ |
| 导出 | ✅ |
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
  const [lang, setLang] = useState<'en' | 'zh'>(() => {
    const saved = localStorage.getItem('app-lang');
    if (saved === 'en' || saved === 'zh') return saved;
    return navigator.language.startsWith('zh') ? 'zh' : 'en';
  });
  
  const t = translations[lang];

  const [filename, setFilename] = useState(() => {
    return localStorage.getItem('saved-filename') || '';
  });

  const [markdown, setMarkdown] = useState(() => {
    const saved = localStorage.getItem('saved-markdown');
    return saved || DEFAULT_MARKDOWN[lang];
  });
  
  // useDeferredValue keeps the UI responsive during heavy markdown rendering
  const deferredMarkdown = useDeferredValue(markdown);
  
  const [isSaved, setIsSaved] = useState(true);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [activePane, setActivePane] = useState<'editor' | 'preview' | null>(null);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // click outside to close export dropdown
  useEffect(() => {
    const handleClickOutside = () => setIsExportOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Auto-save debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('saved-markdown', markdown);
      localStorage.setItem('saved-filename', filename);
      setIsSaved(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [markdown, filename]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setIsSaved(false);
  };

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(e.target.value);
    setIsSaved(false);
  };

  const handleManualSave = () => {
    localStorage.setItem('saved-markdown', markdown);
    localStorage.setItem('saved-filename', filename);
    setIsSaved(true);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
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

    // Extract filename without extension
    const nameWithoutExt = file.name.replace(/\\.[^/.]+$/, "");
    setFilename(nameWithoutExt);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMarkdown(event.target.result as string);
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Sync scrolling (only active on desktop where both panes are visible)
  const handleScroll = (e: React.UIEvent<HTMLElement>, source: 'editor' | 'preview') => {
    // Disable sync scroll on mobile view
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

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'zh' : 'en';
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f5f5f5] text-gray-900 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-6 py-3 bg-white border-b border-gray-200 shadow-sm z-10 gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
              <LayoutTemplate size={20} className="md:w-6 md:h-6" />
            </div>
            <input
              value={filename}
              onChange={handleFilenameChange}
              className="text-lg md:text-xl font-semibold tracking-tight bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none transition-colors w-40 sm:w-64 md:w-80 px-1 py-0.5 placeholder-gray-400"
              placeholder={t.untitled}
            />
          </div>
          <button 
            onClick={toggleLang}
            className="md:hidden flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            <Globe size={14} />
            {lang === 'en' ? '中文' : 'EN'}
          </button>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-end pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 whitespace-nowrap shrink-0">
            {isSaved ? (
              <span className="flex items-center gap-1"><Check size={14} /> <span className="hidden sm:inline">{t.saved}</span></span>
            ) : (
              <span className="italic">{t.unsaved}</span>
            )}
          </div>
          
          <button 
            onClick={toggleLang}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-lg hover:bg-gray-200 transition-colors cursor-pointer shrink-0"
            title="Toggle Language"
          >
            <Globe size={16} />
            {lang === 'en' ? '中文' : 'EN'}
          </button>

          <div className="hidden md:block w-px h-6 bg-gray-300 mx-1 shrink-0"></div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".md,.txt" 
            className="hidden" 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
          >
            <Upload size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">{t.import}</span>
          </button>
          
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Download size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">{t.export}</span>
            </button>
            {isExportOpen && (
              <div className="absolute right-0 mt-1 w-28 md:w-32 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-200 z-50">
                <button 
                  onClick={() => { handleExport('md'); setIsExportOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-gray-50 first:rounded-t-lg cursor-pointer"
                >
                  {t.asMd}
                </button>
                <button 
                  onClick={() => { handleExport('txt'); setIsExportOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-gray-50 last:rounded-b-lg cursor-pointer"
                >
                  {t.asTxt}
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleManualSave}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Save size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">{t.save}</span>
          </button>
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
            <span>{t.markdownPane}</span>
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
          <div className="flex items-center px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider shrink-0">
            {t.previewPane}
          </div>
          <div 
            ref={previewRef}
            onScroll={(e) => handleScroll(e, 'preview')}
            className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8"
          >
            <div className="prose prose-sm md:prose-base prose-indigo max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-headings:font-semibold prose-a:text-indigo-600 hover:prose-a:text-indigo-500 break-words">
              <MemoizedMarkdown content={deferredMarkdown} />
            </div>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-xl border border-gray-200 flex p-1 z-40">
          <button 
            onClick={() => setMobileView('editor')} 
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${mobileView === 'editor' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Edit2 size={16} />
            {t.edit}
          </button>
          <button 
            onClick={() => setMobileView('preview')} 
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${mobileView === 'preview' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Eye size={16} />
            {t.preview}
          </button>
        </div>
      </main>

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
