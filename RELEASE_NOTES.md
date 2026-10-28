# Infinite Moodboard release notes

Every stable release from v0.51.0 onward must include a version-matched public release-notes file. The update manifest links to that file, and both checkpoint and package scripts stop if it is missing or inconsistent.

## Releases

- [v0.54.6](./public/release-notes/v0.54.6.html) — safer local version cleanup, protected recovery checkpoints, and reduced duplicate automatic snapshots.

- [v0.54.5](./public/release-notes/v0.54.5.html) — generic recipient access recovery, explicit restricted links, preserved resource keys on reopening, and account-independent acceptance criteria.
- [v0.54.4](./public/release-notes/v0.54.4.html) — dismiss stalled Picker overlays, preserve retry errors, and verify real key acceptance separately from shared-file content.
- [v0.54.3](./public/release-notes/v0.54.3.html) — origin-only referrer policy for restricted Google Picker keys, deployment guard, and real recipient-file acceptance harness.
- [v0.54.2](./public/release-notes/v0.54.2.html) — browser-compatible conditional Drive updates, correct multipart uploads, shared-file resource keys, and clearer storage errors.
- [v0.54.1](./public/release-notes/v0.54.1.html) — explicit cloud-update progress, verified success, and recoverable inline failures.
- [v0.54.0](./public/release-notes/v0.54.0.html) — explicit one-way cloud saves, recoverable cloud loads, independent local copies, and stale-read / cross-tab safeguards.
- [v0.53.0](./public/release-notes/v0.53.0.html) — direct layer-row multi-selection, safer Drive conflict decisions, and verified Google Picker configuration.
- [v0.52.0](./public/release-notes/v0.52.0.html) — large-board Google Drive sync recovery, compact local queue storage, and truthful recovery warnings.
- [v0.51.0](./public/release-notes/v0.51.0.html) — continuous Google Drive onboarding, guide interaction corrections, and mandatory release-note verification.

## Required sections

- Version and release date
- Update contents
- Fixes
- Attention items
- Recovery and backup information

Run `npm run release:verify -- X.Y.Z` before checkpointing or packaging a release.
