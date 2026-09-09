import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Huzaifa Ali — AI/ML Engineer',
  description:
    'AI/ML engineer based in Chandigarh, specializing in computer vision, vision-language models, and high-throughput inference. Explore my work and projects.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Huzaifa Ali — AI/ML Engineer',
    description:
      'Building intelligence. From the ground up. Selected projects in computer vision and language models.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t;try{t=localStorage.getItem('huzaifa-theme')}catch(e){}document.documentElement.dataset.theme=t==='dark'||t==='light'?t:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
