# Infinite Moodboard release notes

Every stable release from v0.51.0 onward must include a version-matched public release-notes file. The update manifest links to that file, and both checkpoint and package scripts stop if it is missing or inconsistent.

## Releases

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
