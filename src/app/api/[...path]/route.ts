import { NextRequest, NextResponse } from 'next/server';

function getBackendUrl(): string {
  return process.env.S4_BACKEND_URL || 'http://127.0.0.1:9000';
}

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const backend = getBackendUrl();
  const target = `${backend}/api/${path.join('/')}`;

  const headers = new Headers(req.headers);
  headers.delete('host');

  try {
    const res = await fetch(target, {
      method: req.method,
      headers,
      body: req.body,
      // @ts-expect-error -- Node fetch supports duplex for streaming
      duplex: 'half',
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete('transfer-encoding');

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error(`Proxy error -> ${target}:`, err);
    return NextResponse.json(
      { error: `Backend unreachable: ${(err as Error).message}` },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
