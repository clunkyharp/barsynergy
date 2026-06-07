export function isSafeReturnTo(value: string): boolean {
  if (!value) {
    return false;
  }

  if (!value.startsWith('/')) {
    return false;
  }

  try {
    const url = new URL(value, 'http://localhost');
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
