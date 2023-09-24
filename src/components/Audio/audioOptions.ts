import { frequencies } from './notes';

export const audioOptions: Array<{
  name: string;
  startingNote: keyof typeof frequencies;
  path: string;
}> = [
  {
    name: 'Marimba 1',
    startingNote: 'C3',
    path: '/sounds/Ensoniq-ESQ-1-Marimba-C3.wav',
  },
  {
    name: 'Marimba 2',
    startingNote: 'C5',
    path: '/sounds/marimba-c5.wav',
  },
  {
    name: 'Synth 1',
    startingNote: 'C1',
    path: '/sounds/Casio-CZ-5000-Synth-Bass-C1.wav',
  },
];
