#!/usr/bin/env bash
# Master one episode's raw soundtrack to −16 LUFS (peak-limited) and mux it with the rendered video.
# usage: tools/master.sh [ep] [lang]
#   needs: out/audio_raw_ep<N>_<lang>.wav (tools/render-audio.mjs) and out/video_ep<N>_<lang>.mp4 (tools/render.mjs)
#   writes: out/clawd-rsi-v3.1-ep<N>_<lang>.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
N="${1:-1}"; L="${2:-zh}"; T="ep${N}_${L}"
RAW="out/audio_raw_${T}.wav"; WAV="out/audio_${T}.wav"; VID="out/video_${T}.mp4"; OUT="out/clawd-rsi-v3.1-${T}.mp4"
TARGET="${TARGET:--16}"
I=$(ffmpeg -hide_banner -nostats -i "$RAW" -af ebur128 -f null - 2>&1 | grep -A1 "Integrated loudness" | awk '/I:/{print $2}')
G=$(python3 -c "print(round(${TARGET}-(${I}),2))")
echo "EP${N} ${L}: integrated ${I} LUFS → gain ${G} dB"
ffmpeg -hide_banner -loglevel error -y -i "$RAW" -af "volume=${G}dB,alimiter=limit=0.75:attack=4:release=80:level=false:latency=true" -c:a pcm_s16le -ar 48000 "$WAV"
if [ "$L" = "en" ]; then
  TITLES=("" "The Ridiculous Task" "How High Has It Climbed?" "Explosion, or a Wall?" "Don't Ask Me Again")
  TITLE="Clawd Builds Clawd · EP ${N}/4 · ${TITLES[$N]}"; COMMENT="A pure-code animation about recursive self-improvement (RSI)"
else
  TITLES=("" "离谱任务" "爬到第几级了？" "爆炸，还是撞墙？" "以后都不用再问我")
  TITLE="《Clawd 造 Clawd》第 ${N} 集（共 4 集）·《${TITLES[$N]}》"; COMMENT="递归自我改进（RSI）纯代码科普动画"
fi
ffmpeg -hide_banner -loglevel error -y -i "$VID" -i "$WAV" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart \
  -metadata title="$TITLE" -metadata comment="$COMMENT" -metadata album="Clawd 造 Clawd" -metadata track="${N}/4" "$OUT"
ffprobe -v error -show_entries format=duration,size -of compact "$OUT"
