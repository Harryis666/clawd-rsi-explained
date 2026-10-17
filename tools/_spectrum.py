#!/usr/bin/env python3
"""Long-term average spectrum (octave bands) of one or more WAV files — tonal-balance QA for the soundtrack.
usage: python3 tools/_spectrum.py a.wav [b.wav ...] [--from S --to S]
Prints each octave band's share of the total power (dB re total) plus two summary indices:
  warm  = 63–250 Hz bands vs total,  harsh = 2k–8k bands vs total (higher = brighter / more fatiguing)."""
import sys, wave, numpy as np
args = [a for a in sys.argv[1:] if not a.startswith('--')]
opt = {sys.argv[i][2:]: float(sys.argv[i + 1]) for i in range(1, len(sys.argv) - 1) if sys.argv[i].startswith('--')}
files = [a for a in args if a.endswith('.wav')]
FC = [31.5, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
def read(p):
    with wave.open(p, 'rb') as w:
        sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float64) / 32768
    x = x.reshape(-1, ch).mean(axis=1)
    a, b = int(opt.get('from', 0) * sr), int(opt.get('to', 1e9) * sr)
    return sr, x[a:b]
def bands(p):
    sr, x = read(p); N = 8192; hop = N // 2; win = np.hanning(N)
    nf = max(1, (len(x) - N) // hop); acc = np.zeros(N // 2 + 1)
    for i in range(nf):
        seg = x[i * hop:i * hop + N]
        if len(seg) < N: break
        acc += np.abs(np.fft.rfft(seg * win)) ** 2
    f = np.fft.rfftfreq(N, 1 / sr); tot = acc[(f >= 20) & (f <= 20000)].sum()
    out = [acc[(f >= fc / 2 ** 0.5) & (f < fc * 2 ** 0.5)].sum() / tot for fc in FC]
    rms = 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
    return out, rms
rows = [(p, *bands(p)) for p in files]
hdr = 'file'.ljust(34) + ''.join(f'{(str(int(fc)) if fc >= 63 else "31"):>7}' for fc in FC) + '   warm  harsh   rms'
print(hdr)
for p, b, rms in rows:
    db = [10 * np.log10(v + 1e-12) for v in b]
    warm = 10 * np.log10(sum(b[1:4]) + 1e-12); harsh = 10 * np.log10(sum(b[6:9]) + 1e-12)
    print(p.split('/')[-1][:33].ljust(34) + ''.join(f'{v:7.1f}' for v in db) + f'{warm:7.1f}{harsh:7.1f}{rms:7.1f}')
