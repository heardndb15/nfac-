import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chess.exe',
  description: 'WARNING: Unauthorized executable detected. Do not run.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black min-h-screen overflow-x-hidden">{children}</body>
    </html>
  );
}
