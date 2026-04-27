import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduManager School',
  description: 'Mega application de gestion scolaire multi-niveaux',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
