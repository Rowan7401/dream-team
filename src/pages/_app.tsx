import type { AppProps } from 'next/app';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import '../styles/global.css';
import Head from 'next/head';

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

      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
      </Head>
      <Component {...pageProps} />


    </div>

  );
}

export default MyApp;
