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
  optimization: {
    enabled: boolean;
    floatPrecision: number;
  };
}

/** All lengths are display pixels at targetSize, except seed and octaves. */
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
  optimization: {
    enabled: true,
    floatPrecision: 3,
  },
} as const satisfies PipelineConfig;
