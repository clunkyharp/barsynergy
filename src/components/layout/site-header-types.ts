export type HeaderUser = {
  id: string;
  email: string;
  role: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type SiteHeaderProps = {
  user?: HeaderUser | null;
  logoutAction?: () => Promise<void>;
};

export type NavItem = {
  label: string;
  href: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups = [
  {
    label: 'Разделы',
    hrefs: ['/articles', '/vacancies', '/specialists', '/suppliers', '/events', '/education', '/tools/cost-calculator']
  },
  {
    label: 'Для бизнеса',
    hrefs: ['/business', '/partners', '/general-sponsors', '/consulting']
  },
  {
    label: 'О проекте',
    hrefs: ['/about', '/contacts']
  }
] as const;

export const guestNavItems: NavItem[] = [
  { label: 'О проекте', href: '/about' },
  { label: 'Обучение', href: '/education' },
  { label: 'События', href: '/events' },
  { label: 'Материалы', href: '/articles' },
  { label: 'Вакансии', href: '/vacancies' },
  { label: 'Специалисты', href: '/specialists' },
  { label: 'Мастера', href: '/masters' },
  { label: 'Поставщики', href: '/suppliers' },
  { label: 'Калькулятор', href: '/tools/cost-calculator' },
  { label: 'Для бизнеса', href: '/business' },
  { label: 'Консалтинг', href: '/consulting' },
  { label: 'Партнёры', href: '/partners' },
  { label: 'Спонсорство', href: '/general-sponsors' },
  { label: 'Контакты', href: '/contacts' },
  { label: 'Войти', href: '/auth/login' }
];

function getNavItems(hrefs: string[]) {
  return hrefs
    .map((href) => guestNavItems.find((item) => item.href === href))
    .filter((item): item is NavItem => Boolean(item));
}

export const desktopPrimaryNavItems: NavItem[] = getNavItems(['/articles']);

export const desktopDropdownGroups: NavGroup[] = [
  {
    label: 'Работа',
    items: getNavItems(['/vacancies', '/specialists'])
  },
  {
    label: 'Индустрия',
    items: getNavItems(['/suppliers', '/events', '/education'])
  },
  {
    label: 'Инструменты',
    items: getNavItems(['/tools/cost-calculator'])
  }
];

export const desktopMoreGroups: NavGroup[] = [
  {
    label: 'Сотрудничество',
    items: getNavItems(['/business', '/partners', '/general-sponsors', '/consulting'])
  },
  {
    label: 'О проекте',
    items: getNavItems(['/about', '/contacts'])
  }
];

export function isWorkspacePath(pathname: string | null) {
  return Boolean(pathname?.startsWith('/admin') || pathname?.startsWith('/business/cabinet') || pathname?.startsWith('/auth'));
}

export function isActiveItem(pathname: string, href: string) {
  if (href === '/auth/login') {
    return pathname.startsWith('/auth');
  }

  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
