// pages/_app.tsx
import type { AppProps } from 'next/app';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import '../styles/global.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '600', '700'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '600', '700'],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable} ${cormorant.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
