## How We're Setting Things Up

### The .env File
We're putting all the configuration that might change between environments or needs to be secret in our `.env` file:
- **API keys** (OpenAI, database passwords)
- **Which AI model** to use by default (easy to switch without touching code)
- **Site branding** like the default author name
- **Feature flags** to turn things on/off for testing

This way, we don't hardcode sensitive info, and we can adjust settings just by changing the environment variables.

### Hardcoded in TypeScript
Some things just made more sense to keep in the code:
- **Article templates**: These have a specific structure that TypeScript helps us validate
- **AI prompts**: Multi-line prompts are cleaner in code than crammed into env vars
- **Business rules**: Things like article status flows that rarely change

### The Bottom Line
In a perfect world with more time, we'd build a full admin dashboard where editors could create and edit templates right in the browser, configure AI authors, and more. But for a one-week project, that's overkill.

This mix gave us what we needed:
- **Easy to configure** for different environments (.env)
- **Reliable structure** for important content (TypeScript)
- **No unnecessary work** for a tight deadline

It's not the perfect long-term solution, but it got the job done without slowing us down.