# Architecture Vision: Production-Ready Auto-Blog Platform

## Current State (MVP)

**What we have:**
- Single AI author generating articles
- Fixed templates and categories
- Auto-publish to `published` status
- No authentication
- No user management
- No admin dashboard
- Monolithic backend

**Limitations:**
- No human oversight
- No content moderation
- Single AI model (no flexibility)
- No trending topic detection
- No user-generated content
- No analytics

---

## Future Architecture: Multi-Tenant Content Platform

### Vision Statement
Transform the auto-blog into a **hybrid content platform** where:
- AI assists human writers (not replaces them)
- Multiple authors (human + AI) collaborate
- Content goes through review workflows
- Trending topics auto-generate draft suggestions
- Users manage their own AI authors with different models

---

## Proposed Architecture

### 1. Microservices Split

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway / BFF                        │
│                   (Express + Rate Limiting)                  │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴────────┬──────────────┬──────────────┐
    │                 │              │              │
┌───▼────┐    ┌──────▼──────┐  ┌───▼──────┐  ┌───▼────────┐
│ Auth   │    │   Content   │  │   AI     │  │  Trending  │
│Service │    │   Service   │  │ Service  │  │  Service   │
└────────┘    └─────────────┘  └──────────┘  └────────────┘
```

**Why Microservices?**
- **Auth Service**: Handles users, roles, permissions (JWT)
- **Content Service**: CRUD for articles, categories, tags (current backend)
- **AI Service**: Manages AI generation, model selection, prompt engineering
- **Trending Service**: Web scraping, topic discovery, trend analysis

---

### 2. Enhanced Data Model

#### **Users Table** (New)
```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'editor' | 'writer' | 'viewer';
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}
```

#### **Authors Table** (Enhanced)
```typescript
interface Author {
  id: string;
  userId?: string;              // Link to user (for human authors)
  
  // AI-specific fields
  aiModel?: string;             // 'gpt-4', 'claude-3.5', 'mistral-7b'
  aiProvider?: string;          // 'openai', 'anthropic', 'huggingface'
  aiConfig?: {
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
  };
  
  // Shared fields
  name: string;
  slug: string;
  type: 'human' | 'ai';
  isActive: boolean;
}
```

**Key Changes:**
- Authors can be human (linked to user) OR AI
- AI authors have configurable models
- Users can create multiple AI authors with different settings

#### **Article Workflow** (Enhanced)
```typescript
enum ArticleStatus {
  DRAFT = 'draft',               // Initial state
  PENDING_REVIEW = 'pending',    // Submitted for review
  APPROVED = 'approved',         // Approved, ready to publish
  SCHEDULED = 'scheduled',       // Scheduled for future
  PUBLISHED = 'published',       // Live
  REJECTED = 'rejected',         // Rejected with feedback
  ARCHIVED = 'archived',         // Removed from public
}

interface Article {
  // ... existing fields
  
  // Workflow fields
  status: ArticleStatus;
  submittedAt?: Date;
  reviewedBy?: string;          // User ID
  reviewedAt?: Date;
  rejectionReason?: string;
  
  // AI fields
  aiSuggestions?: {
    improvementAreas: string[];
    seoScore: number;
    readabilityScore: number;
  };
}
```

#### **Content Requests** (New)
```typescript
interface ContentRequest {
  id: string;
  userId: string;
  authorId: string;            // Which AI author to use
  topic: string;
  categoryId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  resultArticleId?: string;
  createdAt: Date;
  completedAt?: Date;
}
```

**Purpose:**
- Users request AI-generated content
- Async job processes request
- User reviews generated draft
- User edits and publishes

---

### 3. Authentication & Authorization

#### **Role-Based Access Control (RBAC)**

| Role | Permissions |
|------|------------|
| **Admin** | Full system access, user management, site settings |
| **Editor** | Review/approve articles, manage categories/tags |
| **Writer** | Create/edit own articles, request AI generation |
| **Viewer** | Read-only access |

#### **Implementation**
```typescript
// Middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = jwt.verify(token, secret);
  req.user = user;
  next();
};

const requireRole = (roles: Role[]) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ForbiddenError();
  }
  next();
};

