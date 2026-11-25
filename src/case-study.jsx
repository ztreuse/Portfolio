import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import CaseStudy from './pages/CaseStudy';

// Each case study is its own small page (<slug>/index.html), so the main page doesn't load any of it
const root = document.getElementById('root');

createRoot(root).render(
  <StrictMode>
    <CaseStudy slug={root.dataset.case} />
  </StrictMode>,
);
