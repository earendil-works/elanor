export interface PipelineConfig {
  targetSize: number;
  boiling: {
    enabled: boolean;
    samplingStep: number;
    displacement: number;
    noiseFrequency: number;
    octaves: number;
    seed: number;
  };
  simplification: {
    enabled: boolean;
    tolerance: number;
  };
  output: {
    /** Largest allowed coordinate rounding step. */
    precision: number;
  };
}

/** Lengths are display pixels at targetSize unless noted otherwise. */
export const pipelineConfig = {
  targetSize: 16,
  boiling: {
    enabled: true,
    samplingStep: 0.1,
    displacement: 0.5,
    noiseFrequency: 1,
    octaves: 1,
    seed: 4,
  },
  simplification: {
    enabled: true,
    tolerance: 0.01,
  },
  output: {
    precision: 0.002,
  },
} as const satisfies PipelineConfig;
