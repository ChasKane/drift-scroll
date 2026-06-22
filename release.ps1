# PowerShell release script for Windows
# Usage: .\release.ps1

# Update version in manifest.json, versions.json, and package.json first.
# Then set $TAG and $NOTES below and run this script.

$TAG = "1.1.7"
$FILES = @("manifest.json", "main.js", "styles.css")
$NOTES = "Rename to Autoscroller."

function Set-GhRepoDefault {
	$originUrl = git remote get-url origin 2>$null
	if (-not $originUrl) {
		Write-Error "No git remote 'origin' configured."
		exit 1
	}
	if ($originUrl -match 'github.com[:/](?<repo>[^/]+/[^/.]+)') {
		gh repo set-default $Matches['repo']
		return
	}
	Write-Error "Could not parse GitHub repo from origin: $originUrl"
	exit 1
}

npm run build
npm run lint

git add -A
git commit -m "version bump: $TAG"
git tag "$TAG"
git push --follow-tags
Set-GhRepoDefault
gh release create "$TAG" $FILES --title "$TAG" --notes "$NOTES"
