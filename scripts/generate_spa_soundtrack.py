from __future__ import annotations

import math
import wave
from pathlib import Path

import numpy as np


SAMPLE_RATE = 32_000
TEMPO = 54
BEAT = 60 / TEMPO
BARS = 24
BAR = BEAT * 4
DURATION = BARS * BAR
SAMPLES = int(DURATION * SAMPLE_RATE)
RNG = np.random.default_rng(21082026)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "audio" / "gentle-spa-workshop.wav"
MIX = np.zeros((SAMPLES, 2), dtype=np.float32)


def midi(note: int) -> float:
    return 440.0 * (2.0 ** ((note - 69) / 12.0))


def add_segment(start_seconds: float, signal: np.ndarray, pan: float = 0.0) -> None:
    """Place mono audio on a circular stereo timeline for an inaudible loop seam."""
    start = int(round(start_seconds * SAMPLE_RATE)) % SAMPLES
    pan = float(np.clip(pan, -1.0, 1.0))
    left_gain = math.cos((pan + 1.0) * math.pi / 4.0)
    right_gain = math.sin((pan + 1.0) * math.pi / 4.0)
    stereo = np.column_stack((signal * left_gain, signal * right_gain)).astype(np.float32)
    first = min(len(stereo), SAMPLES - start)
    MIX[start : start + first] += stereo[:first]
    if first < len(stereo):
        MIX[: len(stereo) - first] += stereo[first:]


def warm_pad(notes: list[int], duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    t = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    attack = 1.0 - np.exp(-1.25 * t)
    release = 1.0 - np.exp(-1.35 * np.maximum(0.0, duration - t))
    envelope = attack * release
    tone = np.zeros(length, dtype=np.float32)

    for voice, note in enumerate(notes):
        frequency = midi(note)
        phase = RNG.uniform(0.0, 2.0 * np.pi)
        drift = 0.018 * np.sin(2.0 * np.pi * (0.055 + voice * 0.009) * t + phase)
        tone += np.sin(2.0 * np.pi * frequency * t + phase + drift)
        tone += 0.055 * np.sin(2.0 * np.pi * frequency * 2.0 * t + phase * 0.7)

    tone /= max(1.0, len(notes) ** 0.72)
    return (tone * envelope * amplitude).astype(np.float32)


def soft_nylon_pluck(note: int, duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    frequency = midi(note)
    period = max(18, int(round(SAMPLE_RATE / frequency)))
    excitation = RNG.uniform(-1.0, 1.0, period).astype(np.float32)
    excitation = np.convolve(excitation, np.array([0.2, 0.6, 0.2], dtype=np.float32), mode="same")
    buffer = excitation.tolist()
    raw = np.empty(length, dtype=np.float32)
    index = 0

    for sample_index in range(length):
        next_index = 0 if index + 1 == period else index + 1
        current = buffer[index]
        raw[sample_index] = current
        buffer[index] = 0.9971 * (0.52 * current + 0.48 * buffer[next_index])
        index = next_index

    raw = np.convolve(raw, np.array([0.18, 0.64, 0.18], dtype=np.float32), mode="same")
    raw = np.convolve(raw, np.array([0.15, 0.7, 0.15], dtype=np.float32), mode="same")
    t = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    envelope = (1.0 - np.exp(-32.0 * t)) * np.exp(-0.62 * t)
    envelope *= np.minimum(1.0, np.maximum(0.0, duration - t) * 4.0)
    return (np.tanh(raw * 0.82) * envelope * amplitude).astype(np.float32)


def gentle_bowl(note: int, duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    t = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    frequency = midi(note)
    envelope = (1.0 - np.exp(-5.0 * t)) * np.exp(-0.36 * t)
    envelope *= np.minimum(1.0, np.maximum(0.0, duration - t) * 2.5)
    shimmer = 0.003 * np.sin(2.0 * np.pi * 0.11 * t)
    tone = np.sin(2.0 * np.pi * frequency * t + shimmer)
    tone += 0.12 * np.sin(2.0 * np.pi * frequency * 2.006 * t + 0.4)
    return (tone * envelope * amplitude).astype(np.float32)


def soft_air(duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    noise = RNG.standard_normal(length).astype(np.float32)
    smooth = np.convolve(noise, np.ones(720, dtype=np.float32) / 720.0, mode="same")
    t = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    breathe = 0.58 + 0.42 * np.sin(2.0 * np.pi * t / 13.0 - 0.6) ** 2
    edge = np.sin(np.pi * np.clip(t / duration, 0.0, 1.0)) ** 2
    return (smooth * breathe * edge * amplitude).astype(np.float32)


# A familiar, reassuring I–V–vi–IV movement with soft extended voicings.
CHORDS = [
    [50, 54, 57, 61],  # Dmaj7/add9
    [45, 52, 57, 59],  # Aadd9
    [47, 50, 54, 59],  # Bm7
    [43, 50, 54, 59],  # Gmaj7
]
PLUCK_PATTERN = [0, 2, 1]
PLUCK_BEATS = [0.18, 1.72, 3.18]


for bar_index in range(BARS):
    chord = CHORDS[bar_index % len(CHORDS)]
    bar_start = bar_index * BAR
    level = 0.78 + 0.12 * math.sin(math.pi * bar_index / (BARS - 1))

    pad = warm_pad(chord, BAR * 1.55, 0.018 * level)
    add_segment(bar_start - 0.12, pad, -0.08 if bar_index % 2 else 0.08)

    root = warm_pad([chord[0] - 12], BAR * 1.25, 0.015 * level)
    add_segment(bar_start, root, 0.0)

    for pick_index, beat_position in enumerate(PLUCK_BEATS):
        note = chord[PLUCK_PATTERN[pick_index]]
        start = bar_start + beat_position * BEAT + RNG.uniform(-0.018, 0.018)
        pluck = soft_nylon_pluck(note, 3.4, 0.0105 * level * RNG.uniform(0.9, 1.05))
        pan = (-0.24, 0.2, -0.05)[pick_index]
        add_segment(start, pluck, pan)
        add_segment(start + 0.17, pluck * 0.11, -pan)

    if bar_index % 4 == 2:
        bowl = gentle_bowl(chord[1], 7.5, 0.0048)
        add_segment(bar_start + 2.1 * BEAT, bowl, 0.28 if bar_index % 8 else -0.28)

    if bar_index % 3 == 0:
        add_segment(bar_start, soft_air(BAR * 3.4, 0.0055), -0.42 if bar_index % 2 else 0.42)


# Wide, low-level reflections make the track float without an obvious rhythmic pulse.
MIX[:, 0] += np.roll(MIX[:, 1], int(0.19 * SAMPLE_RATE)) * 0.12
MIX[:, 1] += np.roll(MIX[:, 0], int(0.27 * SAMPLE_RATE)) * 0.1
MIX[:, 0] += np.roll(MIX[:, 0], int(0.71 * SAMPLE_RATE)) * 0.055
MIX[:, 1] += np.roll(MIX[:, 1], int(0.83 * SAMPLE_RATE)) * 0.05
MIX[:] = np.tanh(MIX * 1.06)

peak = float(np.max(np.abs(MIX)))
if peak > 0:
    MIX *= 0.64 / peak

pcm = np.clip(MIX * 32767.0, -32768, 32767).astype("<i2")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUTPUT), "wb") as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(SAMPLE_RATE)
    wav.writeframes(pcm.tobytes())

print(f"Created {OUTPUT} ({DURATION:.1f}s, {SAMPLE_RATE} Hz stereo)")
