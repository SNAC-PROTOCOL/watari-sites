// app/custom-domain/[domain]/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

interface CustomDomainPageProps {
  params: Promise<{
    domain: string;
  }>;
}

export default async function CustomDomainPage({ params }: CustomDomainPageProps) {
  const { domain } = await params;
  
  // Get website by custom domain from Supabase
  const supabase = await createClient();
  const { data: website, error } = await supabase
    .from('websites')
    .select('*')
    .eq('custom_domain', domain)
    .eq('status', 'DEPLOYED')
    .single();
  
  if (error || !website) {
    // Try without www if domain starts with www
    if (domain.startsWith('www.')) {
      const domainWithoutWww = domain.replace('www.', '');
      const { data: websiteAlt } = await supabase
        .from('websites')
        .select('*')
        .eq('custom_domain', domainWithoutWww)
        .eq('status', 'DEPLOYED')
        .single();
      
      if (websiteAlt) {
        const htmlContent = websiteAlt.html || websiteAlt.draft_html;
        return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
      }
    }
    
    notFound();
  }
  
  // Get the HTML content
  const htmlContent = website.html || website.draft_html;
  
  if (!htmlContent) {
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
  
  // Return the HTML content directly
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CustomDomainPageProps) {
  const { domain } = await params;
  
  const supabase = await createClient();
  const { data: website } = await supabase
    .from('websites')
    .select('business_name, business_description')
    .eq('custom_domain', domain)
    .single();
  
  if (!website) {
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
