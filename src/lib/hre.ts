import { HardhatGitOrigin } from './hardhat_git.js';
import { deepMerge } from '@nomicfoundation/hardhat-utils/lang';
import type { HardhatConfig, HardhatUserConfig } from 'hardhat/types/config';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import path from 'node:path';

export const createHardhatRuntimeEnvironmentAtGitRef = async (
  originConfig: HardhatConfig,
  ref: string = 'HEAD',
  cloneConfig: HardhatUserConfig = {},
): Promise<HardhatRuntimeEnvironment> => {
  const origin = new HardhatGitOrigin(originConfig.paths.root);
  const clone = await origin.checkout(ref);

  if (!(await clone.isInitialized())) {
    await clone.initialize(originConfig.git.npmInstall);
  }

  const { directory } = clone;

  // TODO: fallback to local createHardhatRuntimeEnvironment function
  const { createHardhatRuntimeEnvironment } = await import(
    path.resolve(directory, 'node_modules/hardhat/dist/src/hre')
  );

  const { findClosestHardhatConfig } = await import(
    path.resolve(
      directory,
      'node_modules/hardhat/dist/src/internal/config-loading',
    )
  );

  const configPath: string = await findClosestHardhatConfig(directory);
  const config: HardhatUserConfig = (await import(configPath)).default;

  return await createHardhatRuntimeEnvironment(
    deepMerge(config, cloneConfig),
    { config: configPath },
    directory,
  );
};
