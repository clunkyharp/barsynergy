export function isSafeReturnTo(value: string): boolean {
  if (!value) {
    return false;
  }

  if (!value.startsWith('/')) {
    return false;
  }

  // Reject protocol-relative ("//host", "/\host") and backslash variants before
  // parsing: new URL() would treat them as absolute and strip the host into
  // pathname, letting an external origin pass the path checks below.
  const lowered = value.toLowerCase();
  if (
    value.startsWith('//') ||
    value.startsWith('/\\') ||
    lowered.startsWith('/%2f') ||
    lowered.startsWith('/%5c')
  ) {
    return false;
  }

  try {
    const url = new URL(value, 'http://localhost');

    // A safe relative path must keep our placeholder origin after parsing.
    if (url.origin !== 'http://localhost') {
      return false;
    }

    const pathname = url.pathname;

    if (pathname.startsWith('//')) {
      return false;
    }

    if (pathname.startsWith('/auth/')) {
      return true;
    }

    if (pathname.startsWith('/profile')) {
      return true;
    }

    if (pathname.startsWith('/business/cabinet')) {
      return true;
    }

    if (pathname.startsWith('/admin')) {
      return true;
    }

    if (pathname === '/' || pathname.startsWith('/vacancies') || pathname.startsWith('/events') || pathname.startsWith('/articles') || pathname.startsWith('/education') || pathname.startsWith('/suppliers') || pathname.startsWith('/partners') || pathname.startsWith('/general-sponsors') || pathname.startsWith('/business') || pathname.startsWith('/consulting') || pathname.startsWith('/about') || pathname.startsWith('/contacts') || pathname.startsWith('/tools')) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
