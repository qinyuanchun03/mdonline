import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Download, Upload, Save, LayoutTemplate, Check, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const translations = {
  en: {
    appName: "Super Convenient Editor",
    saved: "Saved",
    unsaved: "Unsaved changes...",
    import: "Import",
    export: "Export",
    save: "Save",
    markdownPane: "Markdown",
    previewPane: "Preview",
    chars: "chars",
    placeholder: "Start typing your markdown here...",
    saveSuccess: "Saved successfully",
    asMd: "As .md",
    asTxt: "As .txt"
  },
  zh: {
    appName: "超便利编辑器",
    saved: "已保存",
    unsaved: "有未保存的更改...",
    import: "导入",
    export: "导出",
    save: "保存",
    markdownPane: "编辑区",
    previewPane: "预览区",
    chars: "字符",
    placeholder: "在此开始输入 Markdown...",
    saveSuccess: "保存成功",
    asMd: "导出为 .md",
    asTxt: "导出为 .txt"
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

export default function App() {
  const [lang, setLang] = useState<'en' | 'zh'>(() => {
    const saved = localStorage.getItem('app-lang');
    if (saved === 'en' || saved === 'zh') return saved;
    return navigator.language.startsWith('zh') ? 'zh' : 'en';
  });
  
  const t = translations[lang];

  const [markdown, setMarkdown] = useState(() => {
    const saved = localStorage.getItem('saved-markdown');
    return saved || DEFAULT_MARKDOWN[lang];
  });
  
  const [isSaved, setIsSaved] = useState(true);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [activePane, setActivePane] = useState<'editor' | 'preview' | null>(null);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('saved-markdown', markdown);
      setIsSaved(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [markdown]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setIsSaved(false);
  };

  const handleManualSave = () => {
    localStorage.setItem('saved-markdown', markdown);
    setIsSaved(true);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleExport = (format: 'md' | 'txt') => {
    const blob = new Blob([markdown], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  // Sync scrolling
  const handleScroll = (e: React.UIEvent<HTMLElement>, source: 'editor' | 'preview') => {
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
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <LayoutTemplate size={24} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">{t.appName}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mr-2">
            {isSaved ? (
              <span className="flex items-center gap-1"><Check size={14} /> {t.saved}</span>
            ) : (
              <span className="italic">{t.unsaved}</span>
            )}
          </div>
          
          <button 
            onClick={toggleLang}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            title="Toggle Language"
          >
            <Globe size={16} />
            {lang === 'en' ? '中文' : 'EN'}
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".md,.txt" 
            className="hidden" 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Upload size={16} />
            {t.import}
          </button>
          
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Download size={16} />
              {t.export}
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button 
                onClick={() => handleExport('md')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg cursor-pointer"
              >
                {t.asMd}
              </button>
              <button 
                onClick={() => handleExport('txt')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 last:rounded-b-lg cursor-pointer"
              >
                {t.asTxt}
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleManualSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            <Save size={16} />
            {t.save}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        <div 
          className="w-1/2 flex flex-col border-r border-gray-200 bg-white"
          onMouseEnter={() => setActivePane('editor')}
        >
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span>{t.markdownPane}</span>
            <span className="font-mono">{markdown.length} {t.chars}</span>
          </div>
          <textarea
            ref={editorRef}
            value={markdown}
            onChange={handleTextChange}
            onScroll={(e) => handleScroll(e, 'editor')}
            className="flex-1 w-full p-6 resize-none outline-none font-mono text-sm leading-relaxed text-gray-800 bg-transparent"
            placeholder={t.placeholder}
            spellCheck="false"
          />
        </div>

        {/* Preview Pane */}
        <div 
          className="w-1/2 flex flex-col bg-[#fcfcfc]"
          onMouseEnter={() => setActivePane('preview')}
        >
          <div className="flex items-center px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            {t.previewPane}
          </div>
          <div 
            ref={previewRef}
            onScroll={(e) => handleScroll(e, 'preview')}
            className="flex-1 overflow-y-auto p-8"
          >
            <div className="prose prose-indigo max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-headings:font-semibold prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
              <Markdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </Markdown>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg shadow-xl z-50"
          >
            <Check size={18} className="text-emerald-400" />
            <span className="text-sm font-medium">{t.saveSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}