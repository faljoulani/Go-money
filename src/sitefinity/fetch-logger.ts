import { writeLog } from "./log-writer";

/*
 * Wrap global fetch to log Sitefinity layout requests for diagnostics.
 */
const targetHost = (() => {
  try {
    return process.env.SF_CMS_URL ? new URL(process.env.SF_CMS_URL).host : undefined;
  } catch (err) {
    console.warn('[SF Fetch Logger] Could not parse SF_CMS_URL:', err);
    return undefined;
  }
})();

function shouldInspect(url: string): boolean {
  if (!targetHost) return false;
  try {
    const parsed = new URL(url, 'http://localhost');
    return parsed.host === targetHost;
  } catch {
    return false;
  }
}

function extractForwardedHost(headersInit: HeadersInit | undefined): string {
  if (!headersInit) return 'n/a';
  try {
    const headers = new Headers(headersInit as any);
    return (
      headers.get('X-ORIGINAL-HOST') ||
      headers.get('X-SF-BYPASS-HOST') ||
      headers.get('HOST') ||
      'n/a'
    );
  } catch {
    return 'n/a';
  }
}

async function logMessage(message: string): Promise<void> {
  console.log(message);
  try {
    await writeLog(message);
  } catch (err) {
    console.warn('[SF Fetch Logger] Failed to write log file entry:', err);
  }
}

if (typeof window === 'undefined' && !(globalThis as any).__sfFetchLoggerInstalled) {
  const originalFetch = globalThis.fetch;
  if (originalFetch) {
    (globalThis as any).__sfFetchLoggerInstalled = true;
    globalThis.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
      const method = init?.method || (typeof input === 'object' && 'method' in input ? (input as Request).method : 'GET');
      const start = Date.now();
      let logRequest = false;

      if (shouldInspect(url)) {
        logRequest = true;
        const forwardedHost = extractForwardedHost(init?.headers || (typeof input === 'object' ? (input as Request).headers : undefined));
        await logMessage(`[SF Fetch] -> ${method} ${url} | forwarded-host=${forwardedHost}`);
      }

      const response = await originalFetch(input as any, init);

      if (logRequest) {
        const duration = Date.now() - start;
        const contentType = response.headers.get('content-type') || 'unknown';
        const status = response.status;
        const statusText = response.statusText;
        const needsBodyPreview = status >= 400 || !contentType.includes('application/json');
        let preview = '';

        if (needsBodyPreview) {
          try {
            const clone = response.clone();
            preview = await clone.text();
            if (preview.length > 400) {
              preview = `${preview.slice(0, 400)}…`;
            }
          } catch (err) {
            preview = `[unable to read body: ${err instanceof Error ? err.message : String(err)}]`;
          }
        }

        await logMessage(
          `[SF Fetch] <- ${method} ${url} | status=${status} ${statusText} | content-type=${contentType} | duration=${duration}ms`
        );

        if (preview) {
          await logMessage(`[SF Fetch] body-preview: ${preview}`);
        }
      }

      return response;
    };
  }
}

export {};
