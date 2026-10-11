#!/usr/bin/env python3
"""Publish the planner state to the iPad app.

Usage: python3 tools/publish.py LESSONS.json LIB.json [--dry-run]

LESSONS.json / LIB.json are the artifact database documents yoga/lessons and
yoga/lib (as saved by ArtifactData with out_dir). Writes data/published.json,
removes images no longer in the library, and updates the precache list in sw.js.
Every library image must already exist as img/<id>.png (max. 1000 px PNG).
"""
import datetime, json, os, re, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = [a for a in sys.argv[1:] if not a.startswith("--")]
dry = "--dry-run" in sys.argv
if len(args) != 2:
    sys.exit(__doc__)

def load(path):
    d = json.load(open(path, encoding="utf-8"))
    return d.get("data", d)

lessons = load(args[0])["lessons"]
lib = load(args[1])["images"]
img_dir = os.path.join(root, "img")

missing = [x for x in lib if not os.path.exists(os.path.join(img_dir, x["id"] + ".png"))]
if missing:
    print("FEHLT im Repository (img/<id>.png):")
    for x in missing:
        print("  ", x["id"], x["name"])
    sys.exit(2)

ids = {x["id"] for x in lib}
unknown = [(l["name"], s["name"]) for l in lessons for b in l["blocks"] for s in b["steps"] if s.get("img") and s["img"] not in ids]
if unknown:
    print("WARNUNG: Übungen verweisen auf Bilder, die nicht in der Bibliothek sind:")
    for u in unknown:
        print("   %s / %s" % u)

now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
published = {"v": 1, "publishedAt": now, "lessons": lessons,
             "lib": [{"id": x["id"], "name": x["name"], "file": x["id"] + ".png"} for x in lib]}

keep = sorted(x["id"] + ".png" for x in lib)
orphans = sorted(f for f in os.listdir(img_dir) if f not in keep)

core = ["./", "index.html", "manifest.webmanifest", "data/published.json",
        "icon-192.png", "icon-512.png", "apple-touch-icon.png"] + ["img/" + f for f in keep]
sw_path = os.path.join(root, "sw.js")
sw = open(sw_path, encoding="utf-8").read()
sw_new, n = re.subn(r"var CORE = \[.*?\];", lambda m: "var CORE = " + json.dumps(core) + ";", sw, flags=re.S)
if n != 1:
    sys.exit("sw.js: precache list not found")

steps = sum(len(b["steps"]) for l in lessons for b in l["blocks"])
print("Stand %s: %d Stunden (%s), %d Übungen, %d Bilder" % (now, len(lessons), ", ".join(l["name"] for l in lessons), steps, len(lib)))
print("Nicht mehr benötigte Bilddateien: %d" % len(orphans))
if dry:
    print("(Probelauf, nichts geschrieben)")
    sys.exit(0)

os.makedirs(os.path.join(root, "data"), exist_ok=True)
with open(os.path.join(root, "data", "published.json"), "w", encoding="utf-8") as f:
    json.dump(published, f, indent=1, ensure_ascii=False)
for f in orphans:
    os.remove(os.path.join(img_dir, f))
with open(sw_path, "w", encoding="utf-8") as f:
    f.write(sw_new)
print("publishedAt=" + now)
