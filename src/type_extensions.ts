import { HardhatPluginConfig, HardhatPluginUserConfig } from './types.js';

declare module 'hardhat/types/config' {
  // TODO: rename config keys
  interface HardhatConfig {
    hardhatPlugin: HardhatPluginConfig;
  }

  interface HardhatUserConfig {
    hardhatPlugin?: HardhatPluginUserConfig;
  }
}
