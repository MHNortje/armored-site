from __future__ import annotations

import math
import wave
from pathlib import Path

import numpy as np


SAMPLE_RATE = 32_000
TEMPO = 64
BEAT = 60 / TEMPO
BARS = 32
BAR = BEAT * 4
DURATION = BARS * BAR
SAMPLES = int(DURATION * SAMPLE_RATE)
RNG = np.random.default_rng(15092001)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "audio" / "slow-modern-guitar-background.wav"
MIX = np.zeros((SAMPLES, 2), dtype=np.float32)


def midi(note: int) -> float:
    return 440.0 * (2.0 ** ((note - 69) / 12.0))


def add_segment(start_seconds: float, signal: np.ndarray, pan: float = 0.0) -> None:
    """Place a mono sound on a circular stereo timeline for a seamless loop."""
    start = int(round(start_seconds * SAMPLE_RATE)) % SAMPLES
    pan = float(np.clip(pan, -1.0, 1.0))
    left_gain = math.cos((pan + 1.0) * math.pi / 4.0)
    right_gain = math.sin((pan + 1.0) * math.pi / 4.0)
    stereo = np.column_stack((signal * left_gain, signal * right_gain)).astype(np.float32)

    first = min(len(stereo), SAMPLES - start)
    MIX[start : start + first] += stereo[:first]
    if first < len(stereo):
        MIX[: len(stereo) - first] += stereo[first:]


def clean_picked_guitar(note: int, duration: float, amplitude: float, damping: float = 0.9962) -> np.ndarray:
    """Karplus-Strong string synthesis for a clean, lightly amplified guitar tone."""
    length = int(duration * SAMPLE_RATE)
    frequency = midi(note)
    period = max(12, int(round(SAMPLE_RATE / frequency)))
    excitation = RNG.uniform(-1.0, 1.0, period).astype(np.float32)
    excitation = np.convolve(excitation, np.array([0.18, 0.64, 0.18], dtype=np.float32), mode="same")
    buffer = excitation.tolist()
    raw = np.empty(length, dtype=np.float32)
    index = 0

    for sample_index in range(length):
        next_index = 0 if index + 1 == period else index + 1
        current = buffer[index]
        next_value = buffer[next_index]
        raw[sample_index] = current
        buffer[index] = damping * (0.515 * current + 0.485 * next_value)
        index = next_index

    t = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    attack = 1.0 - np.exp(-95.0 * t)
    release = np.minimum(1.0, (duration - t) * 11.0)
    body = 0.055 * np.sin(2.0 * np.pi * 108.0 * t + 0.25) * np.exp(-2.8 * t)
    # A soft three-tap filter removes the brittle, high-pitched edge of the synthetic string.
    raw = np.convolve(raw, np.array([0.12, 0.76, 0.12], dtype=np.float32), mode="same")
    pick = RNG.standard_normal(length).astype(np.float32) * np.exp(-72.0 * t) * 0.010
    tone = np.tanh((raw + body + pick) * 1.12)
    return (tone * attack * release * amplitude).astype(np.float32)


