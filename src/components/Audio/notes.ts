export const frequencies = {
  C0: 16.35,
  'C#0': 17.32,
  D0: 18.35,
  'D#0': 19.45,
  E0: 20.6,
  F0: 21.83,
  'F#0': 23.12,
  G0: 24.5,
  'G#0': 25.96,
  A0: 27.5,
  'A#0': 29.14,
  B0: 30.87,
  C1: 32.7,
  'C#1': 34.65,
  D1: 36.71,
  'D#1': 38.89,
  E1: 41.2,
  F1: 43.65,
  'F#1': 46.25,
  G1: 49.0,
  'G#1': 51.91,
  A1: 55.0,
  'A#1': 58.27,
  B1: 61.74,
  C2: 65.41,
  'C#2': 69.3,
  D2: 73.42,
  'D#2': 77.78,
  E2: 82.41,
  F2: 87.31,
  'F#2': 92.5,
  G2: 98.0,
  'G#2': 103.83,
  A2: 110.0,
  'A#2': 116.54,
  B2: 123.47,
  C3: 130.81,
  'C#3': 138.59,
  D3: 146.83,
  'D#3': 155.56,
  E3: 164.81,
  F3: 174.61,
  'F#3': 185.0,
  G3: 196.0,
  'G#3': 207.65,
  A3: 220.0,
  'A#3': 233.08,
  B3: 246.94,
  C4: 261.63,
  'C#4': 277.18,
  D4: 293.66,
  'D#4': 311.13,
  E4: 329.63,
  F4: 349.23,
  'F#4': 369.99,
  G4: 392.0,
  'G#4': 415.3,
  A4: 440.0,
  'A#4': 466.16,
  B4: 493.88,
  C5: 523.25,
  'C#5': 554.37,
  D5: 587.33,
  'D#5': 622.25,
  E5: 659.25,
  F5: 698.46,
  'F#5': 739.99,
  G5: 783.99,
  'G#5': 830.61,
  A5: 880.0,
  'A#5': 932.33,
  B5: 987.77,
  C6: 1046.5,
  'C#6': 1108.73,
  D6: 1174.66,
  'D#6': 1244.51,
  E6: 1318.51,
  F6: 1396.91,
  'F#6': 1479.98,
  G6: 1567.98,
  'G#6': 1661.22,
  A6: 1760.0,
  'A#6': 1864.66,
  B6: 1975.53,
  C7: 2093.0,
  'C#7': 2217.46,
  D7: 2349.32,
  'D#7': 2489.02,
  E7: 2637.02,
  F7: 2793.83,
  'F#7': 2959.96,
  G7: 3135.96,
  'G#7': 3322.44,
  A7: 3520.0,
  'A#7': 3729.31,
  B7: 3951.07,
  C8: 4186.01,
  'C#8': 4434.92,
  D8: 4698.63,
  'D#8': 4978.03,
  E8: 5274.04,
  F8: 5587.65,
  'F#8': 5919.91,
  G8: 6271.93,
  'G#8': 6644.88,
  A8: 7040.0,
  'A#8': 7458.62,
  B8: 7902.13,
};

type Scale = Array<keyof typeof frequencies>;
type Mode = Record<'major', Scale>;

export const diatonicScales: Record<'c', Mode> = {
  c: {
    major: [
      'C0',
      'D0',
      'E0',
      'F0',
      'G0',
      'A0',
      'B0',
      'C1',
      'D1',
      'E1',
      'F1',
      'G1',
      'A1',
      'B1',
      'C2',
      'D2',
      'E2',
      'F2',
      'G2',
      'A2',
      'B2',
      'C3',
      'D3',
      'E3',
      'F3',
      'G3',
      'A3',
      'B3',
      'C4',
      'D4',
      'E4',
      'F4',
      'G4',
      'A4',
      'B4',
      'C5',
      'D5',
      'E5',
      'F5',
      'G5',
      'A5',
      'B5',
      'C6',
      'D6',
      'E6',
      'F6',
      'G6',
      'A6',
      'B6',
      'C7',
      'D7',
      'E7',
      'F7',
      'G7',
      'A7',
      'B7',
      'C8',
      'D8',
      'E8',
      'F8',
      'G8',
      'A8',
      'B8',
    ],
  },
};
export const arpeggios: Record<'c', Mode> = {
  c: {
    major: [
      'C0',
      'E0',
      'G0',
      'C1',
      'E1',
      'G1',
      'C2',
      'E2',
      'G2',
      'C3',
      'E3',
      'G3',
      'C4',
      'E4',
      'G4',
      'C5',
      'E5',
      'G5',
      'C6',
      'E6',
      'G6',
      'C7',
      'E7',
      'G7',
      'C8',
      'E8',
      'G8',
    ],
  },
};

export function getNote(frequencyIndex: number, isArpeggio: boolean) {
  const notes = isArpeggio ? arpeggios.c.major : diatonicScales.c.major;
  let index = frequencyIndex;

  // Cycles but stays at the low end and high end for a while.
  // index = index % notes.length;

  // Randomly re-positions when exceeding the bounds of the notes array.
  if (index < 0) {
    index = 0;
  }
  if (index > notes.length - 1) {
    index = notes.length - Math.ceil(Math.random() * notes.length * 0.8);
  }

  return notes[index];
}

export function getStartingNoteFrequency(
  note: keyof typeof frequencies,
  isArpeggio: boolean
) {
  return (isArpeggio ? arpeggios : diatonicScales).c.major.indexOf(note);
}

export function getNoteFrequency(note: keyof typeof frequencies) {
  let frequency = frequencies[note];
  if (isNaN(frequency)) {
    frequency = frequencies.C0;
  }

  return frequency;
}
