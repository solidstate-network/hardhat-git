import type { HardhatPluginConfig } from '../types.js';
import type {
  ConfigHooks,
  HardhatUserConfigValidationError,
} from 'hardhat/types/hooks';

// TODO: define default config
const DEFAULT_CONFIG: HardhatPluginConfig = {};

export default async (): Promise<Partial<ConfigHooks>> => ({
  validateUserConfig: async (userConfig) => {
    const errors: HardhatUserConfigValidationError[] = [];

    // TODO: validate config

    return errors;
  },

  resolveUserConfig: async (userConfig, resolveConfigurationVariable, next) => {
    return {
      ...(await next(userConfig, resolveConfigurationVariable)),
      // TODO: rename config keys
      hardhatPlugin: {
        ...DEFAULT_CONFIG,
        ...userConfig.hardhatPlugin,
      },
    };
  },
});
