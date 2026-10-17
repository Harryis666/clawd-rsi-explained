# Print every tools/_textqa.mjs issue group, grouped by scene (all types; see _qa_list.py for a filtered view).
# usage: python3 tools/_qa_sum.py out/textqa_ep1_zh.json [minN=1]
import json,sys
d=json.load(open(sys.argv[1])); minn=int(sys.argv[2]) if len(sys.argv)>2 else 1
cur=None
for g in d:
    if g['n']<minn: continue
    if g['id']!=cur: cur=g['id']; print('##',cur)
    s=g['s'][:22]; s2=(g.get('s2') or '')[:22]
    extra=f" ↔ {s2}({g.get('px2')})" if s2 else ''
    print(f"  {g['type'][:4]} {g['t0']:.1f}-{g['t1']:.1f} n{g['n']} w{g['worst']} [{g.get('tag','')}] {s}({g.get('px')}){extra}" + (f" b{g['b']}" if g.get('b') else ''))
