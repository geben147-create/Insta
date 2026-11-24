#!/usr/bin/env bash
mkdir -p "$HOME/ai-work/broadcast-assets-tool" &&
cd "$HOME/ai-work/broadcast-assets-tool" &&
curl -fL --retry 2 'https://raw.githubusercontent.com/geben147-create/Insta/b3c91bde8bc1d1afaf7961f505b09f120ecedb8b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/broadcast-10-20261124/asset-manifest.json' -o asset-manifest.json &&
curl -fL --retry 2 'https://raw.githubusercontent.com/geben147-create/Insta/b3c91bde8bc1d1afaf7961f505b09f120ecedb8b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/broadcast-10-20261124/scan-assets.py' -o scan-assets.py &&
python3 scan-assets.py --root "/home/yh/Pictures/썸네일국뽕/디자인요소썸네일자막_로고" --out "$HOME/ai-work/broadcast-assets-resolved.json"
