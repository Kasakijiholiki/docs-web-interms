import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Image as ImageIcon,
  Smile,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Columns,
  Eye,
  FileCode,
  CheckCircle2,
  Type,
  AlertTriangle,
  Info,
  Lightbulb,
  ListPlus,
  Palette,
  Highlighter,
  ChevronDown,
} from 'lucide-react';
import type { DocItem, Category } from '../types/doc';
import { SymbolsPicker } from './SymbolsPicker';
import { ImageInsertModal } from './ImageInsertModal';
import { QuickCategoryPopover } from './QuickCategoryPopover';

interface DocEditorProps {
  doc: DocItem;
  categories: Category[];
  onSaveDoc: (updatedDoc: DocItem) => void;
  onCancel: () => void;
  onAddCategory?: (category: Category) => void;
}

export const DocEditor: React.FC<DocEditorProps> = ({
  doc,
  categories,
  onSaveDoc,
  onCancel,
  onAddCategory,
}) => {
  const [title, setTitle] = useState(doc.title);
  const [category, setCategory] = useState(doc.category);
  const [badge, setBadge] = useState(doc.badge || '');
  const [description, setDescription] = useState(doc.description || '');
  const [contentHtml, setContentHtml] = useState(doc.content);

  const [editorMode, setEditorMode] = useState<'visual' | 'split' | 'source'>('visual');

  const [isSymbolsOpen, setIsSymbolsOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false);

  const [showSavedToast, setShowSavedToast] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  useEffect(() => {
    setTitle(doc.title);
    setCategory(doc.category);
    setBadge(doc.badge || '');
    setDescription(doc.description || '');
    setContentHtml(doc.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = doc.content;
    }
  }, [doc.id]);

  const saveCurrentSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
  };

  const handleContentInput = () => {
    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (editorMode === 'source') return;
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleContentInput();
  };

  const insertHtmlSnippet = (snippetHtml: string) => {
    editorRef.current?.focus();
    restoreSelection();

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const el = document.createElement('div');
      el.innerHTML = snippetHtml;
      const frag = document.createDocumentFragment();
      let node: ChildNode | null;
      let lastNode: ChildNode | null = null;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);

      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      if (editorRef.current) {
        editorRef.current.innerHTML += snippetHtml;
      }
    }
    handleContentInput();
  };

  const handleSelectSymbol = (sym: string) => {
    insertHtmlSnippet(sym);
    setIsSymbolsOpen(false);
  };

  const handleInsertCallout = (type: 'tip' | 'info' | 'warning' | 'danger') => {
    const configs = {
      tip: { icon: '💡', title: 'Tip', text: 'Add your recommendation here.' },
      info: { icon: 'ℹ️', title: 'Note', text: 'Important information to remember.' },
      warning: { icon: '⚠️', title: 'Warning', text: 'Cautionary note regarding this action.' },
      danger: { icon: '🚨', title: 'Caution', text: 'High risk or irreversible operation.' },
    };
    const c = configs[type];
    const snippet = `
      <div class="callout callout-${type}">
        <div class="callout-icon">${c.icon}</div>
        <div class="callout-body">
          <strong>${c.title}</strong>
          <p>${c.text}</p>
        </div>
      </div>
      <p></p>
    `;
    insertHtmlSnippet(snippet);
  };

  const handleInsertStepGuide = () => {
    const snippet = `
      <div class="steps-container">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>Initial Step</h4>
            <p>Describe the first action clearly.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>Follow-up Action</h4>
            <p>Describe subsequent details.</p>
          </div>
        </div>
      </div>
      <p></p>
    `;
    insertHtmlSnippet(snippet);
  };

  const handleInsertCodeBlock = () => {
    const snippet = `
      <div class="code-block">
        <div class="code-header">
          <span>bash</span>
          <button class="copy-button">Copy</button>
        </div>
        <pre><code>npm run dev</code></pre>
      </div>
      <p></p>
    `;
    insertHtmlSnippet(snippet);
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const font = e.target.value;
    if (font) {
      executeCommand('fontName', font);
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value;
    if (!size) return;
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const span = document.createElement('span');
      span.style.fontSize = size;
      const range = sel.getRangeAt(0);
      try {
        range.surroundContents(span);
      } catch {
        executeCommand('fontSize', '4');
      }
      handleContentInput();
    }
  };

  const handleCategoryChange = (val: string) => {
    if (val === '__CREATE_NEW__') {
      const newName = window.prompt('Enter new category name:');
      if (newName && newName.trim()) {
        const trimmed = newName.trim();
        const existing = categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
        if (existing) {
          setCategory(existing.name);
        } else {
          const newCat: Category = {
            id: `cat-${Date.now()}`,
            name: trimmed,
            iconName: 'BookOpen',
            order: categories.length + 1,
          };
          onAddCategory?.(newCat);
          setCategory(trimmed);
        }
      }
    } else {
      setCategory(val);
    }
  };

  const handleSave = () => {
    const updated: DocItem = {
      ...doc,
      title: title.trim() || 'Untitled Document',
      category,
      badge: badge.trim(),
      description: description.trim(),
      content: contentHtml,
      updatedAt: new Date().toISOString(),
    };
    onSaveDoc(updated);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const colors = [
    { label: 'Default', value: '#1d1d1f' },
    { label: 'Secondary', value: '#86868b' },
    { label: 'Blue', value: '#0071e3' },
    { label: 'Green', value: '#34c759' },
    { label: 'Orange', value: '#ff9500' },
    { label: 'Red', value: '#ff3b30' },
    { label: 'Purple', value: '#af52de' },
  ];

  const highlights = [
    { label: 'None', value: 'transparent' },
    { label: 'Yellow', value: '#ffef9f' },
    { label: 'Green', value: '#c7f6d4' },
    { label: 'Blue', value: '#c7e5ff' },
    { label: 'Pink', value: '#ffd1e8' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbfbfd] overflow-hidden">
      {/* Apple-style Top Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-neutral-200/70 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-900">
            Pages
          </span>
          <span className="text-xs text-neutral-300">/</span>
          <span className="text-xs text-neutral-500 truncate max-w-xs">{title}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Segmented Mode Control */}
          <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/60">
            <button
              onClick={() => {
                if (editorRef.current) editorRef.current.innerHTML = contentHtml;
                setEditorMode('visual');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                editorMode === 'visual'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Visual</span>
            </button>
            <button
              onClick={() => {
                if (editorRef.current) editorRef.current.innerHTML = contentHtml;
                setEditorMode('split');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                editorMode === 'split'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setEditorMode('source')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                editorMode === 'source'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <FileCode className="w-3 h-3" />
              <span>HTML</span>
            </button>
          </div>

          <button
            onClick={onCancel}
            className="px-3 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"
          >
            Done
          </button>
          <button
            onClick={handleSave}
            className="px-3.5 py-1 text-xs font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-md transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Meta Header */}
      <div className="bg-white border-b border-neutral-200/60 px-6 py-3 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
        <div className="md:col-span-4">
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-2.5 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">
            Category
          </label>
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full appearance-none pl-2.5 pr-7 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400 bg-white text-neutral-800 cursor-pointer font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
                {!categories.some((c) => c.name === category) && (
                  <option value={category}>{category}</option>
                )}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {onAddCategory && (
              <QuickCategoryPopover
                categories={categories}
                onAddCategory={onAddCategory}
                onCategoryCreated={(newCatName) => setCategory(newCatName)}
              />
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">
            Badge
          </label>
          <input
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className="w-full px-2.5 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-2.5 py-1 text-xs border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
          />
        </div>
      </div>

      {/* Apple Pages-style Clean Floating / Docked Toolbar */}
      {editorMode !== 'source' && (
        <div className="bg-white border-b border-neutral-200/60 px-6 py-1.5 flex flex-wrap items-center gap-1 text-neutral-700 select-none">
          {/* Font Selector */}
          <div className="flex items-center pr-2 border-r border-neutral-200/80">
            <Type className="w-3.5 h-3.5 text-neutral-400 mr-1" />
            <select
              onChange={handleFontFamilyChange}
              defaultValue=""
              className="text-xs bg-transparent border-0 font-normal text-neutral-700 focus:ring-0 cursor-pointer pr-4"
            >
              <option value="">System Sans</option>
              <option value="Georgia, serif">Editorial Serif</option>
              <option value="ui-monospace, monospace">Mono Code</option>
            </select>
          </div>

          {/* Size */}
          <div className="flex items-center pr-2 border-r border-neutral-200/80">
            <select
              onChange={handleFontSizeChange}
              defaultValue=""
              className="text-xs bg-transparent border-0 font-normal text-neutral-700 focus:ring-0 cursor-pointer pr-4"
            >
              <option value="">Size: 16px</option>
              <option value="13px">13px</option>
              <option value="15px">15px</option>
              <option value="17px">17px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="32px">32px</option>
            </select>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200/80">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand('formatBlock', '<h1>');
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition-colors"
              title="H1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand('formatBlock', '<h2>');
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition-colors"
              title="H2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand('formatBlock', '<h3>');
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition-colors"
              title="H3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bold, Italic, Underline, Strikethrough, Code */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200/80">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand('bold');
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition-colors"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand('italic');
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition-colors"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand('underline');
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition-colors"
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand('strikeThrough');
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition-colors"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                const sel = window.getSelection();
                if (sel && !sel.isCollapsed) {
                  insertHtmlSnippet(`<code>${sel.toString()}</code>`);
                }
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition-colors"
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 pr-2 border-r border-neutral-200/80 relative">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                saveCurrentSelection();
                setIsColorPickerOpen(!isColorPickerOpen);
                setIsHighlightPickerOpen(false);
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition-colors"
              title="Color"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {isColorPickerOpen && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                className="absolute z-50 left-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg p-2 shadow-md flex gap-1.5"
              >
                {colors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      restoreSelection();
                      executeCommand('foreColor', c.value);
                      setIsColorPickerOpen(false);
                    }}
                    className="w-4 h-4 rounded-full border border-neutral-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            )}

            <button
              onMouseDown={(e) => {
                e.preventDefault();
                saveCurrentSelection();
                setIsHighlightPickerOpen(!isHighlightPickerOpen);
                setIsColorPickerOpen(false);
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition-colors"
              title="Highlight"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-500" />
            </button>

            {isHighlightPickerOpen && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                className="absolute z-50 left-6 top-full mt-1 bg-white border border-neutral-200 rounded-lg p-2 shadow-md flex gap-1.5"
              >
                {highlights.map((h) => (
                  <button
                    key={h.value}
                    onClick={() => {
                      restoreSelection();
                      executeCommand('hiliteColor', h.value);
                      setIsHighlightPickerOpen(false);
                    }}
                    className="w-4 h-4 rounded border border-neutral-300 hover:scale-110 transition-transform flex items-center justify-center text-[8px]"
                    style={{ backgroundColor: h.value }}
                    title={h.label}
                  >
                    {h.value === 'transparent' ? '✕' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200/80">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand('insertUnorderedList');
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition-colors"
              title="Bullets"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand('insertOrderedList');
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition-colors"
              title="Numbers"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand('formatBlock', '<blockquote>');
              }}
              className="p-1 hover:bg-neutral-100 rounded text-neutral-700 transition-colors"
              title="Quote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Symbols */}
          <div className="relative pr-2 border-r border-neutral-200/80">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                saveCurrentSelection();
                setIsSymbolsOpen(!isSymbolsOpen);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs font-normal text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Symbols</span>
            </button>

            <SymbolsPicker
              isOpen={isSymbolsOpen}
              onClose={() => setIsSymbolsOpen(false)}
              onSelectSymbol={handleSelectSymbol}
            />
          </div>

          {/* Image */}
          <div className="pr-2 border-r border-neutral-200/80">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                saveCurrentSelection();
                setIsImageModalOpen(true);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs font-normal text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image</span>
            </button>
          </div>

          {/* Doc Blocks */}
          <div className="flex items-center gap-1 pl-1">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                saveCurrentSelection();
                handleInsertCallout('tip');
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 rounded transition-colors"
            >
              <Lightbulb className="w-3 h-3" />
              <span>Tip</span>
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                saveCurrentSelection();
                handleInsertCallout('info');
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-800 bg-blue-50 hover:bg-blue-100/70 rounded transition-colors"
            >
              <Info className="w-3 h-3" />
              <span>Note</span>
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                saveCurrentSelection();
                handleInsertCallout('warning');
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100/70 rounded transition-colors"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Warning</span>
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                saveCurrentSelection();
                handleInsertStepGuide();
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200/60 rounded transition-colors"
            >
              <ListPlus className="w-3 h-3" />
              <span>Steps</span>
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                saveCurrentSelection();
                handleInsertCodeBlock();
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200/60 rounded transition-colors"
            >
              <Code className="w-3 h-3" />
              <span>Code</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {editorMode === 'visual' && (
          <div className="flex-1 overflow-y-auto p-8 bg-[#fbfbfd] flex justify-center">
            <div className="w-full max-w-3xl bg-white rounded-xl border border-neutral-200/80 p-8 min-h-[600px]">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleContentInput}
                className="doc-content outline-none min-h-[500px]"
                suppressContentEditableWarning
              />
            </div>
          </div>
        )}

        {editorMode === 'split' && (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 bg-white border-r border-neutral-200">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Editor
              </div>
              <div
                ref={editorRef}
                contentEditable
                onInput={handleContentInput}
                className="doc-content outline-none min-h-[500px]"
                suppressContentEditableWarning
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#fbfbfd]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Preview
              </div>
              <div
                className="doc-content bg-white p-6 rounded-xl border border-neutral-200/80"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </div>
          </div>
        )}

        {editorMode === 'source' && (
          <div className="flex-1 flex flex-col p-6 bg-[#1c1c1e] text-neutral-100 overflow-hidden">
            <textarea
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              className="flex-1 font-mono text-xs bg-[#141416] p-4 rounded-xl border border-neutral-800 text-neutral-200 focus:outline-none focus:border-neutral-600 resize-none leading-relaxed"
            />
          </div>
        )}
      </div>

      <ImageInsertModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsertImage={insertHtmlSnippet}
      />

      {/* Apple-style Discreet Toast */}
      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-lg animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Saved</span>
        </div>
      )}
    </div>
  );
};
