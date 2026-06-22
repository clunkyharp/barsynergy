'use client';

import { createPortal } from 'react-dom';
import type { CSSProperties, Ref } from 'react';
import {
  Bold, Eye, Heading2, Heading3, Italic, Link,
  List, ListOrdered, Minus, Pen, Quote, Redo2, Undo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FORMATS, type EditorMode, type FormatKey } from './markdown-editor-format';

type ToolbarCallbacks = {
  activeFormats: Set<FormatKey>;
  onFormat: (key: FormatKey) => void;
  onLink: () => void;
};

type EditToolbarProps = ToolbarCallbacks & {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onUndo: (e?: { preventDefault(): void }) => void;
  onRedo: (e?: { preventDefault(): void }) => void;
};

export function MarkdownEditToolbar({
  activeFormats,
  mode,
  onFormat,
  onLink,
  onModeChange,
  onUndo,
  onRedo,
}: EditToolbarProps) {
  return (
    <div className="markdown-editor-toolbar">
      {mode === 'edit' ? (
        <>
          <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('bold') || undefined} title={FORMATS.bold.title} onClick={() => onFormat('bold')}><Bold size={15} /></button>
          <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('italic') || undefined} title={FORMATS.italic.title} onClick={() => onFormat('italic')}><Italic size={15} /></button>
          <span className="markdown-editor-toolbar-sep" aria-hidden="true" />
          <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('h2') || undefined} title={FORMATS.h2.title} onClick={() => onFormat('h2')}><Heading2 size={15} /></button>
          <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('h3') || undefined} title={FORMATS.h3.title} onClick={() => onFormat('h3')}><Heading3 size={15} /></button>
          <span className="markdown-editor-toolbar-sep" aria-hidden="true" />
          <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('ul') || undefined} title={FORMATS.ul.title} onClick={() => onFormat('ul')}><List size={15} /></button>
          <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('ol') || undefined} title={FORMATS.ol.title} onClick={() => onFormat('ol')}><ListOrdered size={15} /></button>
          <span className="markdown-editor-toolbar-sep" aria-hidden="true" />
          <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('link') || undefined} title={FORMATS.link.title} onClick={onLink}><Link size={15} /></button>
          <button type="button" className="markdown-editor-toolbar-btn" data-active={activeFormats.has('quote') || undefined} title={FORMATS.quote.title} onClick={() => onFormat('quote')}><Quote size={15} /></button>
          <button type="button" className="markdown-editor-toolbar-btn" title={FORMATS.hr.title} onClick={() => onFormat('hr')}><Minus size={15} /></button>
          <span className="markdown-editor-toolbar-sep" aria-hidden="true" />
          <button type="button" className="markdown-editor-toolbar-btn" title="Отменить (Ctrl+Z)" onMouseDown={onUndo}><Undo2 size={15} /></button>
          <button type="button" className="markdown-editor-toolbar-btn" title="Вернуть (Ctrl+Shift+Z)" onMouseDown={onRedo}><Redo2 size={15} /></button>
        </>
      ) : null}
      <div className="markdown-editor-tabs">
        <button type="button" className={cn('markdown-editor-tab', mode === 'edit' && 'markdown-editor-tab--active')} onClick={() => onModeChange('edit')}>
          <Pen size={13} />
          Редактировать
        </button>
        <button type="button" className={cn('markdown-editor-tab', mode === 'preview' && 'markdown-editor-tab--active')} onClick={() => onModeChange('preview')}>
          <Eye size={13} />
          Просмотр
        </button>
      </div>
    </div>
  );
}

type FloatToolbarProps = ToolbarCallbacks & {
  floatRef: Ref<HTMLDivElement>;
  style: CSSProperties;
};

export function MarkdownFloatToolbar({ activeFormats, floatRef, onFormat, onLink, style }: FloatToolbarProps) {
  return createPortal(
    <div ref={floatRef} className="markdown-editor-float" style={style} role="toolbar" aria-label="Форматирование текста">
      {(['bold', 'italic'] as const).map((key) => {
        const { icon: Icon, title } = FORMATS[key];
        return (
          <button key={key} type="button" className="markdown-editor-float-btn"
            data-active={activeFormats.has(key) || undefined} title={title}
            onMouseDown={(e) => { e.preventDefault(); onFormat(key); }}>
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
            onMouseDown={(e) => { e.preventDefault(); onFormat(key); }}>
            <Icon size={14} />
          </button>
        );
      })}
      <span className="markdown-editor-float-sep" aria-hidden="true" />
      <button key="link" type="button" className="markdown-editor-float-btn"
        data-active={activeFormats.has('link') || undefined} title={FORMATS.link.title}
        onMouseDown={(e) => { e.preventDefault(); onLink(); }}>
        <Link size={14} />
      </button>
      <button key="quote" type="button" className="markdown-editor-float-btn"
        data-active={activeFormats.has('quote') || undefined} title={FORMATS.quote.title}
        onMouseDown={(e) => { e.preventDefault(); onFormat('quote'); }}>
        <Quote size={14} />
      </button>
    </div>,
    document.body,
  );
}
