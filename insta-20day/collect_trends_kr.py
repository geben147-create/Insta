#!/usr/bin/env python3
"""Fetch public KR Google Trends RSS once, write CSV. No retries, posting or API keys."""
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import csv
import sys
import xml.etree.ElementTree as ET

URL = "https://trends.google.com/trending/rss?geo=KR"
NS = {"ht": "https://trends.google.com/trending/rss"}
def main():
    try:
        req = Request(URL, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req, timeout=18) as conn:
            if conn.status != 200:
                raise RuntimeError(f"Unexpected HTTP {conn.status}")
            xml = conn.read(2_000_000)
        items = ET.fromstring(xml).findall("./channel/item")
        if not items:
            raise RuntimeError("NO_ITEMS from official RSS")
    except (HTTPError, URLError, TimeoutError, ET.ParseError, RuntimeError) as e:
        print("ACCESS_FAILED / NO_AUTOMATED_BYPASS:", str(e)[:220])
        return 1
    t = datetime.now().astimezone()
    folder = Path("outputs") / "trends_kr"
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / ("google_trends_KR_" + t.strftime("%Y%m%d_%H%M%S") + ".csv")
    with path.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.writer(file)
        writer.writerow(["observed_at","geo","keyword","approx_search_volume","published","official_source","news_titles","fact_verified","instagram_vph"])
        for item in items:
            news = item.findall("ht:news_item", NS)
            titles = " | ".join(node.findtext("ht:news_item_title", default="", namespaces=NS) for node in news)
            writer.writerow([t.isoformat(timespec="seconds"),"KR",item.findtext("title", default=""),
                             item.findtext("ht:approx_traffic", default="", namespaces=NS),
                             item.findtext("pubDate", default=""),URL,titles,"NOT_VERIFIED","NOT_MEASURED"])
    print("CSV_SAVED",str(path.resolve()),"items=",len(items))
    return 0
if __name__ == "__main__":
    sys.exit(main())
