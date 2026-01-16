import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { ArticlePage } from '@/pages/ArticlePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * Scroll restoration component
 */
function ScrollToTopComponent() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Use requestAnimationFrame for smooth scroll restoration
    const timer = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(timer);
  }, [pathname]);
  
  return null;
}

/**
 * App Component
 * 
 * Route Structure:
 * - /                  - Home page with article feed
 * - /articles/:slug    - Individual article page
 * - *                  - 404 not found page
 */
function App() {
  return (
    <BrowserRouter>
      <ScrollToTopComponent />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="articles/:slug" element={<ArticlePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;