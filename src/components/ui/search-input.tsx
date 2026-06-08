'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const SearchInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function SearchInput(
  { className, type = 'search', ...props },
  ref
) {
  return (
    <span className="search-input">
      <Search aria-hidden className="search-input-icon" size={17} strokeWidth={1.8} />
      <Input className={cn('search-input-control pl-11', className)} ref={ref} type={type} {...props} />
    </span>
  );
});
