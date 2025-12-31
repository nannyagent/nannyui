#!/bin/bash

# Script to fetch documentation from nannyapi and nannyagent repositories
# Can be run manually or via CI/CD on main branch changes

set -e

BRANCH="${1:-main}"  # Default to main branch
DOCS_DIR="$(dirname "$0")/../docs"

echo "Fetching documentation from branch: $BRANCH"

# Create docs directories
mkdir -p "$DOCS_DIR/nannyapi"
mkdir -p "$DOCS_DIR/nannyagent"

# Fetch nannyapi docs
echo "Fetching nannyapi documentation..."
NANNYAPI_DOCS=(
  "API_REFERENCE"
  "ARCHITECTURE"
  "CONTRIBUTING"
  "DEPLOYMENT"
  "INSTALLATION"
  "PATCHING"
  "PROXMOX"
  "QUICKSTART"
  "SECURITY"
)

for doc in "${NANNYAPI_DOCS[@]}"; do
  echo "  - Fetching $doc.md"
  curl -sf "https://raw.githubusercontent.com/nannyagent/nannyapi/$BRANCH/docs/${doc}.md" \
    -o "$DOCS_DIR/nannyapi/${doc}.md" || echo "    Warning: Could not fetch $doc.md"
done

# Fetch nannyagent docs
echo "Fetching nannyagent documentation..."
NANNYAGENT_DOCS=(
  "API_INTEGRATION"
  "ARCHITECTURE"
  "CONFIGURATION"
  "EBPF_MONITORING"
  "INSTALLATION"
  "PROXMOX_INTEGRATION"
)

for doc in "${NANNYAGENT_DOCS[@]}"; do
  echo "  - Fetching $doc.md"
  curl -sf "https://raw.githubusercontent.com/nannyagent/nannyagent/$BRANCH/docs/${doc}.md" \
    -o "$DOCS_DIR/nannyagent/${doc}.md" || echo "    Warning: Could not fetch $doc.md"
done

echo "✓ Documentation fetch complete!"
echo "Docs stored in: $DOCS_DIR"
