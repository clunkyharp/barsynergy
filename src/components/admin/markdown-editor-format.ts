import type { ComponentType } from 'react';
import {
  Bold, Heading2, Heading3, Italic, Link,
  List, ListOrdered, Minus, Quote,
} from 'lucide-react';

export type EditorMode = 'edit' | 'preview';

export type FormatDef = {
  before: string;
  after: string;
  block: boolean;
  icon: ComponentType<{ size?: number }>;
  title: string;
};

export const FORMATS = {
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

export type FormatKey = keyof typeof FORMATS;

export const FLOAT_W = 268;
export const FLOAT_H = 40;

export const LIST_PREFIX_RE = /^(\s*)([-*]|\d+\.)\s/;
export const ORDERED_LIST_RE = /^(\s*)(\d+)\.\s/;

export function applyInlineFormat(value: string, start: number, end: number, before: string, after: string) {
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

export function applyBlockFormat(value: string, start: number, _end: number, prefix: string) {
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

// ── Floating toolbar: position measurement ──────────────────────────────────

export type FloatAnchor = { top: number; bottom: number; centerX: number; above: boolean };

export function measureSelectionAnchor(el: HTMLTextAreaElement): FloatAnchor | null {
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
  startMark.textContent = el.value[ss] ?? '​';
  const endMark = document.createElement('span');
  endMark.textContent = el.value[se - 1] ?? '​';
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

export function detectActiveFormats(value: string, start: number, end: number): Set<FormatKey> {
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
