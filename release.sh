#!/bin/bash

# Update version in manifest.json, versions.json, and package.json first.
# Then set TAG and NOTES below and run this script.

TAG="1.1.7"
FILES=("manifest.json" "main.js" "styles.css")
NOTES="Rename to Autoscroller."

set_gh_repo_default() {
	local origin_url repo
	origin_url=$(git remote get-url origin 2>/dev/null) || {
		echo "No git remote 'origin' configured."
		return 1
	}
	repo=$(printf '%s\n' "$origin_url" | sed -E 's#^(git@github.com:|https://github.com/)([^/]+/[^/.]+)(\.git)?$#\2#')
	if [[ -z "$repo" || "$repo" == "$origin_url" ]]; then
		echo "Could not parse GitHub repo from origin: $origin_url"
		return 1
	}
	gh repo set-default "$repo"
}

npm run build
npm run lint

git add -A && git commit -m "version bump: $TAG"
git tag "$TAG"
git push --follow-tags
set_gh_repo_default
gh release create "$TAG" "${FILES[@]}" --title "$TAG" --notes "$NOTES"
