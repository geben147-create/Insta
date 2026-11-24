#!/usr/bin/env python3
"""Read-only scan of the existing design asset folder. Stdlib only."""
import argparse, hashlib, json, pathlib, unicodedata
HERE=pathlib.Path(__file__).resolve().parent
CONFIG=json.loads((HERE/"asset-manifest.json").read_text(encoding="utf-8"))
p=argparse.ArgumentParser()
p.add_argument("--root",default=CONFIG["root"])
p.add_argument("--out",default="broadcast-assets-resolved.json")
a=p.parse_args()
root=pathlib.Path(a.root).expanduser()
if not root.is_dir(): raise SystemExit("MISSING FOLDER: "+str(root))
def norm(n): return unicodedata.normalize("NFC",n).casefold()
def digest(path):
    h=hashlib.sha256()
    with path.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""): h.update(b)
    return h.hexdigest()
by_hash={}; by_name={}; errors=[]
for f in sorted(root.rglob("*")):
    if not f.is_file() or f.suffix.lower()!=".png": continue
    try:
        sha=digest(f)
        by_hash.setdefault(sha,[]).append(str(f.resolve()))
        by_name.setdefault(norm(f.name),[]).append((str(f.resolve()),sha))
    except OSError as e: errors.append({"path":str(f),"error":str(e)})
rows=[]
for asset in CONFIG["assets"]:
    hits=by_hash.get(asset["sha256"],[])
    names=[asset["filename"],*asset["aliases"]]
    candidates=[{"path":path,"sha256":sha} for n in names for path,sha in by_name.get(norm(n),[])]
    rows.append({"id":asset["id"],"status":"PASS" if hits else "HASH_MISMATCH" if candidates else "MISSING","path":hits[0] if hits else None,"sha256":asset["sha256"],"duplicate_paths":hits[1:],"unverified_candidates":candidates if not hits else [],"use":asset["use"]})
out={"root":str(root.resolve()),"assets":rows,"sceneRules":CONFIG["sceneRules"],"errors":errors}
target=pathlib.Path(a.out).expanduser()
if target.resolve().is_relative_to(root.resolve()): raise SystemExit("Choose an output outside the source folder.")
target.parent.mkdir(parents=True,exist_ok=True)
target.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding="utf-8")
for r in rows: print(r["status"],r["id"],r["path"] or "")
print("Manifest:",target.resolve())
raise SystemExit(0 if all(r["status"]=="PASS" for r in rows) else 2)
