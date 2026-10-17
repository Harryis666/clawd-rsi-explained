# Summarise a tools/_textqa.mjs report: skip number-wall digits / ASCII art, one line per issue group.
# usage: python3 tools/_qa_list.py out/textqa_ep1_zh.json [types=small,overlap,...] [minN=1]
import json, re, sys
d = json.load(open(sys.argv[1]))
types = set(sys.argv[2].split(',')) if len(sys.argv) > 2 and sys.argv[2] else None
minn = int(sys.argv[3]) if len(sys.argv) > 3 else 1
skip = re.compile(r'^[-\d.e+]+$|^[\s▐▛█▜▌▝▘▗▖]+$|^Z$|^Zzz')
cur = None
for g in d:
    if types and g['type'] not in types: continue
    if g['n'] < minn: continue
    if skip.match(g['s'].strip()) or (g.get('s2') and skip.match(g['s2'].strip())): continue
    if g['id'] != cur: cur = g['id']; print('##', cur)
    s2 = (g.get('s2') or '')[:22]
    extra = f" <> {s2}({g.get('px2')})" if s2 else ''
    print(f"  {g['type'][:4]} {g['t0']:.1f}-{g['t1']:.1f} n{g['n']} w{g['worst']} [{g.get('tag','')}] {g['s'][:26]}({g.get('px')}){extra}" + (f" b{g['b']}" if g.get('b') else ''))
