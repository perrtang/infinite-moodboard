#!/usr/bin/env bash
set -euo pipefail

version="${1:-}"
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Usage: $0 X.Y.Z" >&2
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_dir="$(cd "$script_dir/.." && pwd)"
package_version="$(node -p "require('$repo_dir/package.json').version")"

if [[ "$package_version" != "$version" ]]; then
  echo "package.json is $package_version, not $version." >&2
  exit 3
fi

release_dir="$repo_dir/release"
archive_name="Infinite-Moodboard-v$version-self-hosted.zip"
archive_path="$release_dir/$archive_name"
checksum_path="$release_dir/SHA256SUMS.txt"
staging_dir="$(mktemp -d)"
package_dir="$staging_dir/Infinite-Moodboard-v$version"

cleanup() {
  rm -rf "$staging_dir"
}
trap cleanup EXIT

mkdir -p "$release_dir" "$package_dir"
rm -f "$archive_path" "$checksum_path"

cd "$repo_dir"
VITE_BASE_PATH=./ npm run build

cp -R dist/. "$package_dir/"
cp SELF_HOSTING.md PRIVACY.md SECURITY.md "$package_dir/"

cd "$staging_dir"
zip -q -r "$archive_path" "Infinite-Moodboard-v$version"

cd "$release_dir"
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$archive_name" > "$checksum_path"
else
  shasum -a 256 "$archive_name" > "$checksum_path"
fi

echo "Created $archive_path"
echo "Created $checksum_path"
