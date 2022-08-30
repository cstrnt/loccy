import React from 'react';
import { AppProps } from 'next/app';
import { I18nProvider } from '../locales';
import en from '../locales/en';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <I18nProvider locale={pageProps.locale}>
      <Component {...pageProps} />
    </I18nProvider>
  );
};

export default App;
