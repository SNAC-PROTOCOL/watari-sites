// app/custom-domain/[domain]/page.tsx
import { notFound } from 'next/navigation';
import { createServiceClient } from '@/utils/supabase/service';

interface CustomDomainPageProps {
  params: Promise<{
    domain: string;
  }>;
}

export default async function CustomDomainPage({ params }: CustomDomainPageProps) {
  const { domain } = await params;
  
  console.log('[CUSTOM_DOMAIN] Loading website for domain:', domain);
  
  // Use service client to bypass RLS for public website viewing
  const supabase = createServiceClient();
  
  // Get website by custom domain from Supabase
  const { data: website, error } = await supabase
    .from('websites')
    .select('*')
    .eq('custom_domain', domain)
    .eq('status', 'DEPLOYED')
    .single();
  
  if (error) {
    console.error('[CUSTOM_DOMAIN] Supabase error:', error.message, error.code);
    console.error('[CUSTOM_DOMAIN] Query details - domain:', domain);
  }
  
  if (!website && domain.startsWith('www.')) {
    // Try without www if domain starts with www
    const domainWithoutWww = domain.replace('www.', '');
    console.log('[CUSTOM_DOMAIN] Trying without www:', domainWithoutWww);
    
    const { data: websiteAlt, error: altError } = await supabase
      .from('websites')
      .select('*')
      .eq('custom_domain', domainWithoutWww)
      .eq('status', 'DEPLOYED')
      .single();
    
    if (altError) {
      console.error('[CUSTOM_DOMAIN] Alt query error:', altError.message);
    }
    
    if (websiteAlt) {
      console.log('[CUSTOM_DOMAIN] Found website without www:', websiteAlt.business_name);
      const htmlContent = websiteAlt.html || websiteAlt.draft_html;
      return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }
  }
  
  if (!website) {
    console.log('[CUSTOM_DOMAIN] Website not found for domain:', domain);
    notFound();
  }
  
  console.log('[CUSTOM_DOMAIN] Website found:', website.business_name, 'Status:', website.status);
  
  // Get the HTML content
  const htmlContent = website.html || website.draft_html;
  
  if (!htmlContent) {
    console.log('[CUSTOM_DOMAIN] No HTML content found for domain:', domain);
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
  
  console.log('[CUSTOM_DOMAIN] Serving HTML content, length:', htmlContent.length);
  
  // Return the HTML content directly
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CustomDomainPageProps) {
  const { domain } = await params;
  
  const supabase = createServiceClient();
  const { data: website } = await supabase
    .from('websites')
    .select('business_name, business_description')
    .eq('custom_domain', domain)
    .eq('status', 'DEPLOYED')
    .single();
  
  if (!website) {
    // Try without www
    if (domain.startsWith('www.')) {
      const domainWithoutWww = domain.replace('www.', '');
      const { data: websiteAlt } = await supabase
        .from('websites')
        .select('business_name, business_description')
        .eq('custom_domain', domainWithoutWww)
        .eq('status', 'DEPLOYED')
        .single();
      
      if (websiteAlt) {
        return {
          title: websiteAlt.business_name || 'Website',
          description: websiteAlt.business_description || `Welcome to ${websiteAlt.business_name}`,
        };
      }
    }
    
    return {
      title: 'Website',
    };
  }
  
  return {
    title: website.business_name || 'Website',
    description: website.business_description || `Welcome to ${website.business_name}`,
  };
}

// Enable ISR with revalidation every 60 seconds
export const revalidate = 60;
