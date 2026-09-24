"""Local transcription (faster-whisper) + BPM/onset/loudness analysis for each video."""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import find_peaks

NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0)
ROOT = Path(__file__).parent


def to_wav(src: Path, dst: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-nostdin", "-loglevel", "error", "-i", str(src),
         "-vn", "-ac", "1", "-ar", "22050", str(dst)],
        check=True, stdin=subprocess.DEVNULL, capture_output=True,
        timeout=120, creationflags=NO_WINDOW,
    )


def rhythm(wav: Path) -> dict:
    sr, x = wavfile.read(wav)
    x = x.astype(np.float32) / 32768.0
    hop, win = 512, 1024
    n = 1 + (len(x) - win) // hop
    frames = np.lib.stride_tricks.sliding_window_view(x, win)[::hop][:n]
    spec = np.abs(np.fft.rfft(frames * np.hanning(win), axis=1))
    flux = np.maximum(0, np.diff(np.log1p(spec), axis=0)).sum(axis=1)
    flux = (flux - flux.mean()) / (flux.std() + 1e-9)
    fps = sr / hop
    ac = np.correlate(flux, flux, "full")[len(flux) - 1:]
    lo, hi = int(fps * 60 / 180), int(fps * 60 / 70)
    lag = lo + int(np.argmax(ac[lo:hi]))
    bpm = 60 * fps / lag
    peaks, _ = find_peaks(flux, height=1.5, distance=int(fps * 0.15))
    rms = np.sqrt((frames ** 2).mean(axis=1))
    sec = int(fps)
    loud = [round(float(20 * np.log10(rms[i:i + sec].mean() + 1e-9)), 1)
            for i in range(0, len(rms), sec)]
    return {
        "bpm_est": round(float(bpm), 1),
        "strong_onsets_s": [round(p / fps, 2) for p in peaks][:60],
        "loudness_db_per_sec": loud,
    }


def transcribe(model, wav: Path) -> list:
    segs, info = model.transcribe(str(wav), vad_filter=False, beam_size=5)
    out = [{"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
            "no_speech": round(s.no_speech_prob, 2)} for s in segs]
    return [{"lang": info.language, "lang_prob": round(info.language_probability, 2)}] + out


def main() -> None:
    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")
    ids = sys.argv[1:] or [str(i) for i in range(1, 8)]
    for i in ids:
        vdir = ROOT / f"v{i}"
        wav = vdir / "audio.wav"
        to_wav(vdir / "download" / "video.mp4", wav)
        result = {"rhythm": rhythm(wav), "transcript": transcribe(model, wav)}
        (vdir / "audio.json").write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"v{i}", json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
