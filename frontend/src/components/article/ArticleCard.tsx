import { Link } from 'react-router-dom';
import { Calendar, Clock, User } from 'lucide-react';
import { memo } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, truncate } from '@/lib/utils';
import type { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
}

/**
 * Article Card Component
 */
function ArticleCardComponent({ article }: ArticleCardProps) {
  return (
    <Link to={`/articles/${article.slug}`} className="block h-full cursor-pointer">
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Featured Image */}
        {article.featuredImage && (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={article.featuredImage}
              alt={article.imageAlt || article.title}
              className="h-full w-full object-cover"
            />
            {article.category && (
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" style={{ 
                  backgroundColor: 'hsl(var(--color-background) / 0.9)',
                  backdropFilter: 'blur(4px)'
                }}>
                  {article.category.name}
                </Badge>
              </div>
            )}
          </div>
        )}
        
        <CardHeader>
          {/* Title */}
          <h3 className="text-xl font-semibold leading-tight line-clamp-2 hover:text-[--color-primary] transition-colors">
            {article.title}
          </h3>
          
          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-sm line-clamp-2 mt-2" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
              {truncate(article.excerpt, 150)}
            </p>
          )}
        </CardHeader>
        
        <CardContent>
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {article.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{article.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
          {/* Author */}
          {article.author && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{article.author.name}</span>
            </div>
          )}
          
          {/* Published Date */}
          {article.publishedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          )}
          
          {/* Reading Time */}
          {article.readingTimeMinutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{article.readingTimeMinutes} min read</span>
            </div>
          )}
          
          {/* View Count */}
          {article.stats && (
            <div className="flex items-center gap-1 ml-auto">
              <span>{Number(article.stats.views).toLocaleString()} views</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

export const ArticleCard = memo(ArticleCardComponent);