// Usage
app.post('/articles', 
  requireAuth, 
  requireRole(['admin', 'editor', 'writer']), 
  articleController.create
);
```

---

### 4. AI Service Enhancements

#### **Multi-Model Support**
```typescript
interface AIProvider {
  name: string;
  models: AIModel[];
  generate(prompt: string, model: string): Promise<string>;
}

class OpenAIProvider implements AIProvider {
  models = ['gpt-4', 'gpt-3.5-turbo'];
  // ...
}

class AnthropicProvider implements AIProvider {
  models = ['claude-3.5-sonnet', 'claude-3-haiku'];
  // ...
}
```

#### **Prompt Templates**
```typescript
interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;              // With {topic}, {category} placeholders
  targetAudience: string;        // 'technical', 'beginner', 'business'
  tone: string;                  // 'formal', 'casual', 'humorous'
  isActive: boolean;
}
```

**Features:**
- Users create custom prompt templates
- A/B test different prompts
- Track which prompts generate best content

#### **Content Quality Scoring**
```typescript
interface ContentQuality {
  seoScore: number;              // Keyword density, meta tags
  readabilityScore: number;      // Flesch-Kincaid
  grammarScore: number;          // LanguageTool API
  plagiarismScore: number;       // Copyscape API
  overallScore: number;
}
```

---

### 5. Trending Service

#### **Architecture**
```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Web        │      │   Trending   │      │   Content   │
│  Scrapers   │─────▶│   Analyzer   │─────▶│   Requests  │
└─────────────┘      └──────────────┘      └─────────────┘
     │                       │
     │                       │
     ▼                       ▼
┌─────────────┐      ┌──────────────┐
│   NewsAPI   │      │   Database   │
│   Reddit    │      │   (Topics)   │
│   Twitter   │      └──────────────┘
└─────────────┘
```

#### **Components**

**Web Scrapers:**
- NewsAPI: Tech news headlines
- Reddit: r/programming, r/webdev trending posts
- Twitter: Trending developer hashtags
- Hacker News: Top stories

**Trending Analyzer:**
```typescript
interface TrendingTopic {
  id: string;
  topic: string;
  category: string;
  score: number;              // Trending score (0-100)
  sources: string[];          // ['reddit', 'twitter', 'hackernews']
  detectedAt: Date;
  lastSeenAt: Date;
}

class TrendingAnalyzer {
  async analyzeTrends(): Promise<TrendingTopic[]> {
    // 1. Fetch from multiple sources
    // 2. Extract topics using NLP
    // 3. Calculate trending score
    // 4. Filter out already-covered topics
    // 5. Return ranked list
  }
}
```

**Auto-Request Generation:**
```typescript
cron.schedule('0 */6 * * *', async () => {
  const trends = await trendingAnalyzer.analyzeTrends();
  
  for (const trend of trends.slice(0, 3)) {
    await contentRequestService.create({
      userId: 'system',
      authorId: 'default-ai-author',
      topic: trend.topic,
      categoryId: inferCategory(trend),
      status: 'pending',
    });
  }
});
```

---

### 6. Admin Dashboard

#### **Features**

**Content Management:**
- Review pending articles
- Approve/reject with feedback
- Bulk operations (publish, archive)
- Content calendar view

**User Management:**
- CRUD users
- Assign roles
- View activity logs

**AI Management:**
- Create/edit AI authors
- Configure models and prompts
- View generation costs
- A/B test results

**Analytics:**
- Articles per day
- AI vs human content ratio
- Most viewed articles
- Author performance
- Cost tracking

**System Health:**
- API status (HuggingFace, OpenAI)
- Database metrics
- Error logs
- Rate limit status

---

### 7. Caching Strategy

#### **Redis Integration**
```typescript
// Article feed cache
await redis.setex('feed:published:page:1', 300, JSON.stringify(articles));

// View count aggregation
await redis.incr(`article:${id}:views`);

