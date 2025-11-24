#!/bin/bash

### ZEROth gh repo set-default
### FIRST update the version in
# manifest.json (apparently this is the only required one?)
# versions.json
# package.json

TAG="1.1.3"
FILES=("manifest.json" "main.js" "styles.css")
NOTES="Fix fatal error (on windows)."

git add -A && git commit -m "version bump: $TAG"
git tag "$TAG"
git push --follow-tags
gh release create "$TAG" "$FILES" --title "$TAG" --notes "$NOTES"