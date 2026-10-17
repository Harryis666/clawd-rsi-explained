#!/usr/bin/env python3
"""Absolute octave-band change between two loudness-normalised mixes (B − A, dB) — tonal-balance A/B for the warm-mix pass.
usage: python3 tools/_tonal.py old.wav new.wav [old2.wav new2.wav ...]"""
import sys, wave, numpy as np
FC = [31.5, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
def bands(p):
    with wave.open(p, 'rb') as w:
        sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float64) / 32768
    x = x.reshape(-1, ch).mean(axis=1); N = 8192; hop = N // 2; win = np.hanning(N); acc = np.zeros(N // 2 + 1); k = 0
    for i in range(0, len(x) - N, hop): acc += np.abs(np.fft.rfft(x[i:i + N] * win)) ** 2; k += 1
    f = np.fft.rfftfreq(N, 1 / sr)
    return np.array([10 * np.log10(acc[(f >= fc / 2 ** 0.5) & (f < fc * 2 ** 0.5)].sum() / k + 1e-20) for fc in FC])
print('pair'.ljust(30) + ''.join(f'{(str(int(fc)) if fc >= 63 else "31"):>7}' for fc in FC))
a = sys.argv[1:]
for i in range(0, len(a) - 1, 2):
    d = bands(a[i + 1]) - bands(a[i])
    print((a[i + 1].split('/')[-1][:29]).ljust(30) + ''.join(f'{v:+7.1f}' for v in d))
