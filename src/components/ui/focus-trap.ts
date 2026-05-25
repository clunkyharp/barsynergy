const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
    const style = window.getComputedStyle(element);
    return style.visibility !== 'hidden' && style.display !== 'none' && element.getAttribute('aria-hidden') !== 'true';
  });
}

export function focusFirstElement(container: HTMLElement | null) {
  const firstElement = getFocusableElements(container)[0];

  if (firstElement) {
    firstElement.focus();
    return true;
  }

  container?.focus();
  return Boolean(container);
}

export function trapFocusInContainer(event: KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== 'Tab') {
    return;
  }

  const focusableElements = getFocusableElements(container);

  if (!focusableElements.length) {
    event.preventDefault();
    container?.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}
