# Release checklist

1. Update `package.json`, `package-lock.json`, `version.js`, the update manifest, and release notes to the same semantic version.
2. Run `npm test`, `npm run build`, and `git diff --check`.
3. Commit the complete milestone, then run `./scripts/checkpoint-version.sh X.Y.Z` to create the recoverable `backup/vX.Y.Z` tag, Git bundle, and source snapshot.
4. Push `main` and verify the GitHub Pages workflow succeeds and the public app reports the expected version.
5. Create and push the annotated `vX.Y.Z` tag. The release workflow retests the commit and publishes the self-hosted ZIP plus `SHA256SUMS.txt`.
6. Reopen the GitHub Release, download both assets, verify the checksum, and confirm the Release API exposes the asset `download_count` fields.
7. Keep GitHub Pages, GitHub Release, Firebase rules, OAuth origins, PETFASHION promotion, and any custom domain as separate observable release gates.

## Firestore safety gate

Never run `firebase deploy --only firestore:rules` from this repository. Its `firestore.rules` file contains only the Infinite Moodboard paths. Merge the fragment into the authoritative PETFASHION ruleset and verify every unrelated production rule remains present before deploying from the central infrastructure repository.
