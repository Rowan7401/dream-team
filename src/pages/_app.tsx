// src/pages/_app.tsx
import '../styles/global.css';  // Import your global CSS file here

import type { AppProps } from 'next/app';

// This is the root component of your app
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
