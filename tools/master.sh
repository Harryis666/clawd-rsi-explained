#!/usr/bin/env bash
# Master the raw soundtrack to −16 LUFS (peak-limited) and mux it with the rendered video.
# usage: tools/master.sh [lang]     needs: out/audio_raw_<lang>.wav (tools/render-audio.mjs) and out/video_<lang>.mp4 (NOMUX=1 tools/render.mjs)
set -euo pipefail
cd "$(dirname "$0")/.."
L="${1:-zh}"; RAW="out/audio_raw_${L}.wav"; WAV="out/audio_${L}.wav"; VID="out/video_${L}.mp4"; OUT="out/rsi-clawd_${L}.mp4"
TARGET="${TARGET:--16}"
I=$(ffmpeg -hide_banner -nostats -i "$RAW" -af ebur128 -f null - 2>&1 | grep -A1 "Integrated loudness" | awk '/I:/{print $2}')
G=$(python3 -c "print(round(${TARGET}-(${I}),2))")
echo "integrated ${I} LUFS → gain ${G} dB"
ffmpeg -hide_banner -loglevel error -y -i "$RAW" -af "volume=${G}dB,alimiter=limit=0.84:attack=4:release=80:level=false:latency=true" -c:a pcm_s16le -ar 48000 "$WAV"
if [ "$L" = "en" ]; then TITLE="I Let Clawd Build a Smarter Clawd — a pure-code animation about recursive self-improvement"; else TITLE="我让 Clawd 造了一个更聪明的自己 — 递归自我改进（RSI）纯代码动画"; fi
ffmpeg -hide_banner -loglevel error -y -i "$VID" -i "$WAV" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart \
  -metadata title="$TITLE" -metadata comment="https://github.com/Harryis666/clawd-rsi-explained" "$OUT"
ffprobe -v error -show_entries format=duration,size -of compact "$OUT"
