from __future__ import annotations

import math
import wave
from pathlib import Path

import numpy as np


SAMPLE_RATE = 32_000
TEMPO = 60
BEAT = 60 / TEMPO
BAR = BEAT * 4
BARS = 24
DURATION = BARS * BAR
SAMPLES = int(DURATION * SAMPLE_RATE)
RNG = np.random.default_rng(23082026)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "audio" / "abstract-workshop-ambient-v1.wav"
MIX = np.zeros((SAMPLES, 2), dtype=np.float32)


def midi(note: int) -> float:
    return 440.0 * 2.0 ** ((note - 69) / 12.0)


def add(start_seconds: float, mono: np.ndarray, pan: float = 0.0) -> None:
    """Add a mono event to a circular stereo timeline."""
    start = int(round(start_seconds * SAMPLE_RATE)) % SAMPLES
    pan = float(np.clip(pan, -1.0, 1.0))
    left = math.cos((pan + 1.0) * math.pi / 4.0)
    right = math.sin((pan + 1.0) * math.pi / 4.0)
    stereo = np.column_stack((mono * left, mono * right)).astype(np.float32)
    first = min(len(stereo), SAMPLES - start)
    MIX[start : start + first] += stereo[:first]
    if first < len(stereo):
        MIX[: len(stereo) - first] += stereo[first:]


def lowpass(signal: np.ndarray, window: int) -> np.ndarray:
    kernel = np.ones(window, dtype=np.float32) / window
    return np.convolve(signal, kernel, mode="same").astype(np.float32)


