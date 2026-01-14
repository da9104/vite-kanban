import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css'
import './styles/Typo.css'
import App from './App'

hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter basename='/'>
    <App />
  </BrowserRouter>
);