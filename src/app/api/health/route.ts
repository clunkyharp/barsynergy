import { NextResponse } from 'next/server';

const STARTED_AT = Date.now();

export async function GET(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? null;

  return NextResponse.json(
    {
      status: 'ok',
      uptimeMs: Date.now() - STARTED_AT,
      timestamp: new Date().toISOString(),
      requestId
    },
    { status: 200 }
  );
}
