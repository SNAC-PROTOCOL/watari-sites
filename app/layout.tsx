// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Watari Sites',
  description: 'Website hosting by Watari',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}