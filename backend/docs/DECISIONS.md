## Configuration Strategy

### Environment Variables (.env)
- **Runtime configuration**: API keys, database credentials
- **Model selection**: Easy to switch AI models without code changes
- **Author branding**: Customizable via env vars, no migrations needed
- **Feature flags**: Enable/disable features per environment

### TypeScript Constants
- **Article templates**: Structured data with type safety
- **Prompts**: Multi-line content better suited for code
- **Business logic**: Rarely changes, benefits from version control

### Future: Admin Dashboard
For production, templates should be database-backed with a management UI.
For this challenge, hardcoded templates provide reliability and simplicity.

### Rationale
This hybrid approach balances:
- Flexibility (env vars for runtime config)
- Reliability (code for structured data)
- Simplicity (no over-engineering for 1-week challenge)