import { clone, deriveDirectory, exists } from './git.js';
import type { HardhatUserConfig } from 'hardhat/config';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import path from 'node:path';

export const createHardhatRuntimeEnvironmentAtGitRef = async (
  hre: HardhatRuntimeEnvironment,
  ref: string = 'HEAD',
  npmInstall?: string,
): Promise<HardhatRuntimeEnvironment> => {
  const origin = hre.config.paths.root;

  let directory;

  if (await exists(origin, ref)) {
    directory = await deriveDirectory(origin, ref);
  } else {
    directory = await clone(origin, ref, npmInstall);
  }

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
    config,
    { config: configPath },
    directory,
  );
};
