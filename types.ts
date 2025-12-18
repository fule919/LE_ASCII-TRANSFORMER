export interface AsciiSettings {
  resolution: number; // 0.1 to 1.0 (inverse of pixel size basically)
  contrast: number; // 0.5 to 3.0
  brightness: number; // -100 to 100
  invert: boolean;
  charSetMode: 'halftone' | 'ascii' | 'binary' | 'blocks' | 'detail';
}

export enum ProcessingState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  GENERATING_AI = 'GENERATING_AI',
}