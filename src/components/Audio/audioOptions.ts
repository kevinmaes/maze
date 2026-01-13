import { arpeggios, diatonicScales, frequencies } from './notes';

type Note = keyof typeof frequencies;

export type AudioConfig = {
  name: string;
  startingNote?: Note;
  startingNoteIndex?: number;
  path: string;
  sequence: Note[];
  style:
    | 'ascending-cycle'
    | 'visual-syncronized-cycle'
    | 'visual-syncronized-random';
};

export const audioConfigOptions: AudioConfig[] = [
  {
    name: 'Marimba Chromatic',
    startingNote: 'C3',
    path: '/sounds/Ensoniq-ESQ-1-Marimba-C3.wav',
    sequence: Object.keys(frequencies) as Note[],
    style: 'visual-syncronized-cycle',
  },
  {
    name: 'Marimba Scale',
    startingNote: 'C3',
    path: '/sounds/Ensoniq-ESQ-1-Marimba-C3.wav',
    sequence: diatonicScales.c.major,
    style: 'visual-syncronized-random',
  },
  {
    name: 'Marimba Arpeggio',
    startingNote: 'C3',
    path: '/sounds/Ensoniq-ESQ-1-Marimba-C3.wav',
    sequence: arpeggios.c.major,
    style: 'visual-syncronized-random',
  },
  {
    name: 'Stranger Things',
    startingNoteIndex: 0,
    path: '/sounds/Casio-CZ-5000-Synth-Bass-C1.wav',
    sequence: ['C3', 'E4', 'G4', 'B4', 'C5', 'B4', 'G4', 'E4'],
    style: 'ascending-cycle',
  },
  // {
  //   name: 'Marimba 2',
  //   startingNote: 'C5',
  //   path: '/sounds/marimba-c5.wav',
  // },
  // {
  //   name: 'Synth 1',
  //   startingNote: 'C1',
  //   path: '/sounds/Casio-CZ-5000-Synth-Bass-C1.wav',
  // },
];
