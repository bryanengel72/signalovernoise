#!/usr/bin/env bash
#
# Encode the Higgsfield LOCK clip into hero-ready assets.
#
#   brew install ffmpeg
#   ./scripts/encode-hero-video.sh [source.mp4]
#
# Defaults to the chapter-3 clip from the scroll-film experiment. Pass a path to
# use a Higgsfield-upscaled 1080p source instead — everything below is
# resolution-agnostic.

set -euo pipefail

SRC="${1:-experiments/scroll-film/clips/lock.mp4}"
OUT="public"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found — run: brew install ffmpeg" >&2
  exit 1
fi

[ -f "$SRC" ] || { echo "source not found: $SRC" >&2; exit 1; }
mkdir -p "$OUT"

echo "==> H.264 (universal)"
# -an drops the AAC track the hero never plays.
# -movflags +faststart moves the moov index ahead of mdat so the browser can
# render frame 1 without downloading the whole file. This is the fix that
# matters most — the Higgsfield original ships moov last.
ffmpeg -y -loglevel error -i "$SRC" -an \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 24 -preset slow -g 60 \
  -movflags +faststart \
  "$OUT/hero-lock.mp4"

echo "==> VP9 (smaller where supported)"
ffmpeg -y -loglevel error -i "$SRC" -an \
  -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
  "$OUT/hero-lock.webm"

echo "==> Frame-0 poster"
# Only needed if you want the seamless handoff described in the component
# header. The hero ships against hero-radar.webp until you opt in.
ffmpeg -y -loglevel error -i "$SRC" -frames:v 1 \
  -c:v libwebp -quality 82 \
  "$OUT/hero-lock-poster.webp"

echo
echo "==> Verify"
python3 - "$OUT/hero-lock.mp4" <<'PY'
import sys
d = open(sys.argv[1], 'rb').read()
ok = d.find(b'moov') < d.find(b'mdat')
print(f"  faststart: {'OK' if ok else 'FAILED — browser will block on full download'}")
print(f"  audio track: {'present (should be absent)' if b'mp4a' in d else 'stripped'}")
PY

ls -lh "$OUT"/hero-lock.mp4 "$OUT"/hero-lock.webm "$OUT"/hero-lock-poster.webp \
  | awk '{printf "  %-28s %s\n", $9, $5}'
