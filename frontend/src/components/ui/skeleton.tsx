import { cn } from '@/lib/utils';

/**
 * Skeleton Component
 * 
 * Loading placeholder that mimics the shape of content.
 * 
 * @example
 * <Skeleton className="h-12 w-12 rounded-full" />
 * <Skeleton className="h-4 w-[250px]" />
 * <Skeleton className="h-4 w-[200px]" />
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };