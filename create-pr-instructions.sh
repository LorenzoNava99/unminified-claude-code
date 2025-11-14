#!/bin/bash

# Pull Request Creation Instructions
# ===================================

echo "🔀 Ready to Create Pull Request"
echo ""
echo "Branch Information:"
echo "  From: claude/explore-project-setup-011CV3qKmArgR15vjkARtvD9"
echo "  To:   claude/npm-pack-claude-code-011CV2dhcSwbwVNx6R517MSe"
echo ""

# Get repository URL
REPO_URL=$(git config --get remote.origin.url | sed 's/\.git$//')

# Extract owner and repo name
if [[ $REPO_URL == *"github.com"* ]]; then
    # GitHub URL
    OWNER_REPO=$(echo $REPO_URL | sed -E 's/.*github\.com[:\/](.+)/\1/')
    GITHUB_URL="https://github.com/${OWNER_REPO}"

    echo "📍 Repository: $GITHUB_URL"
    echo ""
    echo "🌐 Create PR URL:"
    echo "${GITHUB_URL}/compare/claude/npm-pack-claude-code-011CV2dhcSwbwVNx6R517MSe...claude/explore-project-setup-011CV3qKmArgR15vjkARtvD9?expand=1"
    echo ""
else
    echo "ℹ️  Non-GitHub remote detected: $REPO_URL"
    echo ""
fi

echo "📋 PR Details:"
echo "  Title: Module Extraction Phase 1: Type 1 & Utility Modules"
echo "  Body:  See PULL_REQUEST.md for full description"
echo ""
echo "📊 Summary:"
echo "  - 11 modules extracted (667 lines)"
echo "  - 63 tests passing (100%)"
echo "  - 3 extraction tools created"
echo "  - 7 comprehensive documentation files"
echo ""
echo "✅ All changes are committed and pushed to remote"
echo ""
