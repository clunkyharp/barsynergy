import { headers } from 'next/headers';
import { ServerInsertedScript } from '@/components/seo/server-inserted-script';

export type JsonLdValue = Record<string, unknown>;

type JsonLdProps = {
  data: JsonLdValue | Array<JsonLdValue | null | undefined>;
  id?: string;
};

function serializeJsonLd(data: JsonLdProps['data']) {
  const value = Array.isArray(data) ? data.filter(Boolean) : data;

  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function jsonLdScriptId(serialized: string) {
  let hash = 0;

  for (let index = 0; index < serialized.length; index += 1) {
    hash = (hash * 31 + serialized.charCodeAt(index)) >>> 0;
  }

  return `json-ld-${hash.toString(36)}`;
}

export async function JsonLd({ data, id }: JsonLdProps) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const serialized = serializeJsonLd(data);
  const scriptId = id ?? jsonLdScriptId(serialized);

  return (
    <ServerInsertedScript
      html={serialized}
      id={scriptId}
      nonce={nonce}
      type="application/ld+json"
    />
  );
}
