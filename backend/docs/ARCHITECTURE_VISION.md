# Plan for Building Out the Auto-Blog Platform

## Where We're At Now

Right now, the site is a simple proof-of-concept. It works, but it’s bare bones.

**What we’ve built:**
*   A single, hard-coded AI "author" writes all the articles.
*   Articles use a fixed set of templates and categories.
*   Everything auto-publishes immediately (no review or editing process).
*   There’s no login, no user accounts, and no admin panel.
*   It's all one big chunk of backend code.

**What we’re missing (the big problems):**
*   Zero human oversight. The AI publishes whatever it generates.
*   No way to edit, schedule, or reject articles.
*   We’re locked into one AI model with no settings.
*   It doesn’t find trending topics; we have to tell it what to write.
*   There are no users, so there’s no way to collaborate or have different writers.
*   We have no idea how articles are performing (no easy way to get the ones that are popular).

---

## Where We Want to Go

We need to shift from a simple auto-blog to a **real content platform**. The goal isn't to replace people with AI, but to use AI to help people create better content, faster.

The vision is a platform where:
*   Human writers and AI assistants work together.
*   Articles go through a proper review and editing process.
*   The system can spot trending topics and suggest drafts automatically.
*   Users can create and customize their own AI writing assistants.

---

## The New System Design

### 1. Breaking into Smaller Services

Instead of one big application, we’ll split things up. This makes the code easier to manage and lets us scale parts independently.

Here’s the basic layout:
*   **API Gateway:** The front door. It handles all incoming traffic and rate limiting.
*   **Auth Service:** Manages user accounts, logins, and permissions.
*   **Content Service:** Handles everything related to articles, categories, and tags. (This is basically our current backend, refined).
*   **AI Service:** Becomes the brain for all AI writing tasks, supporting different models.
*   **Trending Service:** A new service that scours the web for hot topics and suggests article ideas.

We can even have the trending service, the AI service, and the part about generating articles automatically run in a separate microservice decoupled from the main app.
We can then just use the endpoints exposed by the API gateway to connect them all together.

### 2. Database Changes

We need new tables and fields to support users and workflows.

**Users:** A standard user table for logins, with roles like Admin, Editor, Writer, and Viewer.

**Authors (Revised):** An "author" can now be a human user *or* an AI agent. For AI authors, we’ll store which model they use (like GPT-4 or Claude) and their specific settings.

**Articles (Revised):** Every article will have a status, like `draft`, `pending_review`, `approved`, or `published`. We’ll track who submitted it, who reviewed it, and any feedback. We can also store AI-generated suggestions for SEO or readability.

**Content Requests (New):** This is how users ask for an AI-generated draft. They pick a topic and an AI author, and the system processes it in the background. The user then gets a draft to review and edit.

### 3. Login & Permissions

We’ll add a standard email/password login using JWT tokens.

More importantly, we’ll set up role-based permissions:
*   **Writers** can create drafts and request AI help.
*   **Editors** can review, edit, and approve articles from writers.
*   **Admins** have full control over users and settings.

A simple middleware on our API routes will check if a user is logged in and has the right role before allowing an action.

### 4. A Smarter AI Service

We’ll rebuild the AI part to be more powerful and flexible.

**Multiple Models:** We won’t be locked into one provider. We’ll support OpenAI, Anthropic, and others. Users can choose which AI model their personal "AI author" uses.

**Prompt Management:** We can create and save different prompt templates (e.g., "Write a formal how-to guide" vs. "Write a casual listicle"). This lets us consistently generate better first drafts.

**Quality Checks:** We can run basic automated scores on generated drafts for SEO, readability, and grammar to give the human editor a head start.

### 5. The Trending Topic Finder

This is a new, separate service that automatically finds article ideas.

It will periodically check places like Reddit’s programming boards, Hacker News, and tech news feeds. Using some simple analysis, it will identify what topics are gaining traction. If a topic is hot and we haven’t covered it, the system can automatically create a `Content Request` for a draft. An editor can then review that draft and polish it into a timely article.

### 6. The Admin Dashboard

We need a clean, separate interface for site management. This React-based dashboard would let admins and editors:
*   Review and approve articles in a queue.
*   Manage users and their roles.
*   Configure AI authors and prompt templates.
*   See basic analytics on published articles and AI usage.
*   Check the health of the various services and APIs.

### 7. Handling More Traffic

To keep things fast as we grow, we’ll add Redis for caching. We can cache things like the public article feed. We can also use it to temporarily store page view counts before saving them to the main database in a batch every few minutes.

### 8. How We'll Host It

For a production setup, I recommend using AWS:
*   **ECS** to run our containerized services.
*   **RDS** for a managed PostgreSQL database.
*   **ElastiCache** for the Redis instance.
*   **S3** to store any uploaded images.
*   **A Load Balancer (ALB)** to distribute traffic and handle SSL.

This keeps everything managed and makes scaling easier than running our own servers.

---

## Costs and Security

**Estimated Monthly Cost:** ~$180. The biggest pieces are the AWS infrastructure (~$120) and a reasonable budget for OpenAI API usage (~$60). This is very manageable.

**Security Basics:** We'll follow standard practices: hash all passwords, use JWT tokens, validate all user input, add rate limiting to the API, and store API keys in a proper secrets manager, not in the code.