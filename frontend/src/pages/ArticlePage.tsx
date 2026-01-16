import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArticleContent } from '@/components/article/ArticleContent';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/services/api';
import type { ApiResponse, Article } from '@/types';
import { AlertCircle, ArrowLeft } from 'lucide-react';

/**
 * Article Detail Page
 */
export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    const loadArticle = async () => {
      if (!slug) {
        setError('Article not found');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Delay showing skeleton by 200ms to prevent flash on fast loads
        const skeletonTimer = setTimeout(() => {
          if (mounted) setShowSkeleton(true);
        }, 200);
        
        const response: ApiResponse<Article> = await api.getArticleBySlug(slug);
        
        clearTimeout(skeletonTimer);
        if (mounted) {
          setArticle(response.data || null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load article');
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setShowSkeleton(false);
        }
      }
    };
    
    loadArticle();
    
    return () => {
      mounted = false;
    };
  }, [slug]);
  
  // Loading State (only show after delay)
  if (loading && showSkeleton) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-96 w-full mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-5/6 mb-8" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }
  
  // Error State
  if (error || (!loading && !article)) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4" style={{ color: 'hsl(var(--color-destructive))' }} />
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="mb-8" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
            {error || 'The article you are looking for does not exist.'}
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Success State
  if (!article) {
    return null; // Still loading, no skeleton yet
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <div className="mb-8">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
        </Link>
      </div>
      
      {/* Article Content */}
      <ArticleContent article={article} />
    </div>
  );
}