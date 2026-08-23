from __future__ import annotations

import math
import wave
from pathlib import Path

import numpy as np


SAMPLE_RATE = 32_000
TEMPO = 75
BEAT = 60 / TEMPO
BAR = BEAT * 4
BARS = 24
DURATION = BARS * BAR
SAMPLES = int(DURATION * SAMPLE_RATE)
RNG = np.random.default_rng(24082026)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "audio" / "light-workshop-ambient-v2.wav"
MIX = np.zeros((SAMPLES, 2), dtype=np.float32)


def midi(note: int) -> float:
    return 440.0 * 2.0 ** ((note - 69) / 12.0)


def add(start_seconds: float, mono: np.ndarray, pan: float = 0.0) -> None:
    """Add an event to a circular stereo timeline so notes can cross the loop seam."""
    start = int(round(start_seconds * SAMPLE_RATE)) % SAMPLES
    pan = float(np.clip(pan, -1.0, 1.0))
    left = math.cos((pan + 1.0) * math.pi / 4.0)
    right = math.sin((pan + 1.0) * math.pi / 4.0)
    stereo = np.column_stack((mono * left, mono * right)).astype(np.float32)
    first = min(len(stereo), SAMPLES - start)
    MIX[start : start + first] += stereo[:first]
    if first < len(stereo):
        MIX[: len(stereo) - first] += stereo[first:]


def periodic_air(amplitude: float, brightness: float, phase_offset: float) -> np.ndarray:
    """Create a filtered, inherently periodic air layer without a loop click."""
    frequencies = np.fft.rfftfreq(SAMPLES, 1 / SAMPLE_RATE)
    phases = RNG.uniform(0, 2 * np.pi, len(frequencies)) + phase_offset
    spectrum = np.exp(1j * phases)
    spectrum *= 1.0 / np.power(1.0 + frequencies / brightness, 1.65)
    spectrum[0] = 0
    air = np.fft.irfft(spectrum, n=SAMPLES).astype(np.float32)
    air /= max(float(np.max(np.abs(air))), 1e-6)
    time = np.arange(SAMPLES, dtype=np.float32) / SAMPLE_RATE
    breathing = 0.72 + 0.13 * np.sin(2 * np.pi * time / 19.2) + 0.08 * np.sin(
        2 * np.pi * time / 11.6 + phase_offset
    )
    return (air * breathing * amplitude).astype(np.float32)


