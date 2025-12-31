# CI/CD & Documentation Synchronization

This project uses GitHub Actions for Continuous Integration, Continuous Deployment, and automated documentation synchronization.

## Workflows Overview

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **CI Pipeline** | `ci.yml` | PR to `main` | Lints, typechecks, builds, and runs tests to ensure code quality. |
| **CD Pipeline** | `cd.yml` | Push to `main` | Builds the application for deployment. |
| **Sync Docs** | `sync-docs.yml` | Schedule (6h) | Periodically fetches latest docs from `nannyapi` and `nannyagent`. |
| **Update Docs** | `update-docs.yml` | Webhook | Updates docs immediately when changes occur in external repositories. |

## CI Pipeline (`ci.yml`)

Ensures that every Pull Request meets quality standards before merging.

- **Steps**:
  1. Checkout code.
  2. Install dependencies (`npm ci`).
  3. Lint code (`npm run lint`).
  4. Type check (`npm run typecheck`).
  5. Build (`npm run build`).
  6. Run tests with coverage (`npm run test -- --coverage`).
  7. Upload coverage artifacts.

## CD Pipeline (`cd.yml`)

Handles the build and deployment process when code is pushed to `main`.

- **Steps**:
  1. Checkout code.
  2. Install dependencies.
  3. Build application.
  4. *Deployment (Pending)*: Currently configured to build only. Cloudflare Pages deployment steps are prepared but commented out.

## Documentation Synchronization

The documentation in `docs/nannyapi` and `docs/nannyagent` is fetched from external repositories.

### 1. Scheduled Sync (`sync-docs.yml`)
Runs automatically every 6 hours to ensure documentation doesn't drift too far if webhooks fail. It fetches from the `main` branch of the external repositories.

### 2. Event-Driven Sync (`update-docs.yml`)
Allows for immediate updates when changes are pushed to `nannyapi` or `nannyagent`. This uses the `repository_dispatch` event.

#### Setting up the Trigger in External Repositories

To trigger an update in `nannyui` when `nannyapi` or `nannyagent` changes, add the following GitHub Action workflow to the external repositories:

```yaml
name: Trigger NannyUI Docs Update

on:
  push:
    branches:
      - main
    paths:
      - 'docs/**'

jobs:
  trigger-update:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger NannyUI Update
        uses: peter-evans/repository-dispatch@v2
        with:
          token: ${{ secrets.NANNYUI_PAT }}
          repository: nannyagent/nannyui
          event-type: docs-updated
          client-payload: '{"ref": "${{ github.ref }}", "sha": "${{ github.sha }}"}'
```

**Requirements:**
- A Personal Access Token (PAT) with `repo` scope must be added as a secret (`NANNYUI_PAT`) in the external repositories.
- The PAT must belong to a user with write access to `nannyui`.

## Local Development

To fetch documentation locally:

```bash
# Fetch from default branch (add-docs)
./scripts/fetch-docs.sh

# Fetch from main branch
./scripts/fetch-docs.sh main
```