// Flush to database every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  const keys = await redis.keys('article:*:views');
  for (const key of keys) {
    const articleId = key.split(':')[1];
    const views = await redis.get(key);
    await articleModel.incrementViews(articleId, parseInt(views));
    await redis.del(key);
  }
});
```

---

### 8. Deployment Architecture

#### **Production Setup**
```
┌─────────────────────────────────────────────────┐
│           CloudFlare / CDN (Static Assets)      │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           AWS ALB (Load Balancer)               │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼────────┐   ┌──────▼──────────┐
│   ECS Service  │   │  ECS Service    │
│   (API 1)      │   │  (API 2)        │
└───────┬────────┘   └──────┬──────────┘
        │                    │
        └─────────┬──────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌────▼────┐   ┌───▼────┐
│  RDS  │   │ Redis   │   │   S3   │
│(Postgres)  │(ElastiCache)│(Storage)│
└───────┘   └─────────┘   └────────┘
```

**Why This Setup?**
- **ALB**: Auto-scaling, SSL termination
- **ECS**: Container orchestration (vs EC2)
- **RDS**: Managed PostgreSQL with backups
- **ElastiCache**: Redis for caching
- **S3**: Image/media storage

---

### 9. Migration Path

#### **Phase 1: Authentication (Week 1-2)**
- [ ] Add users table
- [ ] Implement JWT auth
- [ ] Create login/register endpoints
- [ ] Add role-based middleware

#### **Phase 2: Workflow (Week 3-4)**
- [ ] Add article status field
- [ ] Create review endpoints
- [ ] Build approval flow
- [ ] Email notifications

#### **Phase 3: Multi-Model AI (Week 5-6)**
- [ ] Refactor AI service for multiple providers
- [ ] Add OpenAI provider
- [ ] Add Anthropic provider
- [ ] User-configurable AI authors

#### **Phase 4: Trending (Week 7-8)**
- [ ] Build web scrapers
- [ ] Implement trending analyzer
- [ ] Auto-generate content requests
- [ ] Admin review interface

#### **Phase 5: Admin Dashboard (Week 9-10)**
- [ ] React admin frontend
- [ ] Content management UI
- [ ] User management UI
- [ ] Analytics dashboard

#### **Phase 6: Production Deployment (Week 11-12)**
- [ ] Migrate to ECS
- [ ] Set up RDS
- [ ] Configure Redis
- [ ] CDN setup
- [ ] Monitoring & alerts

---

## Technology Recommendations

### Backend
- **API Gateway**: Express.js (current) or Fastify
- **Auth**: Passport.js + JWT
- **Job Queue**: Bull + Redis (for async AI generation)
- **Validation**: Zod (current)
- **ORM**: Prisma (current)

### Frontend (Admin Dashboard)
- **Framework**: React + Vite
- **UI Library**: shadcn/ui + Tailwind
- **State**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

### Infrastructure
- **Hosting**: AWS ECS (or Railway for simplicity)
- **Database**: PostgreSQL (RDS)
- **Cache**: Redis (ElastiCache)
- **Storage**: S3
- **CDN**: CloudFlare
- **Monitoring**: DataDog or New Relic

---

## Cost Estimation (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| **AWS ECS** | 2 containers | $60 |
| **RDS PostgreSQL** | t3.small | $40 |
| **ElastiCache Redis** | t3.micro | $20 |
| **S3** | 100GB storage | $2 |
| **CloudFlare** | Free tier | $0 |
| **OpenAI API** | 1M tokens/day | $60 |
| **HuggingFace** | Free tier | $0 |
| **Total** | | **~$180/month** |

**Revenue Model:**
- Freemium (free tier + paid)
- Pro: $19/month (unlimited AI, priority queue)
- Business: $99/month (custom models, API access)

---

## Security Considerations

1. **API Keys**: Store in AWS Secrets Manager
2. **SQL Injection**: Prisma prevents this
3. **XSS**: Sanitize HTML in articles
4. **Rate Limiting**: 100 req/min per user
5. **CORS**: Whitelist frontend domain
6. **HTTPS**: Enforce everywhere
7. **Input Validation**: Zod on all endpoints

---

## Conclusion

This architecture transforms the MVP into a **production-ready SaaS platform** where:
- Humans and AI collaborate
- Quality is maintained through review workflows
- Trending topics are auto-discovered
- Users have full control over AI configuration
- System scales horizontally
- Costs are predictable

**Next Steps:**
1. Implement authentication (highest priority)
2. Add article review workflow
3. Build admin dashboard
4. Deploy to production infrastructure