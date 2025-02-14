import numpy as np
from scipy.io import wavfile
import os

def generate_tone(freq, duration_ms, filename):
    # Abtastrate
    sample_rate = 44100
    
    # Zeitvektor
    t = np.linspace(0, duration_ms/1000, int(sample_rate * duration_ms/1000), False)
    
    # Generiere den Ton
    tone = np.sin(2 * np.pi * freq * t)
    
    # Normalisiere auf 16-bit Ganzzahl
    tone = np.int16(tone * 32767)
    
    # Schreibe die WAV-Datei
    wavfile.write(filename, sample_rate, tone)
    
    print(f"Datei {filename} wurde erstellt.")

# Erzeuge die Töne
generate_tone(261.63, 300, "red.wav")    # C
generate_tone(293.66, 300, "blue.wav")   # D
generate_tone(329.63, 300, "yellow.wav") # E
generate_tone(349.23, 300, "green.wav")  # F

print("Alle Dateien wurden erfolgreich erstellt.")
