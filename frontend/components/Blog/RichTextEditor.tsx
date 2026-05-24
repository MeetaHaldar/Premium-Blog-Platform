'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare,
  Quote, Code, Code2,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Image as ImageIcon,
  Undo, Redo, Highlighter,
  Minus, Type, Check, X, ExternalLink, Trash2
} from 'lucide-react';
import { useCallback, useRef, useState, useEffect } from 'react';

// Only register languages we need — avoids loading all 100+ grammars (~800KB → ~50KB)
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('js', javascript);
lowlight.register('typescript', typescript);
lowlight.register('ts', typescript);
lowlight.register('python', python);
lowlight.register('py', python);
lowlight.register('css', css);
lowlight.register('html', xml);
lowlight.register('xml', xml);
lowlight.register('bash', bash);
lowlight.register('sh', bash);
lowlight.register('json', json);
lowlight.register('sql', sql);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

function ToolBtn({ onClick, active = false, disabled = false, title, children }: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick}
      className={`p-1.5 rounded text-sm transition-all duration-100 flex items-center justify-center
        ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >{children}</button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1 self-center" />;
}

// Inline link popover — no window.prompt
function LinkPopover({ editor, onClose }: { editor: any; onClose: () => void }) {
  const [url, setUrl] = useState(editor.getAttributes('link').href || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when popover opens
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const apply = () => {
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const href = url.startsWith('http') ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    onClose();
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); apply(); }
    if (e.key === 'Escape') { onClose(); }
  };

  const isExisting = !!editor.getAttributes('link').href;

  return (
    <div className="absolute z-50 top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-80">
      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Insert Link</p>
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
        <LinkIcon size={14} className="text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={handleKey}
          placeholder="https://example.com"
          className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
        />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button type="button" onClick={apply}
          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm py-1.5 rounded-lg hover:bg-blue-700 transition font-medium">
          <Check size={13} /> Apply
        </button>
        {isExisting && (
          <button type="button" onClick={remove}
            className="flex items-center gap-1.5 text-red-500 border border-red-200 text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
            <Trash2 size={13} /> Remove
          </button>
        )}
        <button type="button" onClick={onClose}
          className="flex items-center justify-center text-gray-400 border border-gray-200 p-1.5 rounded-lg hover:bg-gray-100 transition">
          <X size={13} />
        </button>
      </div>
      {url && (
        <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-500 hover:underline mt-2 truncate">
          <ExternalLink size={11} /> {url}
        </a>
      )}
    </div>
  );
}

// Inline image URL popover
function ImageUrlPopover({ onInsert, onClose }: { onInsert: (url: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  const apply = () => { if (url.trim()) { onInsert(url.trim()); onClose(); } };
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); apply(); }
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="absolute z-50 top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-80">
      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Insert Image URL</p>
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
        <ImageIcon size={14} className="text-gray-400 flex-shrink-0" />
        <input ref={inputRef} type="url" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={handleKey}
          placeholder="https://example.com/image.jpg"
          className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400" />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button type="button" onClick={apply} disabled={!url.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm py-1.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition font-medium">
          <Check size={13} /> Insert
        </button>
        <button type="button" onClick={onClose}
          className="flex items-center justify-center text-gray-400 border border-gray-200 p-1.5 rounded-lg hover:bg-gray-100 transition">
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const linkBtnRef = useRef<HTMLDivElement>(null);
  const imgBtnRef = useRef<HTMLDivElement>(null);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [showImgPopover, setShowImgPopover] = useState(false);

  // Close popovers on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (linkBtnRef.current && !linkBtnRef.current.contains(e.target as Node)) setShowLinkPopover(false);
      if (imgBtnRef.current && !imgBtnRef.current.contains(e.target as Node)) setShowImgPopover(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const editor = useEditor({
    immediatelyRender: false, // fix SSR hydration mismatch warning
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3] } }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({ inline: false, allowBase64: true }),
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' } }),
      Placeholder.configure({ placeholder: 'Start writing your blog post here...' }),
      CodeBlockLowlight.configure({ lowlight, HTMLAttributes: { class: 'not-prose' } })
    ],
    content,
    editorProps: { attributes: { class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] px-6 py-5' } },
    onUpdate: ({ editor }) => onChange(editor.getHTML())
  });

  const insertImage = useCallback((src: string) => {
    if (!editor || !src) return;
    editor.chain().focus().setImage({ src }).run();
  }, [editor]);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { if (ev.target?.result) insertImage(ev.target.result as string); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="h-12 bg-gray-50 border-b border-gray-200 animate-pulse" />
        <div className="min-h-96 p-6 animate-pulse space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${70 + i * 5}%` }} />)}
        </div>
      </div>
    );
  }

  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">

      {/* ── Toolbar ── */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex flex-wrap items-center gap-0.5">

        <ToolBtn title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo size={15} /></ToolBtn>
        <ToolBtn title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo size={15} /></ToolBtn>
        <Divider />

        <ToolBtn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={15} /></ToolBtn>
        <ToolBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={15} /></ToolBtn>
        <ToolBtn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={15} /></ToolBtn>
        <ToolBtn title="Paragraph" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}><Type size={15} /></ToolBtn>
        <Divider />

        <ToolBtn title="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={15} /></ToolBtn>
        <ToolBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={15} /></ToolBtn>
        <ToolBtn title="Highlight" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}><Highlighter size={15} /></ToolBtn>
        <Divider />

        <ToolBtn title="Align Left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={15} /></ToolBtn>
        <ToolBtn title="Align Center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={15} /></ToolBtn>
        <ToolBtn title="Align Right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={15} /></ToolBtn>
        <Divider />

        <ToolBtn title="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15} /></ToolBtn>
        <ToolBtn title="Numbered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} /></ToolBtn>
        <ToolBtn title="Task List" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()}><CheckSquare size={15} /></ToolBtn>
        <Divider />

        <ToolBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={15} /></ToolBtn>
        <ToolBtn title="Inline Code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}><Code size={15} /></ToolBtn>
        <ToolBtn title="Code Block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 size={15} /></ToolBtn>
        <ToolBtn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={15} /></ToolBtn>
        <Divider />

        {/* Link button with inline popover */}
        <div ref={linkBtnRef} className="relative">
          <ToolBtn title="Insert / Edit Link" active={editor.isActive('link') || showLinkPopover}
            onClick={() => { setShowImgPopover(false); setShowLinkPopover(v => !v); }}>
            <LinkIcon size={15} />
          </ToolBtn>
          {showLinkPopover && <LinkPopover editor={editor} onClose={() => setShowLinkPopover(false)} />}
        </div>

        {/* Image URL button with inline popover */}
        <div ref={imgBtnRef} className="relative">
          <ToolBtn title="Insert Image from URL" active={showImgPopover}
            onClick={() => { setShowLinkPopover(false); setShowImgPopover(v => !v); }}>
            <ImageIcon size={15} />
          </ToolBtn>
          {showImgPopover && <ImageUrlPopover onInsert={insertImage} onClose={() => setShowImgPopover(false)} />}
        </div>

        {/* Upload image from file */}
        <label title="Upload Image from File"
          className="p-1.5 rounded text-sm transition-all duration-100 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
          <span className="text-xs font-medium px-1">IMG↑</span>
        </label>
      </div>

      {/* ── Bubble Menu on text selection ── */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}
        className="flex items-center gap-0.5 bg-gray-900 text-white rounded-lg shadow-xl px-2 py-1.5 border border-gray-700">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1 rounded ${editor.isActive('bold') ? 'bg-blue-500' : 'hover:bg-gray-700'}`}><Bold size={13} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1 rounded ${editor.isActive('italic') ? 'bg-blue-500' : 'hover:bg-gray-700'}`}><Italic size={13} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1 rounded ${editor.isActive('underline') ? 'bg-blue-500' : 'hover:bg-gray-700'}`}><UnderlineIcon size={13} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={`p-1 rounded ${editor.isActive('highlight') ? 'bg-blue-500' : 'hover:bg-gray-700'}`}><Highlighter size={13} /></button>
        <div className="w-px h-4 bg-gray-600 mx-0.5" />
        <button type="button" onClick={() => { setShowImgPopover(false); setShowLinkPopover(v => !v); }}
          className={`p-1 rounded ${editor.isActive('link') ? 'bg-blue-500' : 'hover:bg-gray-700'}`}><LinkIcon size={13} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={`p-1 rounded ${editor.isActive('code') ? 'bg-blue-500' : 'hover:bg-gray-700'}`}><Code size={13} /></button>
      </BubbleMenu>

      {/* ── Editor Content ── */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* ── Footer ── */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
        <span>{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
        <span className="hidden sm:block">Ctrl+B Bold · Ctrl+I Italic · Select text for quick format</span>
      </div>
    </div>
  );
}
