#!/usr/bin/env python3
"""Per-music-section RMS (dBFS, un-normalised) of a rendered stem — QA helper for AU.secGain calibration.
usage: python3 tools/_secrms.py stem.wav sections.json render.log   (sections.json from tools/_sections.mjs; the log gives the render gain)"""
import sys, json, re, wave
import numpy as np
wav, secs, log = sys.argv[1:4]
g = float(re.search(r'^gain ([\d.]+)', open(log).read(), re.M).group(1))
w = wave.open(wav); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32).reshape(-1, 2) / 32767 / g
info = json.load(open(secs))
for s in info['sections']:
    a, b = int((s['t0'] + 0.4) * sr), int((s['t1'] - 0.2) * sr)
    if b - a < sr: continue
    seg = x[a:b]; r = np.sqrt(np.mean(seg ** 2))
    win = [np.sqrt(np.mean(seg[i:i + sr] ** 2)) for i in range(0, len(seg) - sr + 1, sr // 2)]  # 1-s windows, 50 % hop
    med = np.median(win) if win else r
    print(f"{s['k']:9s} {s['t0']:6.1f}–{s['t1']:6.1f}  rms {20*np.log10(r+1e-12):6.1f}  med1s {20*np.log10(med+1e-12):6.1f}")
