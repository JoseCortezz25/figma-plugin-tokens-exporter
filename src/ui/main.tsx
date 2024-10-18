import React from 'react';
import ReactDOM from 'react-dom/client';

globalThis.__VITE_PRELOAD__ = [];

async function bootstrap() {

  const App = (await import('./app')).default;

  const rootElement = document.getElementById('root') as HTMLElement;
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