def deep_pad(notes: list[int], duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    t = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    attack = 1.0 - np.exp(-0.9 * t)
    release = 1.0 - np.exp(-1.1 * np.maximum(0.0, duration - t))
    envelope = attack * release
    result = np.zeros(length, dtype=np.float32)

    for voice, note in enumerate(notes):
        frequency = midi(note)
        phase = RNG.uniform(0, 2 * np.pi)
        drift = 0.012 * np.sin(2 * np.pi * (0.035 + voice * 0.008) * t + phase)
        result += np.sin(2 * np.pi * frequency * t + phase + drift)
        result += 0.08 * np.sin(2 * np.pi * frequency * 1.997 * t + phase * 0.4)

    result /= max(1.0, len(notes) ** 0.8)
    return (result * envelope * amplitude).astype(np.float32)


def muted_pluck(note: int, duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    frequency = midi(note)
    period = max(20, int(round(SAMPLE_RATE / frequency)))
    excitation = lowpass(RNG.uniform(-1, 1, period).astype(np.float32), 5)
    buffer = excitation.copy()
    raw = np.zeros(length, dtype=np.float32)
    index = 0

    for sample_index in range(length):
        next_index = (index + 1) % period
        current = buffer[index]
        raw[sample_index] = current
        buffer[index] = 0.9964 * (0.57 * current + 0.43 * buffer[next_index])
        index = next_index

    raw = lowpass(lowpass(raw, 5), 5)
    t = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    envelope = (1 - np.exp(-28 * t)) * np.exp(-0.82 * t)
    envelope *= np.minimum(1.0, np.maximum(0.0, duration - t) * 5)
    return (np.tanh(raw * 0.72) * envelope * amplitude).astype(np.float32)


def soft_pulse(duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    t = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    body = np.sin(2 * np.pi * (54 - 13 * t) * t)
    air = lowpass(RNG.standard_normal(length).astype(np.float32), 28)
    envelope = (1 - np.exp(-45 * t)) * np.exp(-8.2 * t)
    return ((body * 0.72 + air * 0.28) * envelope * amplitude).astype(np.float32)


def glass_tone(note: int, duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    t = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    frequency = midi(note)
    envelope = (1 - np.exp(-18 * t)) * np.exp(-1.25 * t)
    envelope *= np.minimum(1.0, np.maximum(0.0, duration - t) * 4)
    tone = np.sin(2 * np.pi * frequency * t)
    tone += 0.22 * np.sin(2 * np.pi * frequency * 2.01 * t + 0.35)
    tone += 0.07 * np.sin(2 * np.pi * frequency * 3.97 * t + 1.1)
    return (tone * envelope * amplitude).astype(np.float32)


def room_air(duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    noise = RNG.standard_normal(length).astype(np.float32)
    broad = lowpass(noise, 330)
    slow = lowpass(noise, 1_050)
    t = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    breathe = 0.58 + 0.22 * np.sin(2 * np.pi * t / 17.0) + 0.2 * np.sin(2 * np.pi * t / 29.0 + 1.7)
    return ((broad * 0.72 + slow * 0.28) * breathe * amplitude).astype(np.float32)


# A restrained D-Dorian palette: spacious, modern and unobtrusive rather than melodic.
CHORDS = [
    [38, 45, 52, 57, 64],  # Dm9
    [36, 43, 50, 55, 62],  # Cadd9
    [38, 43, 50, 55, 60],  # Gsus/D
    [34, 41, 48, 53, 57],  # Bbmaj7
]
PLUCKS = [57, 62, 64, 60, 55, 57, 53, 52]

for bar_index in range(BARS):
    start = bar_index * BAR
    chord = CHORDS[(bar_index // 2) % len(CHORDS)]
    arc = 0.82 + 0.14 * math.sin(math.pi * bar_index / (BARS - 1))

    add(start - 0.25, deep_pad(chord, BAR * 2.55, 0.016 * arc), -0.09 if bar_index % 2 else 0.09)
    add(start, deep_pad([chord[0] - 12], BAR * 1.8, 0.012 * arc), 0)

    if bar_index % 2 == 0:
        for pick, beat_position in enumerate((0.35, 1.92, 3.16)):
            note = PLUCKS[(bar_index + pick) % len(PLUCKS)]
            event = muted_pluck(note, 3.1, 0.0082 * arc * RNG.uniform(0.9, 1.06))
            pan = (-0.25, 0.18, -0.05)[pick]
            add(start + beat_position * BEAT + RNG.uniform(-0.025, 0.025), event, pan)
            add(start + beat_position * BEAT + 0.31, event * 0.085, -pan)

    # A nearly subliminal two-beat movement keeps the track alive without becoming a drum loop.
    for beat_position in (0.0, 2.0):
        add(start + beat_position * BEAT, soft_pulse(0.72, 0.0062 * arc), -0.06 if beat_position else 0.06)

    if bar_index % 4 in (1, 3):
        note = (69, 65, 67, 62)[(bar_index // 2) % 4]
        add(start + 2.65 * BEAT, glass_tone(note, 3.8, 0.0038 * arc), 0.34 if bar_index % 4 == 1 else -0.34)


# Separate room and air layers mirror the spatial audio structure of premium WebGL sites.
MIX[:, 0] += room_air(DURATION, 0.0038)
MIX[:, 1] += np.roll(room_air(DURATION, 0.0037), int(1.7 * SAMPLE_RATE))

# Wide short reflections; deliberately low enough to stay behind the content.
MIX[:, 0] += np.roll(MIX[:, 1], int(0.22 * SAMPLE_RATE)) * 0.115
MIX[:, 1] += np.roll(MIX[:, 0], int(0.31 * SAMPLE_RATE)) * 0.105
MIX[:, 0] += np.roll(MIX[:, 0], int(0.74 * SAMPLE_RATE)) * 0.048
MIX[:, 1] += np.roll(MIX[:, 1], int(0.89 * SAMPLE_RATE)) * 0.044

# Match the beginning and end over a long crossfade so looping is not apparent.
fade = int(2.5 * SAMPLE_RATE)
curve = np.linspace(0, 1, fade, dtype=np.float32)[:, None]
seam = MIX[-fade:] * (1 - curve) + MIX[:fade] * curve
MIX[:fade] = seam
MIX[-fade:] = seam
MIX[:] = np.tanh(MIX * 1.04)

peak = float(np.max(np.abs(MIX)))
if peak:
    MIX *= 0.66 / peak

pcm = np.clip(MIX * 32767, -32768, 32767).astype("<i2")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUTPUT), "wb") as wav_file:
    wav_file.setnchannels(2)
    wav_file.setsampwidth(2)
    wav_file.setframerate(SAMPLE_RATE)
    wav_file.writeframes(pcm.tobytes())

print(f"Created {OUTPUT} ({DURATION:.1f}s, {SAMPLE_RATE} Hz stereo)")
