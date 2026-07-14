#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${PROJECT_DIR}/.." && pwd)"
SOURCE_DIR="${REPO_ROOT}/JOSHUA"
BUILD_DIR="${PROJECT_DIR}/.bundle-tmp"
OUTPUT_DIR="${PROJECT_DIR}/public/games"
OUTPUT_FILE="${OUTPUT_DIR}/joshua.jsdos"

if [[ ! -d "${SOURCE_DIR}" ]]; then
  echo "Missing DOS game files at ${SOURCE_DIR}" >&2
  exit 1
fi

if ! command -v zip >/dev/null 2>&1 && ! command -v python3 >/dev/null 2>&1; then
  echo "The zip command or python3 is required to build joshua.jsdos." >&2
  exit 1
fi

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}/.jsdos" "${BUILD_DIR}/JOSHUA" "${OUTPUT_DIR}"

cp -R "${SOURCE_DIR}/." "${BUILD_DIR}/JOSHUA/"

cat > "${BUILD_DIR}/.jsdos/dosbox.conf" <<'CONFIG'
[sdl]
fullscreen=false
fullresolution=desktop
windowresolution=original
autolock=true
sensitivity=100

[dosbox]
machine=vgaonly
memsize=16

[render]
frameskip=0
aspect=true
scaler=normal2x

[cpu]
core=normal
cputype=386_slow
cycles=fixed 6000

[mixer]
nosound=false
rate=44100
blocksize=1024
prebuffer=20

[sblaster]
sbtype=sb16
sbbase=220
irq=7
dma=1
hdma=5
sbmixer=true
oplmode=auto

[speaker]
pcspeaker=true
tandy=auto
disney=true

[joystick]
joysticktype=auto
timed=true
autofire=false

[dos]
xms=false
ems=false
umb=false
keyboardlayout=auto

[autoexec]
mount c .
c:
cd JOSHUA
JOSHUA.EXE
exit
CONFIG

(
  cd "${BUILD_DIR}"
  if command -v zip >/dev/null 2>&1; then
    zip -qr "${OUTPUT_FILE}" .
  else
    python3 - "${OUTPUT_FILE}" <<'PY'
import os
import sys
import zipfile

output_file = sys.argv[1]
with zipfile.ZipFile(output_file, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    for root, _, files in os.walk("."):
        for name in files:
            path = os.path.join(root, name)
            archive.write(path, path[2:] if path.startswith("./") else path)
PY
  fi
)

rm -rf "${BUILD_DIR}"
echo "Created ${OUTPUT_FILE}"
