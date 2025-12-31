# Documentation System

This project uses an automated documentation system that fetches and displays markdown documentation from the [nannyapi](https://github.com/nannyagent/nannyapi) and [nannyagent](https://github.com/nannyagent/nannyagent) repositories.

## Architecture

The documentation system is built with:
- **Dynamic Fetching**: Documentation is fetched from GitHub repositories using raw content URLs
- **React Markdown Rendering**: Using `react-markdown` with GitHub Flavored Markdown support
- **Syntax Highlighting**: Code blocks are highlighted using `react-syntax-highlighter`
- **Automated CI/CD**: GitHub Actions automatically sync documentation on schedule or trigger

## Directory Structure

```
├── docs/                          # Fetched documentation (not committed)
│   ├── nannyapi/                  # NannyAPI docs
│   │   ├── API_REFERENCE.md
│   │   ├── ARCHITECTURE.md
│   │   ├── DEPLOYMENT.md
│   │   └── ...
│   └── nannyagent/                # NannyAgent docs
│       ├── INSTALLATION.md
│       ├── CONFIGURATION.md
│       └── ...
├── public/docs/                   # Served docs (copied during build)
├── scripts/
│   └── fetch-docs.sh             # Script to fetch docs from GitHub
├── src/
│   ├── components/
│   │   └── MarkdownRenderer.tsx  # Markdown rendering component
│   ├── lib/
│   │   └── docRegistry.ts        # Documentation metadata & navigation
│   └── pages/
│       ├── Documentation.tsx     # Main docs listing page
│       └── DocDetail.tsx         # Individual doc viewer page
└── .github/workflows/
    ├── update-docs.yml           # On-demand doc updates
    └── sync-docs.yml             # Scheduled doc sync (every 6 hours)
```

## Usage

### Fetch Documentation Manually

```bash
# Fetch from main branch
npm run docs:fetch

# Fetch from add-docs branch (development)
npm run docs:fetch:dev

# Or directly
./scripts/fetch-docs.sh main
./scripts/fetch-docs.sh add-docs
```

### Build with Documentation

```bash
# Production build (fetches from main)
npm run build

# Development build (fetches from add-docs)
npm run build:dev
```

### Adding New Documentation

1. Add the document metadata to `src/lib/docRegistry.ts`:

```typescript
{
  title: 'New Feature Guide',
  category: 'Features',
  description: 'Learn about the new feature',
  source: 'nannyapi', // or 'nannyagent'
  filename: 'NEW_FEATURE.md',
  icon: 'Star',
  order: 3,
}
```

2. Update `scripts/fetch-docs.sh` to include the new file:

```bash
NANNYAPI_DOCS=(
  "API_REFERENCE"
  "NEW_FEATURE"  # Add here
  # ...
)
```

3. The documentation will automatically be available at `/docs/new_feature`

## CI/CD Integration

### Scheduled Sync

Documentation is automatically synced every 6 hours from the `main` branch:
- Workflow: `.github/workflows/sync-docs.yml`
- Checks for changes and commits if updated
- Creates detailed summary in GitHub Actions

### Manual Updates

Trigger documentation updates manually:

```bash
# Via GitHub Actions UI
Go to Actions → Update Documentation → Run workflow

# Via GitHub CLI
gh workflow run update-docs.yml --ref main

# Via API
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/YOUR_ORG/nannyui/dispatches \
  -d '{"event_type":"docs-updated"}'
```

### Webhook Integration (Optional)

To trigger updates when nannyapi or nannyagent docs change, set up repository webhooks:

1. In nannyapi/nannyagent repo settings, add webhook:
   - URL: `https://api.github.com/repos/YOUR_ORG/nannyui/dispatches`
   - Content type: `application/json`
   - Events: `push` to `main` branch
   - Payload:
     ```json
     {
       "event_type": "docs-updated",
       "client_payload": {
         "source": "nannyapi",
         "branch": "main"
       }
     }
     ```

## Development

### Local Development

When developing locally, docs are fetched from GitHub and served from the `public/docs` directory:

```bash
# Start dev server
npm run dev

# Fetch latest docs while developing
npm run docs:fetch:dev
```

### Testing Documentation Changes

1. Make changes to `src/lib/docRegistry.ts` or components
2. Fetch docs: `npm run docs:fetch:dev`
3. View at `http://localhost:5173/docs`

## Features

- **Category-based Navigation**: Docs organized by category (Getting Started, API, Agent Setup, etc.)
- **Full-text Search**: Search across all documentation titles and descriptions
- **Syntax Highlighting**: Beautiful code highlighting for all languages
- **GitHub Integration**: Direct links to source files on GitHub
- **Responsive Design**: Works beautifully on mobile and desktop
- **Related Articles**: Context-aware navigation to related docs
- **Table of Contents**: Auto-generated from markdown headings
- **External Link Handling**: Automatically opens external links in new tabs

## Configuration

### Branches

By default:
- **Production**: Fetches from `main` branch
- **Development**: Fetches from `add-docs` branch

To change branches, update:
- `package.json` scripts
- `.github/workflows/*.yml` files
- Or pass branch as argument: `./scripts/fetch-docs.sh your-branch`

### Documentation Sources

Currently configured to fetch from:
- `github.com/nannyagent/nannyapi/docs/`
- `github.com/nannyagent/nannyagent/docs/`

To add more sources, update `scripts/fetch-docs.sh`.

## Troubleshooting

### Docs not loading

1. Check if docs are fetched: `ls -la docs/nannyapi docs/nannyagent`
2. Check if copied to public: `ls -la public/docs`
3. Check browser console for fetch errors
4. Verify markdown files exist in source repos

### CI/CD not updating

1. Check GitHub Actions logs
2. Verify branch names match
3. Ensure GitHub token has write permissions
4. Check if `[skip ci]` is in commit message

### Build fails

```bash
# Clear and refetch
rm -rf docs public/docs
npm run docs:fetch
npm run build
```

## Contributing

When contributing documentation-related changes:
1. Test locally with both branches (main & add-docs)
2. Update this README if architecture changes
3. Ensure CI/CD workflows still work
4. Add new docs to docRegistry.ts

## License

MIT License - See LICENSE file for details
