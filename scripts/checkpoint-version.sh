#!/usr/bin/env bash
set -euo pipefail

version="${1:-}"
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "用法：$0 X.Y.Z" >&2
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_dir="$(cd "$script_dir/.." && pwd)"
backup_dir="${INFINITE_MOODBOARD_BACKUP_DIR:-$(cd "$repo_dir/../.." && pwd)/backups/infinite-moodboard}"
tag="backup/v$version"

cd "$repo_dir"

package_version="$(node -p "require('./package.json').version")"
if [[ "$package_version" != "$version" ]]; then
  echo "package.json 是 $package_version，和要求的 $version 不一致。" >&2
  exit 3
fi

node ./scripts/verify-release-notes.mjs "$version"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "工作目錄仍有未提交變更；請先完成測試與提交再封版。" >&2
  exit 4
fi

if git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then
  if [[ "$(git rev-list -n 1 "$tag")" != "$(git rev-parse HEAD)" ]]; then
    echo "$tag 已指向另一個版本，停止以避免覆寫備份。" >&2
    exit 5
  fi
else
  git tag -a "$tag" -m "Infinite Moodboard v$version backup"
fi

mkdir -p "$backup_dir"
archive_path="$backup_dir/Infinite-Moodboard-v$version-source.zip"
archive_tmp="$backup_dir/.Infinite-Moodboard-v$version-source.tmp.zip"

# The clean working tree is identical to the verified tag. Archive tracked files
# from disk so macOS iCloud-evicted historical Git objects cannot stall backup.
rm -f "$archive_tmp"
git ls-files | zip -q -y "$archive_tmp" -@
unzip -tq "$archive_tmp" >/dev/null
mv -f "$archive_tmp" "$archive_path"

echo "已建立 $tag"
echo "原始碼快照：$archive_path"
