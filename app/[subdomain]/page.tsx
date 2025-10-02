// app/[subdomain]/page.tsx
import { notFound } from 'next/navigation';
import { createServiceClient } from '@/utils/supabase/service';

interface SubdomainPageProps {
  params: Promise<{
    subdomain: string;
  }>;
}

export default async function SubdomainPage({ params }: SubdomainPageProps) {
  const { subdomain } = await params;
  
  // Early return for favicon requests
  if (subdomain === 'favicon.ico') {
    notFound();
    return;
  }
  
  console.log('[SUBDOMAIN] Loading website for subdomain:', subdomain);
  
  // Use service client to bypass RLS for public website viewing
  const supabase = createServiceClient();
  
  // Get website by subdomain from Supabase (check if it exists at all)
  const { data: website, error } = await supabase
    .from('websites')
    .select('*')
    .eq('subdomain', subdomain)
    .single();
  
  if (error) {
    console.error('[SUBDOMAIN] Supabase error:', error.message, error.code);
    console.error('[SUBDOMAIN] Query details - subdomain:', subdomain);
  }
  
  if (!website) {
    console.log('[SUBDOMAIN] Website not found for subdomain:', subdomain);
    notFound();
  }
  
  console.log('[SUBDOMAIN] Website found:', website.business_name, 'Status:', website.status);
  
  // Check if website exists but is not deployed yet
  if (website.status === 'DRAFT') {
    console.log('[SUBDOMAIN] Website is in DRAFT status');
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Website Coming Soon</h1>
          <p style={{ color: '#666' }}>This website is being set up. Please check back later.</p>
        </div>
      </div>
    );
  }
  
  if (website.status !== 'DEPLOYED') {
    console.log('[SUBDOMAIN] Website exists but not yet deployed, status:', website.status);
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Website Not Yet Deployed</h1>
          <p style={{ color: '#666' }}>This website exists but has not been deployed yet.</p>
        </div>
      </div>
    );
  }
  
  // Get the HTML content
  const htmlContent = website.html || website.draft_html;
  
  if (!htmlContent) {
    console.log('[SUBDOMAIN] No HTML content found for website:', subdomain);
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Website Coming Soon</h1>
          <p style={{ color: '#666' }}>This website is being set up. Please check back later.</p>
        </div>
      </div>
    );
  }
  
  console.log('[SUBDOMAIN] Serving HTML content, length:', htmlContent.length);
  
  // Return the HTML content directly
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SubdomainPageProps) {
  const { subdomain } = await params;
  
  const supabase = createServiceClient();
  const { data: website } = await supabase
    .from('websites')
    .select('business_name, business_description')
    .eq('subdomain', subdomain)
    .single();
  
  if (!website) {
    return {
      title: 'Website Not Found',
    };
  }
  
  return {
    title: website.business_name || 'Website',
    description: website.business_description || `Welcome to ${website.business_name}`,
  };
}

// Enable ISR with revalidation every 60 seconds
export const revalidate = 60;
