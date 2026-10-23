# Release checklist

1. Update `package.json`, `package-lock.json`, `version.js`, the update manifest, and `public/release-notes/vX.Y.Z.html` to the same semantic version.
2. Run `npm run release:verify -- X.Y.Z`, `npm test`, `npm run build`, and `git diff --check`.
3. Commit the complete milestone, then run `./scripts/checkpoint-version.sh X.Y.Z` to create the recoverable `backup/vX.Y.Z` tag and verified source snapshot.
4. Push `main` and verify the GitHub Pages workflow succeeds and the public app reports the expected version.
5. Create and push the annotated `vX.Y.Z` tag. The release workflow retests the commit and publishes the self-hosted ZIP, release-notes HTML, and `SHA256SUMS.txt`.
6. Reopen the GitHub Release, download every asset, verify the checksums, and confirm the Release API exposes the asset `download_count` fields.
7. Keep GitHub Pages, GitHub Release, Google OAuth origins, Drive permission acceptance, PETFASHION promotion, and any custom domain as separate observable release gates.

## Drive sharing acceptance gate

Before calling Drive-native sharing accepted, verify one exact Drive file with two Google accounts: the owner invites the second account as viewer, the second account opens the app deep link read-only, the owner changes that account to editor, and both accounts read back the same file/version after one edit. Also test restricted access and link-view access separately.

Legacy `firestore.rules` and collaboration sources remain only for migration review. Never deploy that rule fragment or reconnect production `?collab=` links to Firestore.
