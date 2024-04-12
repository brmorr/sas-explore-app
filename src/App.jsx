import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import config from './config.json';

const urlParams = new URLSearchParams(window.location.search);
const useBeta = (urlParams.get('beta') || '').toLowerCase() === 'true';
const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
const useDarkInitial = darkThemeMq.matches;
const darkLoadingTheme = {
  baseTheme: 'dark',
  backgroundColor: '#011829',
  textColor: '#ffffff',
  fontFamily: 'Inter',
};

window.addEventListener('vaReportComponents.loaded', function () {
  window.vaReportComponents.setLoadingTheme(useDarkInitial ? darkLoadingTheme : 'light');
});

function App() {
  const [isDarkMode, setDarkMode] = useState(useDarkInitial);
  useEffect(() => {
    darkThemeMq.addEventListener('change', (event) => {
      setDarkMode(event.matches);
      window.vaReportComponents.setLoadingTheme(
        event.matches ? darkLoadingTheme : 'light'
      );
    });
  }, []);

  const reportUid = useBeta
    ? config.BETA_REPORT_UID
    : isDarkMode
    ? config.DARK_REPORT_UID
    : config.LIGHT_REPORT_UID;
  return (
    <Dashboard
      packageUri={`${process.env.PUBLIC_URL}/reportPackages/${reportUid}`}
    ></Dashboard>
  );
}

export default App;
