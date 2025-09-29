// app/page.tsx
'use client';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        color: 'white',
        marginBottom: '1rem' 
      }}>
        Watari Sites
      </h1>
      <p style={{ 
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '1.2rem',
        marginBottom: '2rem'
      }}>
        Professional website hosting for small businesses
      </p>
      <a 
        href="https://watari.co"
        style={{
          padding: '12px 30px',
          background: 'white',
          color: '#667eea',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '1.1rem',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        Create Your Website
      </a>
    </div>
  );
}
