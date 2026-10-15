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

/** The boiled icons. Lengths are pixels at the icon's size (20px, from the source SVG). */
export const boiledPipelineConfig = {
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

/** The plain icons: the upstream outlines, unchanged. */
export const plainPipelineConfig = {
  ...boiledPipelineConfig,
  boiling: {...boiledPipelineConfig.boiling, enabled: false},
  simplification: {...boiledPipelineConfig.simplification, enabled: false},
} as const satisfies PipelineConfig;

/** The pipeline settings for each icon package, by build variant. */
export const pipelineConfigs = {
  plain: plainPipelineConfig,
  boiled: boiledPipelineConfig,
} as const satisfies Record<string, PipelineConfig>;
