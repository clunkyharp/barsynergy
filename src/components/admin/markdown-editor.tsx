'use client';

import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useState, type TextareaHTMLAttributes } from 'react';
import {
  Bold, Eye, Heading2, Heading3, Italic, Link,
  List, ListOrdered, Minus, Pen, Quote, Redo2, Undo2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';

type EditorMode = 'edit' | 'preview';

type FormatDef = {
  before: string;
  after: string;
  block: boolean;
  icon: React.ComponentType<{ size?: number }>;
  title: string;
};

const FORMATS = {
  bold:   { before: '**',        after: '**',     block: false, icon: Bold,        title: 'Жирный (Ctrl+B)' },
  italic: { before: '_',         after: '_',      block: false, icon: Italic,      title: 'Курсив (Ctrl+I)' },
  h2:     { before: '## ',       after: '',       block: true,  icon: Heading2,    title: 'Заголовок 2' },
  h3:     { before: '### ',      after: '',       block: true,  icon: Heading3,    title: 'Заголовок 3' },
  ul:     { before: '- ',        after: '',       block: true,  icon: List,        title: 'Список' },
  ol:     { before: '1. ',       after: '',       block: true,  icon: ListOrdered, title: 'Нумерованный список' },
  link:   { before: '[',         after: '](url)', block: false, icon: Link,        title: 'Ссылка (Ctrl+K)' },
  quote:  { before: '> ',        after: '',       block: true,  icon: Quote,       title: 'Цитата' },
  hr:     { before: '\n\n---\n\n', after: '',     block: false, icon: Minus,       title: 'Разделитель' },
} as const satisfies Record<string, FormatDef>;

type FormatKey = keyof typeof FORMATS;

function applyInlineFormat(value: string, start: number, end: number, before: string, after: string) {
  if (start === end) {
    const v = value.slice(0, start) + before + after + value.slice(end);
    return { value: v, selectionStart: start + before.length, selectionEnd: start + before.length };
  }
  const selected = value.slice(start, end);
  if (selected.startsWith(before) && selected.endsWith(after) && selected.length >= before.length + after.length + 1) {
    const inner = selected.slice(before.length, -after.length);
    return { value: value.slice(0, start) + inner + value.slice(end), selectionStart: start, selectionEnd: start + inner.length };
  }
  return {
    value: value.slice(0, start) + before + selected + after + value.slice(end),
    selectionStart: start, selectionEnd: end + before.length + after.length,
  };
}

function applyBlockFormat(value: string, start: number, _end: number, prefix: string) {
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const nextNl = value.indexOf('\n', start);
  const lineEnd = nextNl === -1 ? value.length : nextNl;
  const line = value.slice(lineStart, lineEnd);
  if (line.startsWith(prefix)) {
    const shift = Math.min(prefix.length, start - lineStart);
    return { value: value.slice(0, lineStart) + line.slice(prefix.length) + value.slice(lineEnd), selectionStart: start - shift, selectionEnd: start - shift };
  }
  return { value: value.slice(0, lineStart) + prefix + line + value.slice(lineEnd), selectionStart: start + prefix.length, selectionEnd: start + prefix.length };
}

const LIST_PREFIX_RE = /^(\s*)([-*]|\d+\.)\s/;
const ORDERED_LIST_RE = /^(\s*)(\d+)\.\s/;

// ── Floating toolbar: position measurement ──────────────────────────────────

type FloatAnchor = { top: number; bottom: number; centerX: number; above: boolean };

function measureSelectionAnchor(el: HTMLTextAreaElement): FloatAnchor | null {
  const { selectionStart: ss, selectionEnd: se } = el;
  if (ss === se) return null;

  const mirror = document.createElement('div');
  const cs = window.getComputedStyle(el);

  for (const p of [
    'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight',
    'letterSpacing', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'boxSizing',
  ]) {
    const style = mirror.style as unknown as Record<string, string>;
    const csStyle = cs as unknown as Record<string, string>;
    style[p] = csStyle[p];
  }

  Object.assign(mirror.style, {
    position: 'fixed', top: '0', left: '-9999px',
    width: `${el.offsetWidth}px`, visibility: 'hidden', overflow: 'hidden',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word',
  });

  const startMark = document.createElement('span');
  startMark.textContent = el.value[ss] ?? '\u200B';
  const endMark = document.createElement('span');
  endMark.textContent = el.value[se - 1] ?? '\u200B';
  const hasRange = se > ss + 1;

  mirror.appendChild(document.createTextNode(el.value.slice(0, ss)));
  mirror.appendChild(startMark);
  if (hasRange) {
    mirror.appendChild(document.createTextNode(el.value.slice(ss + 1, se - 1)));
    mirror.appendChild(endMark);
  }
  mirror.appendChild(document.createTextNode(el.value.slice(se)));
  document.body.appendChild(mirror);

  const elRect = el.getBoundingClientRect();
  const mRect  = mirror.getBoundingClientRect();
  const sRect  = startMark.getBoundingClientRect();
  const eRect  = hasRange ? endMark.getBoundingClientRect() : sRect;
  document.body.removeChild(mirror);

  const top    = elRect.top  + (sRect.top    - mRect.top)  - el.scrollTop;
  const bottom = elRect.top  + (eRect.bottom - mRect.top)  - el.scrollTop;
  const startX = elRect.left + (sRect.left   - mRect.left) - el.scrollLeft;
  const endX   = elRect.left + (eRect.right  - mRect.left) - el.scrollLeft;

  return { top, bottom, centerX: (startX + endX) / 2, above: top > 56 };
}

// ── Active format detection ──────────────────────────────────────────────────

function detectActiveFormats(value: string, start: number, end: number): Set<FormatKey> {
  const active = new Set<FormatKey>();
  const ls = value.lastIndexOf('\n', start - 1) + 1;
  const le = value.indexOf('\n', start);
  const line = value.slice(ls, le === -1 ? undefined : le);

  if (/^### /.test(line)) active.add('h3');
  else if (/^## /.test(line)) active.add('h2');
  if (/^[-*] /.test(line)) active.add('ul');
  if (/^\d+\. /.test(line)) active.add('ol');
  if (/^> /.test(line)) active.add('quote');

  if (start !== end) {
    const sel = value.slice(start, end);
    const outerBold = value.slice(Math.max(0, start - 2), start) === '**' && value.slice(end, end + 2) === '**';
    if (outerBold || (sel.startsWith('**') && sel.endsWith('**') && sel.length > 4)) active.add('bold');
    const outerItalic = value[start - 1] === '_' && value[end] === '_';
    if (outerItalic || (sel.startsWith('_') && sel.endsWith('_') && sel.length > 2)) active.add('italic');
  } else {
    const before = value.slice(0, start);
    const after  = value.slice(start);
    if ((before.split('**').length - 1) % 2 === 1 && after.includes('**')) active.add('bold');
    if ((before.split('_').length  - 1) % 2 === 1 && after.includes('_'))  active.add('italic');
  }

  return active;
}

// ── Component ────────────────────────────────────────────────────────────────

type MarkdownEditorProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  name: string;
  onChange?: (value: string) => void;
};

const FLOAT_W = 268;
const FLOAT_H = 40;

export function MarkdownEditor({ className, defaultValue, maxLength, name, onChange, ...props }: MarkdownEditorProps) {
  const [value, setValue]               = useState<string>(String(defaultValue ?? ''));
  const [mode, setMode]                 = useState<EditorMode>('edit');
  const [floatAnchor, setFloatAnchor]   = useState<FloatAnchor | null>(null);
  const [activeFormats, setActiveFormats] = useState<Set<FormatKey>>(new Set());
  const [mounted, setMounted]           = useState(false);
  const [linkInputVisible, setLinkInputVisible] = useState(false);

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const floatRef     = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const selectionRef     = useRef({ start: 0, end: 0 });
  const prevDefRef       = useRef(defaultValue);
  const undoStackRef     = useRef<Array<{ value: string; selectionStart: number; selectionEnd: number }>>([]);
  const redoStackRef     = useRef<Array<{ value: string; selectionStart: number; selectionEnd: number }>>([]);
  const lastChangePushMs = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (typeof defaultValue === 'string' && defaultValue !== prevDefRef.current) {
      setValue(defaultValue);
      prevDefRef.current = defaultValue;
    }
  }, [defaultValue]);

  // Focus link input when it appears
  useEffect(() => {
    if (linkInputVisible) {
      requestAnimationFrame(() => linkInputRef.current?.focus());
    }
  }, [linkInputVisible]);

  const syncState = useCallback((el: HTMLTextAreaElement, overrideValue?: string) => {
    const v = overrideValue ?? el.value;
    const { selectionStart: s, selectionEnd: e } = el;
    selectionRef.current = { start: s, end: e };
    setActiveFormats(detectActiveFormats(v, s, e));
    setFloatAnchor(s === e ? null : measureSelectionAnchor(el));
  }, []);

  const handleSelect = useCallback(() => {
    const el = textareaRef.current;
    if (el && mode === 'edit') syncState(el);
  }, [mode, syncState]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (floatRef.current?.contains(e.target as Node)) return;
      if (textareaRef.current?.contains(e.target as Node)) return;
      if (linkInputRef.current?.contains(e.target as Node)) return;
      setFloatAnchor(null);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const hide = () => setFloatAnchor(null);
    el.addEventListener('scroll', hide, { passive: true });
    return () => el.removeEventListener('scroll', hide);
  }, []);

  // applyRaw: commits value + restores selection without touching history stacks
  const applyRaw = useCallback(
    (result: { value: string; selectionStart: number; selectionEnd: number }) => {
      setValue(result.value);
      onChange?.(result.value);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(result.selectionStart, result.selectionEnd);
        syncState(el, result.value);
      });
    },
    [onChange, syncState],
  );

  // apply: same as applyRaw but records an undo snapshot first
  const apply = useCallback(
    (result: { value: string; selectionStart: number; selectionEnd: number }) => {
      const { start, end } = selectionRef.current;
      undoStackRef.current = [...undoStackRef.current.slice(-99), { value, selectionStart: start, selectionEnd: end }];
      redoStackRef.current = [];
      applyRaw(result);
    },
    [value, applyRaw],
  );

  const handleFormat = useCallback(
    (key: FormatKey) => {
      const def = FORMATS[key];
      const { start, end } = selectionRef.current;
      apply(def.block
        ? applyBlockFormat(value, start, end, def.before)
        : applyInlineFormat(value, start, end, def.before, def.after));
    },
    [value, apply],
  );

  const handleLinkClick = useCallback(() => {
    setLinkInputVisible((v) => !v);
  }, []);

  const handleLinkSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const url = linkInputRef.current?.value.trim();
      if (!url) {
        setLinkInputVisible(false);
        return;
      }
      const { start, end } = selectionRef.current;
      const before = '[';
      const after = `](${url})`;
      apply(applyInlineFormat(value, start, end, before, after));
      setLinkInputVisible(false);
    },
    [value, apply],
  );

  const handleUndo = useCallback((e?: { preventDefault(): void }) => {
    e?.preventDefault();
    const snapshot = undoStackRef.current.at(-1);
    if (!snapshot) return;
    undoStackRef.current = undoStackRef.current.slice(0, -1);
    redoStackRef.current = [...redoStackRef.current.slice(-99), { value, selectionStart: selectionRef.current.start, selectionEnd: selectionRef.current.end }];
    applyRaw(snapshot);
  }, [value, applyRaw]);

  const handleRedo = useCallback((e?: { preventDefault(): void }) => {
    e?.preventDefault();
    const snapshot = redoStackRef.current.at(-1);
    if (!snapshot) return;
    redoStackRef.current = redoStackRef.current.slice(0, -1);
    undoStackRef.current = [...undoStackRef.current.slice(-99), { value, selectionStart: selectionRef.current.start, selectionEnd: selectionRef.current.end }];
    applyRaw(snapshot);
  }, [value, applyRaw]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); return; }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); handleRedo(); return; }
      if (mod && e.key === 'b') { e.preventDefault(); handleFormat('bold');   return; }
      if (mod && e.key === 'i') { e.preventDefault(); handleFormat('italic'); return; }
      if (mod && e.key === 'k') { e.preventDefault(); handleLinkClick();       return; }

      if (e.key === 'Tab') {
        e.preventDefault();
        const el = textareaRef.current!;
        const s = el.selectionStart;
        apply({ value: value.slice(0, s) + '  ' + value.slice(el.selectionEnd), selectionStart: s + 2, selectionEnd: s + 2 });
        return;
      }

      if (e.key === 'Enter') {
        const el = textareaRef.current!;
        const start = el.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const currentLine = value.slice(lineStart, start);
        const listMatch = currentLine.match(LIST_PREFIX_RE);
        if (!listMatch) return;

        e.preventDefault();
        const afterMarker = currentLine.slice(listMatch[0].length);

        if (afterMarker.length === 0) {
          apply({ value: value.slice(0, lineStart) + value.slice(start), selectionStart: lineStart, selectionEnd: lineStart });
          return;
        }

        let nextMarker: string;
        if (ORDERED_LIST_RE.test(currentLine)) {
          const m = currentLine.match(ORDERED_LIST_RE)!;
          nextMarker = `${listMatch[1]}${Number(m[2]) + 1}. `;
        } else {
          nextMarker = `${listMatch[1]}${listMatch[2]} `;
        }
        const nv = value.slice(0, start) + '\n' + nextMarker + value.slice(start);
        apply({ value: nv, selectionStart: start + 1 + nextMarker.length, selectionEnd: start + 1 + nextMarker.length });
      }
    },
    [value, handleFormat, apply, handleLinkClick, handleUndo, handleRedo],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const now = Date.now();
    if (now - lastChangePushMs.current > 400) {
      const { start, end } = selectionRef.current;
      undoStackRef.current = [...undoStackRef.current.slice(-99), { value, selectionStart: start, selectionEnd: end }];
      redoStackRef.current = [];
      lastChangePushMs.current = now;
    }
    setValue(newValue);
    onChange?.(newValue);
  }, [value, onChange]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el || mode !== 'edit') return;
    const resize = () => { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; };
    resize();
    el.addEventListener('input', resize);
    return () => el.removeEventListener('input', resize);
  }, [mode, value]);

  const charCount = value.length;
  const maxLen = maxLength ? Number(maxLength) : undefined;
  const counterPct = maxLen ? charCount / maxLen : 0;

  const floatStyle = mounted && floatAnchor
    ? {
        position: 'fixed' as const,
        top: floatAnchor.above ? floatAnchor.top - FLOAT_H - 8 : floatAnchor.bottom + 8,
        left: Math.max(8, Math.min(floatAnchor.centerX - FLOAT_W / 2, window.innerWidth - FLOAT_W - 8)),
        zIndex: 9999,
      }
    : null;

  const floatToolbar = mounted && floatAnchor && floatStyle
    ? createPortal(
        <div ref={floatRef} className="markdown-editor-float" style={floatStyle} role="toolbar" aria-label="Форматирование текста">
          {(['bold', 'italic'] as const).map((key) => {
            const { icon: Icon, title } = FORMATS[key];
            return (
              <button key={key} type="button" className="markdown-editor-float-btn"
                data-active={activeFormats.has(key) || undefined} title={title}
                onMouseDown={(e) => { e.preventDefault(); handleFormat(key); }}>
                <Icon size={14} />
              </button>
            );
          })}
          <span className="markdown-editor-float-sep" aria-hidden="true" />
          {(['h2', 'h3'] as const).map((key) => {
            const { icon: Icon, title } = FORMATS[key];
            return (
              <button key={key} type="button" className="markdown-editor-float-btn"
                data-active={activeFormats.has(key) || undefined} title={title}
                onMouseDown={(e) => { e.preventDefault(); handleFormat(key); }}>
                <Icon size={14} />
              </button>
            );
          })}
          <span className="markdown-editor-float-sep" aria-hidden="true" />
          <button key="link" type="button" className="markdown-editor-float-btn"
            data-active={activeFormats.has('link') || undefined} title={FORMATS.link.title}
            onMouseDown={(e) => { e.preventDefault(); handleLinkClick(); }}>
            <Link size={14} />
          </button>
          <button key="quote" type="button" className="markdown-editor-float-btn"
            data-active={activeFormats.has('quote') || undefined} title={FORMATS.quote.title}
            onMouseDown={(e) => { e.preventDefault(); handleFormat('quote'); }}>
            <Quote size={14} />
          </button>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="markdown-editor">
      <div className="markdown-editor-toolbar">
        {mode === 'edit' ? (
          <>
            <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('bold') || undefined} title={FORMATS.bold.title} onClick={() => handleFormat('bold')}><Bold size={15} /></button>
            <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('italic') || undefined} title={FORMATS.italic.title} onClick={() => handleFormat('italic')}><Italic size={15} /></button>
            <span className="markdown-editor-toolbar-sep" aria-hidden="true" />
            <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('h2') || undefined} title={FORMATS.h2.title} onClick={() => handleFormat('h2')}><Heading2 size={15} /></button>
            <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('h3') || undefined} title={FORMATS.h3.title} onClick={() => handleFormat('h3')}><Heading3 size={15} /></button>
            <span className="markdown-editor-toolbar-sep" aria-hidden="true" />
            <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('ul') || undefined} title={FORMATS.ul.title} onClick={() => handleFormat('ul')}><List size={15} /></button>
            <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('ol') || undefined} title={FORMATS.ol.title} onClick={() => handleFormat('ol')}><ListOrdered size={15} /></button>
            <span className="markdown-editor-toolbar-sep" aria-hidden="true" />
            <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('link') || undefined} title={FORMATS.link.title} onClick={handleLinkClick}><Link size={15} /></button>
            <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('quote') || undefined} title={FORMATS.quote.title} onClick={() => handleFormat('quote')}><Quote size={15} /></button>
            <button type="button" className="markdown-editor-toolbar-btn" title={FORMATS.hr.title} onClick={() => handleFormat('hr')}><Minus size={15} /></button>
            <span className="markdown-editor-toolbar-sep" aria-hidden="true" />
            <button type="button" className="markdown-editor-toolbar-btn" title="Отменить (Ctrl+Z)" onMouseDown={handleUndo}><Undo2 size={15} /></button>
            <button type="button" className="markdown-editor-toolbar-btn" title="Вернуть (Ctrl+Shift+Z)" onMouseDown={handleRedo}><Redo2 size={15} /></button>
          </>
        ) : null}
        <div className="markdown-editor-tabs">
          <button type="button" className={cn('markdown-editor-tab', mode === 'edit' && 'markdown-editor-tab--active')} onClick={() => setMode('edit')}>
            <Pen size={13} />
            Редактировать
          </button>
          <button type="button" className={cn('markdown-editor-tab', mode === 'preview' && 'markdown-editor-tab--active')} onClick={() => setMode('preview')}>
            <Eye size={13} />
            Просмотр
          </button>
        </div>
      </div>

      {linkInputVisible && (
        <div className="markdown-editor-link-bar">
          <form onSubmit={handleLinkSubmit}>
            <input
              ref={linkInputRef}
              type="text"
              inputMode="url"
              className="markdown-editor-link-input"
              placeholder="https://example.com"
              onKeyDown={(e) => { if (e.key === 'Escape') setLinkInputVisible(false); }}
            />
            <button type="submit" className="markdown-editor-link-apply">Вставить</button>
            <button type="button" className="markdown-editor-link-cancel" onClick={() => setLinkInputVisible(false)}>×</button>
          </form>
        </div>
      )}

      {mode === 'edit' ? (
        <textarea
          {...props}
          ref={textareaRef}
          className={cn('field-base min-h-36 resize-none px-5 py-4 text-[15px] leading-[1.75] tracking-[0.01em]', className)}
          maxLength={maxLength}
          name={name}
          value={value}
          onBlur={handleSelect}
          onChange={handleChange}
          onClick={handleSelect}
          onKeyDown={handleKeyDown}
          onKeyUp={handleSelect}
          onSelect={handleSelect}
        />
      ) : (
        <div className="markdown-editor-preview rich-text-content">
          {value.length > 0 ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="italic text-[var(--muted)]">Ничего не написано. Перейдите на вкладку «Редактировать», чтобы начать.</p>
          )}
        </div>
      )}

      <div className="markdown-editor-footer">
        <span className={cn(
          'markdown-editor-counter',
          counterPct > 0.95 && 'markdown-editor-counter--danger',
          counterPct <= 0.95 && counterPct > 0.8 && 'markdown-editor-counter--warn',
        )}>
          {charCount.toLocaleString('ru-RU')}
          {maxLen ? ` / ${maxLen.toLocaleString('ru-RU')}` : null}
          {' символов'}
        </span>
      </div>

      {floatToolbar}
    </div>
  );
}
