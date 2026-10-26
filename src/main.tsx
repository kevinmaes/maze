import { createRoot } from 'react-dom/client';
import App from './components/App';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

// No <StrictMode> yet: Audio and Stage effects are not StrictMode-safe (#1663).
createRoot(root).render(<App />);
