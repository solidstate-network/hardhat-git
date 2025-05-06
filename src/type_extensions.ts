import { HardhatGitConfig, HardhatGitUserConfig } from './types.js';

declare module 'hardhat/types/config' {
  interface HardhatConfig {
    git: HardhatGitConfig;
  }

  interface HardhatUserConfig {
    git?: HardhatGitUserConfig;
  }
}
