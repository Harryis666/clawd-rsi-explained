#!/usr/bin/env python3
"""Per-music-section integrated loudness (LUFS, un-normalised via the render gain) — QA helper for AU.secGain calibration.
usage: python3 tools/_seclufs.py stem.wav sections.json render.log [style …]"""
import sys, json, re, subprocess, math
wav, secs, log = sys.argv[1:4]; only = set(sys.argv[4:])
g = float(re.search(r'^gain ([\d.]+)', open(log).read(), re.M).group(1)); off = 20 * math.log10(g)
for s in json.load(open(secs))['sections']:
    if only and s['k'] not in only: continue
    a, b = s['t0'] + 0.4, s['t1'] - 0.2
    if b - a < 1.5: continue
    o = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-ss', f'{a:.2f}', '-to', f'{b:.2f}', '-i', wav, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = re.findall(r'I:\s+(-?[\d.]+) LUFS', o)
    print(f"{s['k']:9s} {s['t0']:6.1f}–{s['t1']:6.1f}  {float(m[-1]) - off:6.1f} LUFS" if m else f"{s['k']} n/a")