def warm_pad(notes: list[int], duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    attack = 1.0 - np.exp(-1.25 * time)
    release = 1.0 - np.exp(-1.35 * np.maximum(0.0, duration - time))
    envelope = attack * release
    tone = np.zeros(length, dtype=np.float32)

    for voice, note in enumerate(notes):
        frequency = midi(note)
        phase = RNG.uniform(0, 2 * np.pi)
        drift = 0.018 * np.sin(2 * np.pi * (0.045 + voice * 0.009) * time + phase)
        tone += np.sin(2 * np.pi * frequency * time + phase + drift)
        tone += 0.12 * np.sin(2 * np.pi * frequency * 2.002 * time + phase * 0.33)

    tone /= max(1.0, len(notes) ** 0.84)
    return (tone * envelope * amplitude).astype(np.float32)


def electric_piano(note: int, duration: float, amplitude: float) -> np.ndarray:
    """A soft, rounded keys voice with no plucked-string or guitar timbre."""
    length = int(duration * SAMPLE_RATE)
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    frequency = midi(note)
    modulator = np.sin(2 * np.pi * frequency * 2.01 * time) * np.exp(-2.0 * time)
    carrier = np.sin(2 * np.pi * frequency * time + 0.7 * modulator)
    body = carrier + 0.16 * np.sin(2 * np.pi * frequency * 0.5 * time + 0.25)
    body += 0.07 * np.sin(2 * np.pi * frequency * 3.998 * time + 0.9) * np.exp(-2.8 * time)
    envelope = (1.0 - np.exp(-22 * time)) * (
        0.62 * np.exp(-0.78 * time) + 0.38 * np.exp(-2.2 * time)
    )
    envelope *= np.minimum(1.0, np.maximum(0.0, duration - time) * 3.8)
    return (body * envelope * amplitude).astype(np.float32)


def rounded_mallet(note: int, duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    frequency = midi(note)
    tone = np.sin(2 * np.pi * frequency * time)
    tone += 0.2 * np.sin(2 * np.pi * frequency * 2.76 * time + 0.4) * np.exp(-4.6 * time)
    tone += 0.08 * np.sin(2 * np.pi * frequency * 5.41 * time + 1.1) * np.exp(-8.0 * time)
    envelope = (1.0 - np.exp(-32 * time)) * np.exp(-1.55 * time)
    envelope *= np.minimum(1.0, np.maximum(0.0, duration - time) * 5.0)
    return (tone * envelope * amplitude).astype(np.float32)


def soft_pulse(duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    frequency = 62 - 18 * np.minimum(time, 0.35)
    body = np.sin(2 * np.pi * frequency * time)
    envelope = (1.0 - np.exp(-42 * time)) * np.exp(-8.8 * time)
    return (body * envelope * amplitude).astype(np.float32)


def brushed_tick(duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    noise = RNG.standard_normal(length).astype(np.float32)
    smooth = np.convolve(noise, np.ones(13, dtype=np.float32) / 13, mode="same")
    detail = noise - smooth
    envelope = (1.0 - np.exp(-90 * time)) * np.exp(-24 * time)
    return (detail * envelope * amplitude).astype(np.float32)


# A warm D-major palette: open, modern and reassuring without becoming overly cheerful.
CHORDS = [
    [38, 45, 52, 54, 61],  # Dmaj9
    [37, 45, 52, 57, 64],  # Aadd9 / C#
    [35, 42, 50, 54, 57],  # Bm7
    [31, 43, 50, 54, 57],  # Gmaj9
]
KEY_PATTERNS = [
    [54, 61, 64, 57],
    [52, 57, 61, 64],
    [50, 54, 57, 61],
    [50, 54, 57, 62],
]

for bar_index in range(BARS):
    start = bar_index * BAR
    chord_index = bar_index % len(CHORDS)
    chord = CHORDS[chord_index]
    arc = 0.88 + 0.1 * math.sin(math.pi * bar_index / (BARS - 1))

    # Long overlapping pads make the harmony feel continuous and spacious.
    add(start - 0.3, warm_pad(chord, BAR * 1.72, 0.0175 * arc), -0.08 if bar_index % 2 else 0.08)
    add(start, warm_pad([chord[0] - 12], BAR * 1.34, 0.0115 * arc), 0.0)

    pattern = KEY_PATTERNS[chord_index]
    for step, beat_position in enumerate((0.18, 1.42, 2.28, 3.34)):
        if bar_index % 8 in (3, 7) and step == 3:
            continue
        note = pattern[(step + bar_index // 4) % len(pattern)]
        keys = electric_piano(note, 3.15, 0.0092 * arc * RNG.uniform(0.92, 1.06))
        pan = (-0.2, 0.14, -0.06, 0.23)[step]
        add(start + beat_position * BEAT, keys, pan)
        add(start + beat_position * BEAT + 0.29, keys * 0.075, -pan)

    if bar_index % 2 == 0:
        mallet_note = (69, 73, 66, 71)[chord_index]
        add(start + 2.74 * BEAT, rounded_mallet(mallet_note, 2.6, 0.0048 * arc), 0.3)

    # A quiet heartbeat rather than a drum groove.
    add(start, soft_pulse(0.62, 0.0067 * arc), -0.035)
    add(start + 2 * BEAT, soft_pulse(0.58, 0.0048 * arc), 0.035)
    for eighth in (1, 3, 5, 7):
        add(start + eighth * BEAT / 2, brushed_tick(0.24, 0.00072 * arc), 0.22 if eighth % 4 == 1 else -0.22)


# Subtle air and wide reflections keep the music dimensional behind the interface.
MIX[:, 0] += periodic_air(0.0039, 330.0, 0.4)
MIX[:, 1] += np.roll(periodic_air(0.0037, 360.0, 1.7), int(1.35 * SAMPLE_RATE))
MIX[:, 0] += np.roll(MIX[:, 1], int(0.19 * SAMPLE_RATE)) * 0.105
MIX[:, 1] += np.roll(MIX[:, 0], int(0.27 * SAMPLE_RATE)) * 0.098
MIX[:, 0] += np.roll(MIX[:, 0], int(0.68 * SAMPLE_RATE)) * 0.04
MIX[:, 1] += np.roll(MIX[:, 1], int(0.81 * SAMPLE_RATE)) * 0.038

MIX[:] = np.tanh(MIX * 1.06)
peak = float(np.max(np.abs(MIX)))
if peak:
    MIX *= 0.68 / peak

pcm = np.clip(MIX * 32767, -32768, 32767).astype("<i2")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUTPUT), "wb") as wav_file:
    wav_file.setnchannels(2)
    wav_file.setsampwidth(2)
    wav_file.setframerate(SAMPLE_RATE)
    wav_file.writeframes(pcm.tobytes())

print(f"Created {OUTPUT} ({DURATION:.1f}s, {SAMPLE_RATE} Hz stereo)")
