# Release checklist

1. Update `package.json`, `package-lock.json`, `version.js`, the update manifest, and `public/release-notes/vX.Y.Z.html` to the same semantic version.
2. Run `npm run release:verify -- X.Y.Z`, `npm test`, `npm run build`, and `git diff --check`.
3. Commit the complete milestone, then run `./scripts/checkpoint-version.sh X.Y.Z` to create the recoverable `backup/vX.Y.Z` tag and verified source snapshot.
4. Push `main` and verify the GitHub Pages workflow succeeds and the public app reports the expected version.
5. Create and push the annotated `vX.Y.Z` tag. The release workflow retests the commit and publishes the self-hosted ZIP, release-notes HTML, and `SHA256SUMS.txt`.
6. Reopen the GitHub Release, download every asset, verify the checksums, and confirm the Release API exposes the asset `download_count` fields.
7. Keep GitHub Pages, GitHub Release, Google OAuth origins, Drive permission acceptance, PETFASHION promotion, and any custom domain as separate observable release gates.

## Drive sharing acceptance gate

Before calling Drive-native sharing accepted, verify one exact disposable test file with two ordinary Google accounts, using only the app's normal sharing flow. Do not special-case an email address or manually grant access outside the app to turn a failed product test into a pass. Never change an existing user document's ACL merely to complete acceptance.

Verify these gates separately:

- A restricted link leaves an uninvited account blocked, with an exact-file native Drive path to request access; an API/Picker failure must not be classified as proof that the account lacks file permission.
- The owner enables link viewing in the app. Another account opens the same deep link and reads the correct nonempty board in view-only mode without an individual exception.
- A viewer can find the native Drive path to request editing. Only an explicit owner decision changes editing rights; verify the app's normal permission update and refresh path.
- An explicitly invited editor opens the exact file, makes one edit, and both accounts read back the same file/version. Preserve resource keys and retain conflict/recovery protections.

Use `http://localhost:5000/?sharingPreview=denied` to inspect the generic interface states without Google authorization or mutations. This development-only preview uses synthetic data and is not real Drive acceptance.

Legacy `firestore.rules` and collaboration sources remain only for migration review. Never deploy that rule fragment or reconnect production `?collab=` links to Firestore.
