'use client';

import { useServerInsertedHTML } from 'next/navigation';
import { useRef } from 'react';

type ServerInsertedScriptProps = {
  html: string;
  id: string;
  nonce?: string;
  type?: string;
};

export function ServerInsertedScript({
  html,
  id,
  nonce,
  type
}: ServerInsertedScriptProps) {
  const insertedRef = useRef(false);

  useServerInsertedHTML(() => {
    if (insertedRef.current) {
      return null;
    }

    insertedRef.current = true;

    return (
      <script
        dangerouslySetInnerHTML={{ __html: html }}
        id={id}
        nonce={nonce}
        suppressHydrationWarning
        type={type}
      />
    );
  });

  return null;
}
