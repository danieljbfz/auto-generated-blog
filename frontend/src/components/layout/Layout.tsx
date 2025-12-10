import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Layout Component
 * 
 * Main layout wrapper that includes header and footer.
 * The <Outlet /> component renders the matched child route.
 * 
 * Used in App.tsx as the parent route for all pages.
 */
export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}