def warm_bass(note: int, duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    t = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    frequency = midi(note)
    envelope = (1.0 - np.exp(-20.0 * t)) * np.exp(-0.92 * t) * np.minimum(1.0, (duration - t) * 12.0)
    tone = np.sin(2.0 * np.pi * frequency * t) + 0.13 * np.sin(4.0 * np.pi * frequency * t + 0.1)
    return (tone * envelope * amplitude).astype(np.float32)


def soft_kick(amplitude: float) -> np.ndarray:
    duration = 0.5
    t = np.arange(int(duration * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    phase = 2.0 * np.pi * (46.0 * t + 34.0 * (1.0 - np.exp(-11.0 * t)) / 11.0)
    return (np.sin(phase) * np.exp(-9.5 * t) * amplitude).astype(np.float32)


def soft_snare(amplitude: float) -> np.ndarray:
    duration = 0.38
    t = np.arange(int(duration * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    noise = RNG.standard_normal(len(t)).astype(np.float32)
    smooth = np.convolve(noise, np.ones(22, dtype=np.float32) / 22.0, mode="same")
    high = noise - smooth
    body = np.sin(2.0 * np.pi * 168.0 * t) * np.exp(-17.0 * t)
    envelope = (1.0 - np.exp(-80.0 * t)) * np.exp(-14.0 * t)
    return ((high * envelope + 0.24 * body) * amplitude).astype(np.float32)


def closed_hat(amplitude: float) -> np.ndarray:
    duration = 0.08
    t = np.arange(int(duration * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    noise = RNG.standard_normal(len(t)).astype(np.float32)
    smooth = np.convolve(noise, np.ones(10, dtype=np.float32) / 10.0, mode="same")
    return ((noise - smooth) * np.exp(-42.0 * t) * amplitude).astype(np.float32)


def room_air(duration: float, amplitude: float) -> np.ndarray:
    length = int(duration * SAMPLE_RATE)
    t = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    noise = RNG.standard_normal(length).astype(np.float32)
    smooth = np.convolve(noise, np.ones(145, dtype=np.float32) / 145.0, mode="same")
    envelope = np.sin(np.pi * np.clip(t / duration, 0.0, 1.0)) ** 2
    return (smooth * envelope * amplitude).astype(np.float32)


# Familiar B minor–G–D–A movement, voiced low and performed with subtle timing variation.
CHORDS = [
    ([47, 54, 59, 61, 62], 35),  # Bm(add9)
    ([43, 50, 54, 59, 62], 31),  # Gmaj7(add9)
    ([50, 57, 62, 64, 66], 26),  # Dadd9
    ([45, 52, 57, 59, 61], 33),  # Aadd9
]
PROGRESSION = [0, 1, 2, 3, 0, 1, 2, 3]
ARPEGGIO = [0, 1, 2, 3, 1, 4, 2, 3]
PICK_BEATS = [0.0, 0.56, 1.08, 1.66, 2.18, 2.74, 3.26, 3.7]


def section_level(bar_index: int) -> float:
    phrase = bar_index % BARS
    if phrase < 4 or phrase >= 28:
        return 0.68
    if phrase < 10 or phrase >= 24:
        return 0.82
    if phrase < 14 or phrase >= 20:
        return 0.94
    return 1.0


for bar_index in range(BARS):
    chord_index = PROGRESSION[bar_index % len(PROGRESSION)]
    chord, bass_note = CHORDS[chord_index]
    bar_start = bar_index * BAR
    phrase = bar_index % 8
    level = section_level(bar_index)

    # Continuous finger-picked clean guitar, voiced wide and kept behind the page content.
    for pick_index, beat_position in enumerate(PICK_BEATS):
        chord_note = chord[ARPEGGIO[pick_index] % len(chord)]
        start = bar_start + beat_position * BEAT + RNG.uniform(-0.012, 0.012)
        velocity = RNG.uniform(0.92, 1.06)
        pan = -0.34 if pick_index % 2 == 0 else 0.3
        guitar = clean_picked_guitar(chord_note, 1.75, 0.025 * level * velocity, 0.99635)
        add_segment(start, guitar, pan)
        add_segment(start + 0.022, guitar * 0.22, -pan * 0.72)

    # An occasional quiet down-strum gives the track song structure without becoming foreground music.
    if bar_index % 4 == 0:
        for string_index, note in enumerate(chord):
            start = bar_start + 0.035 + string_index * 0.04 + RNG.uniform(-0.006, 0.006)
            strum = clean_picked_guitar(note, 2.7, 0.0105 * level * RNG.uniform(0.94, 1.04), 0.99655)
            add_segment(start, strum, -0.42 + string_index * 0.2)

    # Bass begins gently, while restrained drums enter only after the opening phrase.
    bass_level = level * (0.78 if bar_index < 4 or bar_index >= 28 else 1.0)
    add_segment(bar_start, warm_bass(bass_note, 3.0, 0.052 * bass_level), -0.04)
    add_segment(bar_start + 3.12 * BEAT, warm_bass(bass_note + 7, 1.0, 0.024 * bass_level), 0.04)

    drum_level = 0.46 if bar_index < 4 or bar_index >= 28 else (0.72 if bar_index < 10 or bar_index >= 24 else 0.9)
    add_segment(bar_start, soft_kick(0.038 * drum_level), 0.0)
    add_segment(bar_start + 2.0 * BEAT + RNG.uniform(-0.008, 0.008), soft_snare(0.011 * drum_level), 0.06)
    if phrase in (3, 7):
        add_segment(bar_start + 3.3 * BEAT, soft_kick(0.021 * drum_level), 0.0)

    for eighth in range(8):
        if eighth % 2 == 0:
            continue
        swing = 0.025 * BEAT
        add_segment(
            bar_start + eighth * 0.5 * BEAT + swing + RNG.uniform(-0.008, 0.008),
            closed_hat(0.0018 * drum_level * RNG.uniform(0.88, 1.06)),
            0.24,
        )

    # An occasional lower-register answer adds shape without becoming a prominent lead melody.
    if phrase in (3, 7):
        answer_note = chord[2] + 5
        answer = clean_picked_guitar(answer_note, 2.0, 0.007 * level, 0.997)
        add_segment(bar_start + 2.72 * BEAT, answer, 0.3)
        add_segment(bar_start + 2.72 * BEAT + 0.34, answer * 0.1, -0.24)

    add_segment(bar_start + 1.45 * BEAT, room_air(2.35, 0.003), -0.36 if phrase % 2 else 0.36)


# Small circular delays create the wide clean-guitar ambience without a large, cinematic reverb.
MIX[:, 0] += np.roll(MIX[:, 1], int(0.017 * SAMPLE_RATE)) * 0.07
MIX[:, 1] += np.roll(MIX[:, 0], int(0.024 * SAMPLE_RATE)) * 0.06
MIX[:] = np.tanh(MIX * 1.12)

peak = float(np.max(np.abs(MIX)))
if peak > 0:
    MIX *= 0.72 / peak

pcm = np.clip(MIX * 32767.0, -32768, 32767).astype("<i2")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUTPUT), "wb") as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(SAMPLE_RATE)
    wav.writeframes(pcm.tobytes())

print(f"Created {OUTPUT} ({DURATION:.1f}s, {SAMPLE_RATE} Hz stereo)")
