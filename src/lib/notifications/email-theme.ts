export const EMAIL_BRAND_BG = '#ffd02f';
export const EMAIL_BRAND_TEXT = '#1c1c1e';
export const EMAIL_MUTED = '#888';
export const EMAIL_BORDER_RADIUS = '8px';
export const EMAIL_FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export function brandButtonHtml(href: string, label: string) {
  return `<a href="${href}" style="background:${EMAIL_BRAND_BG};color:${EMAIL_BRAND_TEXT};padding:12px 24px;border-radius:${EMAIL_BORDER_RADIUS};text-decoration:none;font-weight:600">${label}</a>`;
}

export function mutedTextHtml(text: string) {
  return `<span style="color:${EMAIL_MUTED};font-size:13px">${text}</span>`;
}
