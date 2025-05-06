import { clone } from './git.js';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import path from 'path';

export const createHardhatRuntimeEnvironmentAtGitRef = async (
  hre: HardhatRuntimeEnvironment,
  ref: string = 'HEAD',
): Promise<HardhatRuntimeEnvironment> => {
  const directory = await clone(hre.config.paths.root, ref);

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

  const tmpConfigPath = await findClosestHardhatConfig(directory);
  const tmpConfig = await import(tmpConfigPath);

  return await createHardhatRuntimeEnvironment(
    tmpConfig.default,
    { config: tmpConfigPath },
    directory,
  );
};
