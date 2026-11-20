#!/usr/bin/env python3
"""Pre-send duplicate guard for the PUBLIC outreach registry. Python standard library only."""
import argparse
import hashlib
import json
import sys
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

REGISTRY = Path(__file__).with_name("contacts.json")

def normalize_url(text: str) -> str:
    if not text:
        return ""
    value = text.strip()
    try:
        p = urlsplit(value if "://" in value else "https://" + value)
        host = p.netloc.lower().removeprefix("www.")
        path = p.path.rstrip("/")
        if path.endswith(("/videos", "/featured", "/about")):
            path = path.rsplit("/", 1)[0]
        return urlunsplit(("https", host, path, "", ""))
    except ValueError:
        return value.lower()

def main() -> int:
    ap = argparse.ArgumentParser(description="Check existing outreach records BEFORE emailing.")
    ap.add_argument("--email", required=True, help="Recipient's public business email")
    ap.add_argument("--channel-url", default="", help="Optional original channel URL")
    args = ap.parse_args()
    try:
        doc = json.loads(REGISTRY.read_text(encoding="utf-8"))
        rows = doc["rows"]
    except (OSError, ValueError, KeyError) as e:
        print(f"STOP: Could not read registry: {e}")
        return 4
    email = args.email.strip().lower()
    digest = hashlib.sha256(email.encode("utf-8")).hexdigest()
    channel = normalize_url(args.channel_url)
    matches = [r for r in rows if r.get("contact_sha256") == digest or
               (channel and normalize_url(r.get("source_url", "")) == channel)]
    if matches:
        for r in matches:
            print(f"DO_NOT_SEND | {r['name']} | {r['status']} | {r['next_action']}")
        return 3
    print("NOT_FOUND_IN_THIS_REGISTRY: Check Gmail Sent and alternate emails for this channel before sending.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
