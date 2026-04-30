import type { TextareaHTMLAttributes } from 'react';
import { textareaFieldClassName } from '@/components/ui/field-styles';
import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        textareaFieldClassName,
        className
      )}
      {...props}
    />
  );
}
