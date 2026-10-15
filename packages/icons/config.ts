export interface PipelineConfig {
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

/** Lengths are pixels at the icon's size (20px, from the source SVG). */
export const pipelineConfig = {
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
    precision: 0.0025,
  },
} as const satisfies PipelineConfig;

/** The upstream outlines, unchanged. */
export const unboiledPipelineConfig = {
  ...pipelineConfig,
  boiling: {...pipelineConfig.boiling, enabled: false},
  simplification: {...pipelineConfig.simplification, enabled: false},
} as const satisfies PipelineConfig;
