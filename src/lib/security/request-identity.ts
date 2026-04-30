export function getClientIpFromHeaders(headerList: Headers) {
  const forwardedFor = headerList.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (
    forwardedFor ||
    headerList.get('x-real-ip')?.trim() ||
    headerList.get('cf-connecting-ip')?.trim() ||
    'unknown'
  );
}
