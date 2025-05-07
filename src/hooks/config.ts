import type { HardhatGitConfig } from '../types.js';
import type {
  ConfigHooks,
  HardhatUserConfigValidationError,
} from 'hardhat/types/hooks';

const DEFAULT_CONFIG: HardhatGitConfig = {
  npmInstall: 'npm install',
};

export default async (): Promise<Partial<ConfigHooks>> => ({
  validateUserConfig: async (userConfig) => {
    const errors: HardhatUserConfigValidationError[] = [];

    // TODO: validate config

    return errors;
  },

  resolveUserConfig: async (userConfig, resolveConfigurationVariable, next) => {
    return {
      ...(await next(userConfig, resolveConfigurationVariable)),
      git: {
        ...DEFAULT_CONFIG,
        ...userConfig.git,
      },
    };
  },
});
