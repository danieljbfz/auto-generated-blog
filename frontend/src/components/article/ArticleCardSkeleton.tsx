import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Article Card Skeleton
 */
export function ArticleCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      {/* Featured Image Skeleton */}
      <Skeleton className="h-48 w-full rounded-none" />
      
      <CardHeader>
        {/* Title Skeleton */}
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-1/2 mt-2" />
        
        {/* Excerpt Skeleton */}
        <Skeleton className="h-4 w-full mt-4" />
        <Skeleton className="h-4 w-5/6" />
      </CardHeader>
      
      <CardContent>
        {/* Tags Skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-4">
        {/* Metadata Skeleton */}
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </CardFooter>
    </Card>
  );
}