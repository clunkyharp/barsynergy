type OverlayRect = {
  height: number;
  width: number;
};

type TriggerRect = {
  bottom: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

type OverlayPositionInput = {
  align?: 'start' | 'end';
  matchTriggerWidth?: boolean;
  maxHeight?: number;
  minWidth?: number;
  overlayRect: OverlayRect;
  sideOffset?: number;
  triggerRect: TriggerRect;
  viewportHeight: number;
  viewportPadding?: number;
  viewportWidth: number;
};

export type OverlayPosition = {
  left: number;
  maxHeight: number;
  top: number;
  transformOrigin: string;
  width?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getOverlayPosition({
  align = 'start',
  matchTriggerWidth = false,
  maxHeight = 320,
  minWidth = 0,
  overlayRect,
  sideOffset = 8,
  triggerRect,
  viewportHeight,
  viewportPadding = 12,
  viewportWidth
}: OverlayPositionInput): OverlayPosition {
  const requestedWidth = matchTriggerWidth ? triggerRect.width : Math.max(overlayRect.width, minWidth);
  const width = Math.min(requestedWidth, viewportWidth - viewportPadding * 2);
  const availableBelow = viewportHeight - triggerRect.bottom - sideOffset - viewportPadding;
  const availableAbove = triggerRect.top - sideOffset - viewportPadding;
  const shouldOpenUp = availableBelow < overlayRect.height && availableAbove > availableBelow;
  const availableHeight = Math.max(80, shouldOpenUp ? availableAbove : availableBelow);
  const resolvedMaxHeight = Math.min(maxHeight, availableHeight);
  const height = Math.min(overlayRect.height, resolvedMaxHeight);
  const rawTop = shouldOpenUp ? triggerRect.top - sideOffset - height : triggerRect.bottom + sideOffset;
  const rawLeft = align === 'end' ? triggerRect.right - width : triggerRect.left;

  return {
    left: clamp(rawLeft, viewportPadding, viewportWidth - viewportPadding - width),
    maxHeight: resolvedMaxHeight,
    top: clamp(rawTop, viewportPadding, viewportHeight - viewportPadding - height),
    transformOrigin: shouldOpenUp ? 'bottom right' : 'top right',
    width: matchTriggerWidth ? width : undefined
  };
}
