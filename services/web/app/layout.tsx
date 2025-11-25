import '../globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen">
        {/* Add global theme, header, nav, etc. here */}
        {children}
      </body>
    </html>
  );
}
