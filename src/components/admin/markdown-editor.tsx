'use client';

import { useCallback, useEffect, useRef, useState, type TextareaHTMLAttributes } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';
import {
  applyBlockFormat,
  applyInlineFormat,
  detectActiveFormats,
  measureSelectionAnchor,
  FORMATS,
  FLOAT_H,
  FLOAT_W,
  LIST_PREFIX_RE,
  ORDERED_LIST_RE,
  type EditorMode,
  type FloatAnchor,
  type FormatKey,
} from './markdown-editor-format';
import { MarkdownEditToolbar, MarkdownFloatToolbar } from './markdown-editor-toolbar';

type MarkdownEditorProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  name: string;
  onChange?: (value: string) => void;
};

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

  const handleLinkApply = useCallback(
    () => {
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

  const handleLinkInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setLinkInputVisible(false);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleLinkApply();
      }
    },
    [handleLinkApply],
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

  return (
    <div className="markdown-editor">
      <MarkdownEditToolbar
        activeFormats={activeFormats}
        mode={mode}
        onFormat={handleFormat}
        onLink={handleLinkClick}
        onModeChange={setMode}
        onRedo={handleRedo}
        onUndo={handleUndo}
      />

      {linkInputVisible && (
        <div className="markdown-editor-link-bar">
          <div className="markdown-editor-link-controls">
            <input
              ref={linkInputRef}
              type="text"
              inputMode="url"
              className="markdown-editor-link-input"
              placeholder="https://example.com"
              onKeyDown={handleLinkInputKeyDown}
            />
            <button type="button" className="markdown-editor-link-apply" onClick={handleLinkApply}>Вставить</button>
            <button type="button" className="markdown-editor-link-cancel" onClick={() => setLinkInputVisible(false)}>×</button>
          </div>
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

      {mounted && floatAnchor && floatStyle ? (
        <MarkdownFloatToolbar
          activeFormats={activeFormats}
          floatRef={floatRef}
          onFormat={handleFormat}
          onLink={handleLinkClick}
          style={floatStyle}
        />
      ) : null}
    </div>
  );
}
