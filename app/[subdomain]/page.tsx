// app/[subdomain]/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

interface SubdomainPageProps {
  params: Promise<{
    subdomain: string;
  }>;
}

export default async function SubdomainPage({ params }: SubdomainPageProps) {
  const { subdomain } = await params;
  
  // Get website by subdomain from Supabase
  const supabase = await createClient();
  const { data: website, error } = await supabase
    .from('websites')
    .select('*')
    .eq('subdomain', subdomain)
    .eq('status', 'DEPLOYED')
    .single();
  
  if (error || !website) {
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
export async function generateMetadata({ params }: SubdomainPageProps) {
  const { subdomain } = await params;
  
  const supabase = await createClient();
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
