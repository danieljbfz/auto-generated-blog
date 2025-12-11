import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

/**
 * 404 Not Found Page
 */
export function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20">404</h1>
        </div>
        
        {/* Error Message */}
        <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for.
          It might have been moved or deleted.
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg">
              <Home className="h-5 w-5 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="lg">
              <Search className="h-5 w-5 mr-2" />
              Browse Articles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}