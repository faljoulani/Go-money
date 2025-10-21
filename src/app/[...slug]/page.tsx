import { Metadata } from 'next';
import { RenderPage, pageMetadata } from '@progress/sitefinity-nextjs-sdk/pages';
import { templateRegistry } from '../template-registry';

// Use ISR with 60 second revalidation to reduce server load and improve resilience
export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string }>;
}): Promise<Metadata> {
  const baseMetadata = await pageMetadata({ params, searchParams });
  
  // Add fallback title and meta description if not provided by Sitefinity
  return {
    ...baseMetadata,
    title: baseMetadata.title || 'GoMoney - Your Trusted Digital Financial Platform',
    description: baseMetadata.description || 'GoMoney - Your trusted digital financial platform. Secure, fast, and reliable financial services for all your banking needs.',
  };
}

async function attemptRenderPage(
  resolvedParams: { slug: string[] },
  resolvedSearchParams: { [key: string]: string },
  retryCount = 0
): Promise<any> {
  try {
    console.log('[RenderPage] Attempting to render:', {
      slug: resolvedParams.slug,
      searchParams: resolvedSearchParams,
      attempt: retryCount + 1,
      timestamp: new Date().toISOString(),
    });
    
    return await RenderPage({ 
      params: Promise.resolve(resolvedParams), 
      searchParams: Promise.resolve(resolvedSearchParams), 
      templates: templateRegistry 
    });
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    
    // Check if it's a 404 error
    const is404 = errorMessage.includes('404') || errorMessage.includes('NEXT_NOT_FOUND');
    
    // Retry 404s up to 2 times (total 3 attempts) in case of temporary server issues
    // This handles cases where Sitefinity might be restarting or temporarily unresponsive
    if (is404 && retryCount < 2) {
      // Only log as warning during retries (not errors)
      console.warn(`[RenderPage] Temporary 404, retrying after ${Math.pow(2, retryCount) * 1000}ms (attempt ${retryCount + 1}/3)...`, {
        slug: resolvedParams.slug,
        timestamp: new Date().toISOString(),
      });
      
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      return attemptRenderPage(resolvedParams, resolvedSearchParams, retryCount + 1);
    }
    
    // Only log as error if all retries exhausted or not a 404
    if (!is404 || retryCount >= 2) {
      console.error('[RenderPage Error]', {
        slug: resolvedParams.slug,
        error: errorMessage,
        attempt: retryCount + 1,
        digest: error?.digest,
        timestamp: new Date().toISOString(),
      });
    }
    
    // After all retries exhausted, check if it's a server error or actual 404
    const isServerError = errorMessage.includes('502') || 
                         errorMessage.includes('503') || 
                         errorMessage.includes('504') ||
                         errorMessage.includes('timeout') ||
                         errorMessage.includes('ECONNREFUSED') ||
                         errorMessage.includes('ECONNRESET');
    
    if (is404 && !isServerError) {
      console.log('[RenderPage] Confirmed 404 after retries (page not found)');
      const { notFound } = await import('next/navigation');
      notFound();
    }
    
    // For server errors, throw to show error page instead of 404
    if (isServerError) {
      console.error('[RenderPage] Server/Network error detected, not treating as 404');
    }
    
    throw error;
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  return attemptRenderPage(resolvedParams, resolvedSearchParams, 0);
}

