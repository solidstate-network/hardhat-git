import type { HardhatGitConfig } from '../types.js';
import type { ConfigHooks } from 'hardhat/types/hooks';

const DEFAULT_CONFIG: HardhatGitConfig = {};

export default async (): Promise<Partial<ConfigHooks>> => ({
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
