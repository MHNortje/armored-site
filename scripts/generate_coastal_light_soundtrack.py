"""Render Armored Pangolin's original, sample-free 120-second ambient loop.

Requires NumPy, SciPy and FFmpeg with libmp3lame. FFmpeg may be supplied with
--ffmpeg, discovered on PATH, or provided by the optional imageio-ffmpeg package.
The uncompressed master is temporary; only the browser-ready MP3 is published.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt


SAMPLE_RATE = 44_100
TEMPO = 64
BEAT = 60 / TEMPO
BAR = 4 * BEAT
BARS = 32
DURATION = BARS * BAR
SAMPLES = round(DURATION * SAMPLE_RATE)
RNG = np.random.default_rng(18112026)
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "audio" / "coastal-light-v3.mp3"
MIX = np.zeros((SAMPLES, 2), dtype=np.float32)


def frequency(note: int) -> float:
    return 440 * 2 ** ((note - 69) / 12)


def add(start: float, sound: np.ndarray, pan: float = 0) -> None:
    """Wrap note tails into the opening, rather than fade out at the loop point."""
    offset = round(start * SAMPLE_RATE) % SAMPLES
    angle = (max(-1, min(1, pan)) + 1) * math.pi / 4
    stereo = np.column_stack((sound * math.cos(angle), sound * math.sin(angle)))
    head = min(len(stereo), SAMPLES - offset)
    MIX[offset : offset + head] += stereo[:head]
    if head < len(stereo):
        MIX[: len(stereo) - head] += stereo[head:]


def felt_keys(note: int, velocity: float, length: float = 4.6) -> np.ndarray:
    """Rounded hammer-like keys, not string plucks, bells or sustained organ."""
    time = np.arange(round(length * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    base = frequency(note)
    attack = 1 - np.exp(-time / 0.008)
    release = np.minimum(1, np.maximum(0, length - time) / 0.16)
    result = np.zeros_like(time)
    # Short-lived upper harmonics give a soft initial articulation; a small
    # inharmonicity and two quiet detuned partials give body without a pad.
    for partial, level in enumerate((1, 0.36, 0.17, 0.055, 0.025, 0.009), 1):
        stretch = math.sqrt(1 + 0.000018 * partial * partial)
        hz = base * partial * stretch
        decay = (1.55 if note < 55 else 1.28) / partial ** 0.42
        phase = RNG.uniform(-0.05, 0.05)
        shape = np.exp(-time / decay)
        result += level * np.sin(2 * np.pi * hz * time + phase) * shape
        if partial < 3:
            result += 0.13 * level * np.sin(
                2 * np.pi * hz * 1.0007 * time + 0.14
            ) * shape
    return (velocity * result * attack * release).astype(np.float32)


def wood_mallet(note: int, velocity: float) -> np.ndarray:
    length = 2.5
    time = np.arange(round(length * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    hz = frequency(note)
    body = np.sin(2 * np.pi * hz * time) * np.exp(-time / 0.65)
    body += 0.07 * np.sin(2 * np.pi * hz * 4 * time) * np.exp(-time / 0.08)
    attack = 1 - np.exp(-time / 0.009)
    release = np.minimum(1, np.maximum(0, length - time) / 0.12)
    return (body * attack * release * velocity).astype(np.float32)


def soft_brush(velocity: float) -> np.ndarray:
    """A nearly subliminal brush texture, with no kick or snare backbeat."""
    length = 0.18
    time = np.arange(round(length * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    noise = RNG.normal(0, 1, len(time)).astype(np.float32)
    smooth = sosfilt(butter(2, [700, 2600], fs=SAMPLE_RATE, btype="bandpass", output="sos"), noise)
    envelope = np.sin(np.pi * time / length) ** 2 * np.exp(-time / 0.045)
    return (smooth * envelope * velocity).astype(np.float32)


def compose() -> None:
    # F-major/add-six/add-nine voicings: no minor-root cycle or droning bass.
    # Each harmony lasts two bars, giving the melody room to breathe.
    chords = (
        (41, (53, 57, 60, 67)),  # Fadd9
        (40, (55, 60, 62, 67)),  # Cadd9/E
        (46, (53, 57, 60, 62)),  # Bbmaj9
        (45, (53, 57, 60, 67)),  # Fadd9/A
        (46, (53, 55, 62, 65)),  # Bb6
        (48, (53, 57, 60, 67)),  # Fadd9/C
        (43, (52, 55, 60, 62)),  # Cadd9/G
        (41, (53, 57, 60, 62)),  # F6
    )
    # A simple authored call-and-response melody, with rests and small changes
    # in the second half rather than a mechanical repeating arpeggiator.
    phrases = (
        ((0.5, 65), (2, 67), (3.25, 69)),
        ((0.5, 67), (2.5, 65)),
        ((0.75, 64), (2.25, 67), (3.5, 69)),
        ((1, 67), (2.75, 64)),
        ((0.5, 65), (2, 69), (3.25, 70)),
        ((0.75, 69), (2.5, 65)),
        ((0.5, 67), (1.75, 69), (3, 67)),
        ((0.5, 65), (2.75, 60)),
        ((0.5, 62), (2, 65), (3.25, 67)),
        ((0.75, 65), (2.5, 62)),
        ((0.5, 60), (2, 65), (3.25, 69)),
        ((0.75, 67), (2.5, 65)),
        ((0.5, 64), (1.75, 67), (3.25, 62)),
        ((0.5, 64), (2.5, 60)),
        ((0.75, 65), (2.25, 67), (3.5, 69)),
        ((0.75, 67), (2.5, 65)),
    )
    for bar in range(BARS):
        start = bar * BAR
        root, voicing = chords[(bar // 2) % len(chords)]
        section = bar // 8
        energy = (0.94, 0.84, 1.0, 0.90)[section]
        # Quiet low-mid notes, with air between attacks and no sustained pad.
        add(start + 0.015, felt_keys(root, 0.040 * energy, 4.9), -0.10)
        if bar % 2:
            add(start + 2.20 * BEAT, felt_keys(root + 12, 0.017 * energy), 0.10)
        order = (0, 2, 1, 3) if bar % 2 == 0 else (1, 3, 0, 2)
        for index, beat in enumerate((0.12, 1.18, 2.16, 3.12)):
            jitter = RNG.uniform(-0.018, 0.018)
            add(start + beat * BEAT + jitter,
                felt_keys(voicing[order[index]], 0.022 * energy * RNG.uniform(0.88, 1.08)),
                (-0.28, 0.13, -0.12, 0.28)[index])

        melody = phrases[bar % len(phrases)]
        for index, (beat, note) in enumerate(melody):
            if bar >= 16 and bar % 4 == 1 and index == 1:
                note = {65: 69, 64: 67, 62: 65, 60: 64}.get(note, note)
            if bar in (7, 23) and index == len(melody) - 1:
                continue
            add(start + beat * BEAT + RNG.uniform(-0.018, 0.018),
                felt_keys(note, 0.039 * energy * RNG.uniform(0.88, 1.04), 5.1), 0.06)

        if bar % 4 == 2:
            add(start + 3.55 * BEAT, wood_mallet(voicing[2], 0.012), -0.32)
        # Restrained texture carries a relaxed pulse; deliberately no heartbeat.
        if section in (1, 2):
            for beat in (1.5, 3.5):
                add(start + beat * BEAT, soft_brush(0.012), -0.25 if beat < 2 else 0.25)


def finish() -> np.ndarray:
    # A compact room response instead of the former long ambient/drone wash.
    dry = MIX.copy()
    for tap in range(44):
        delay = 0.045 + tap * 0.028 + RNG.uniform(0, 0.018)
        gain = 0.022 * math.exp(-delay / 0.36) * (-1 if tap % 3 == 0 else 1)
        for channel in range(2):
            samples = round((delay + channel * 0.007) * SAMPLE_RATE)
            MIX[:, channel] += np.roll(dry[:, 1 - channel], samples) * gain
    MIX[:] -= MIX.mean(axis=0)
    # Circular filtering avoids an artificial silence or filter transient at
    # the seam. Gentle low/high rolloff keeps phone speakers and headphones soft.
    spectrum = np.fft.rfft(MIX, axis=0)
    frequencies = np.fft.rfftfreq(SAMPLES, 1 / SAMPLE_RATE)
    curve = (1 - np.exp(-(frequencies / 45) ** 4)) / np.sqrt(1 + (frequencies / 3600) ** 8)
    MIX[:] = np.fft.irfft(spectrum * curve[:, None], n=SAMPLES, axis=0)
    rms = float(np.sqrt(np.mean(MIX * MIX)))
    MIX[:] *= 0.105 / max(rms, 1e-9)
    peak = float(np.max(np.abs(MIX)))
    if peak > 0.82:
        MIX[:] *= 0.82 / peak
    if not np.isfinite(MIX).all():
        raise ValueError("Non-finite audio sample")
    return np.rint(np.clip(MIX, -1, 1) * 32767).astype("<i2")


def encoder_path(supplied: str | None) -> str:
    if supplied:
        return supplied
    installed = shutil.which("ffmpeg")
    if installed:
        return installed
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError as error:
        raise SystemExit("Supply --ffmpeg PATH or install imageio-ffmpeg.") from error


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg", help="Path to FFmpeg executable")
    args = parser.parse_args()
    ffmpeg = encoder_path(args.ffmpeg)
    compose()
    pcm = finish()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="armored-coastal-light-") as temporary:
        master = Path(temporary) / "coastal-light-master.wav"
        with wave.open(str(master), "wb") as wav:
            wav.setnchannels(2)
            wav.setsampwidth(2)
            wav.setframerate(SAMPLE_RATE)
            wav.writeframes(pcm.tobytes())
        subprocess.run([
            ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(master),
            "-codec:a", "libmp3lame", "-b:a", "192k", "-write_xing", "1",
            "-metadata", "title=Coastal Light - Original Ambient Loop",
            "-metadata", "artist=Armored Pangolin",
            "-metadata", "comment=Original sample-free composition. No third-party recording.",
            str(OUTPUT),
        ], check=True)
    decoded = subprocess.run([
        ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(OUTPUT),
        "-f", "f32le", "-acodec", "pcm_f32le", "-",
    ], check=True, capture_output=True).stdout
    audio = np.frombuffer(decoded, dtype="<f4").reshape(-1, 2)
    if len(audio) != SAMPLES or np.max(np.abs(audio)) >= 1:
        raise ValueError("Encoded duration or clipping validation failed")
    print(json.dumps({
        "file": str(OUTPUT), "bytes": OUTPUT.stat().st_size,
        "seconds": len(audio) / SAMPLE_RATE, "sample_rate": SAMPLE_RATE,
        "channels": 2, "tempo": TEMPO, "peak_dbfs": float(20 * np.log10(np.max(np.abs(audio)))),
        "rms_dbfs": float(20 * np.log10(np.sqrt(np.mean(audio ** 2)))),
        "loop_seam_step": float(np.max(np.abs(audio[0] - audio[-1]))),
        "master_seam_step": float(np.max(np.abs(MIX[0] - MIX[-1]))),
    }, indent=2))


if __name__ == "__main__":
    main()
