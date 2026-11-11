#!/usr/bin/env python3
"""Build the read-only iPad app (index.html + sw.js cache version) from the planner artifact source.

Usage: python3 tools/build_app.py PLANNER.html
The planner source is the artifact HTML (skeleton head, then <title>/<style> and the app markup + script in <body>).
The app version is a running number in tools/app_version.json; it goes up by one whenever the built app changes.
"""
import hashlib, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = os.path.join(ROOT, 'tools', 'app_template')
def rd(p): return open(p, encoding='utf-8').read()

src = rd(sys.argv[1])
body = src.split('<body>', 1)[1].rsplit('</body>', 1)[0]
k = body.index('<div class="app"')
headpart, bodypart = body[:k].strip('\n'), body[k:]
j = bodypart.index('<script>')
markup, script = bodypart[:j], bodypart[j:].rstrip()
top, mid, shim, tail = (rd(os.path.join(T, n)) for n in ('top.html', 'mid.html', 'shim.html', 'tail.html'))

# the build id depends only on the content, not on the version number
build = hashlib.sha256((top + headpart + mid + markup + shim + script + tail).encode('utf-8')).hexdigest()[:10]
vf = os.path.join(ROOT, 'tools', 'app_version.json')
state = json.load(open(vf)) if os.path.exists(vf) else {'version': 0, 'build': ''}
if state.get('build') != build:
    state = {'version': int(state.get('version', 0)) + 1, 'build': build}
    json.dump(state, open(vf, 'w'), indent=2)

shim = shim.replace('%BUILD%', build).replace('%VERSION%', str(state['version']))
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(top + headpart + mid + markup + shim + script + tail)

sw = os.path.join(ROOT, 'sw.js')
s = rd(sw)
s2 = re.sub(r'var V = "yoga-[^"]*";', 'var V = "yoga-%s";' % build, s, count=1)
assert s2 != s or 'yoga-%s' % build in s, 'cache version not found in sw.js'
open(sw, 'w', encoding='utf-8').write(s2)
print('app version %d (build %s)' % (state['version'], build))
